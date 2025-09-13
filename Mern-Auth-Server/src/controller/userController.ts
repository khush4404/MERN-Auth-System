import { Request, Response } from 'express';
import { getClientDevice } from "../utils/deviceParser";

// Extend Express Request type to include userId
declare module 'express' {
    interface Request {
        userId?: string;
    }
}
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import Users from '../models/User';
import { serialize } from 'cookie';
import { createUserSchema, resetPasswordSchema, updateUserSchema } from '../schemas/user.schema';
import { tebiS3 } from '../utils/tebiClient';
import { sendMail } from '../utils/sendMail';
import ActivityLog from '../models/ActivityLog';

const SECRET = process.env.JWT_SECRET || "fallbackSecret";

const otpStore = new Map<string, string>();

export const checkEmailExists = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        const user = await Users.findOne({ email });
        return res.status(200).json({ exists: !!user });
    } catch (error) {
        return res.status(500).json({ message: "Error checking email." });
    }
};

export const verifyAuth = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ valid: false, message: "Unauthorized" });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, SECRET) as { userId: string };
    } catch (err) {
        return res.status(401).json({ valid: false, message: "Invalid token" });
    }

    try {
        const user = await Users.findOne({
            _id: decoded.userId,
            status: "active"
        }).select("firstName lastName email imgUrl role location phoneNo");

        if (!user) {
            return res.status(404).json({ valid: false, message: "User not found" });
        }

        return res.status(200).json({
            valid: true,
            userId: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            location: user.location,
            phoneNo: user.phoneNo,
            imgUrl: user.imgUrl,
        });
    } catch (err) {
        console.error("DB error during verifyAuth:", err);
        return res.status(500).json({ valid: false, message: "Server error" });
    }
};

export const registerController = async (req: Request, res: Response) => {
    try {
        const { error, value } = createUserSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { firstName, lastName, email, password, phone, location } = value;
        const role = req.body.role || "user";
        const status = req.body.status || "active";
        const existingUser = await Users.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ status: "error", message: "Email already exists" });
        }

        let imgUrl = '';
        if (!existingUser && req.file) {
            const fileExt = path.extname(req.file.originalname);
            const uuid = uuidv4(); // 👈 Generate UUID only once
            const uniqueFileName = `users/${uuid}${fileExt}`;

            const uploadCommand = new PutObjectCommand({
                Bucket: process.env.TEBI_BUCKET,
                Key: uniqueFileName,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
                ACL: "public-read",
            });

            await tebiS3.send(uploadCommand);
            imgUrl = `${uuid}${fileExt}`; // 👈 Use same UUID here for DB
        }


        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new Users({
            firstName,
            lastName,
            email,
            phoneNo: phone,
            location,
            password: hashedPassword,
            imgUrl,
            role,
            status,
        });

        await newUser.save();

        await ActivityLog.create({
            userId: newUser._id,
            targetUserId: newUser._id,
            time: new Date(),
            action: "Create",
            description: "Created new user",
            IPAddress: req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.socket.remoteAddress || "unknown",
            device: getClientDevice(req.headers["user-agent"]),
        });


        res.status(201).json({ status: "success", user: newUser });
    } catch (err) {
        res.status(500).json({ status: "error", message: (err as Error).message });
    }
};

export const loginController = async (req: Request, res: Response) => {
    try {

        const { email, password } = req.body;
        const user = await Users.findOne({ email, status: "active" });

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: "1d" });

        const serialized = serialize("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",

            sameSite: "strict",
            maxAge: 60 * 60 * 24,
            path: "/",
        });

        await ActivityLog.create({
            userId: user._id,
            targetUserId: user._id,
            time: new Date(),
            action: "Login",
            description: "Successfully logged in",
            IPAddress: req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.socket.remoteAddress || "unknown",
            device: getClientDevice(req.headers["user-agent"]),
        });

        res.setHeader("Set-Cookie", serialized);
        res.json({
            userId: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            status: user.status,
            phoneNo: user.phoneNo,
            location: user.location,
            imgUrl: user.imgUrl,
        });

    } catch {
        res.status(500).json({ message: "Server error" });
    }
};

export const getUserDetail = async (req: Request, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await Users.findById({ _id: req.userId, status: "active" }).select("firstName lastName email imgUrl location phoneNo");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: (err as Error).message });
    }
}

export const forgotController = async (req: Request, res: Response) => {
    try {
        const { email, step, otp, password, confirmPassword } = req.body;

        const user = await Users.findOne({ email, status: "active" });
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // Step 1: Send OTP
        if (step === 1) {
            const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
            otpStore.set(email, generatedOtp);

            await sendMail(
                email,
                "Password Reset OTP",
                `Your OTP for password reset is: ${generatedOtp}`
            );

            return res.status(200).json({ message: "OTP sent successfully" });
        }

        // Step 2: Verify OTP
        if (step === 2) {
            const storedOtp = otpStore.get(email);
            if (storedOtp !== otp) {
                return res.status(400).json({ message: "Invalid OTP" });
            }
            return res.status(200).json({ message: "OTP verified" });
        }

        // Step 3: Reset Password
        if (step === 3) {
            if (password !== confirmPassword) {
                return res.status(400).json({ message: "Passwords do not match" });
            }

            // Check if new password is same as current password
            const isSame = await bcrypt.compare(password, user.password);
            if (isSame) {
                return res.status(402).json({ message: "New password must be different from the current password" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
            await user.save();
            otpStore.delete(email);

            await ActivityLog.create({
                userId: user._id,
                targetUserId: user._id,
                time: new Date(),
                action: "Login",
                description: "Changed password through forgot password",
                IPAddress: req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.socket.remoteAddress || "unknown",
                device: getClientDevice(req.headers["user-agent"]),
            });

            return res.status(200).json({ message: "Password reset successful" });
        }


        return res.status(400).json({ message: "Invalid step" });
    } catch (error) {
        return res.status(500).json({ message: (error as Error).message });
    }
};

export const logoutController = async (req: Request, res: Response) => {
    const userId = req.userId;

    if (userId) {
        try {
            await ActivityLog.create({
                userId: userId,
                targetUserId: userId,
                time: new Date(),
                action: "Logout",
                description: "User manually logged out",
                IPAddress:
                    req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ||
                    req.socket.remoteAddress ||
                    "unknown",
                device: getClientDevice(req.headers["user-agent"]),
            });
        } catch (err) {
            console.error("Failed to log logout activity:", err);
        }
    }

    // Clear token
    const serialized = serialize("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: -1,
        path: "/",
    });

    res.setHeader("Set-Cookie", serialized);
    return res.status(200).json({
        status: "success",
        message: "Logged out",
    });
};

export const resetPasswordController = async (req: Request, res: Response) => {
    try {
        const { error } = resetPasswordSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { oldPassword, newPassword, confirmPassword } = req.body;
        console.log(req.userId);

        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New passwords do not match" });
        }

        const user = await Users.findById({ _id: req.userId, status: "active" });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        await user.save();

        await ActivityLog.create({
            userId: user._id,
            targetUserId: user._id,
            time: new Date(),
            action: "Update",
            description: "Updated password",
            IPAddress: req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.socket.remoteAddress || "unknown",
            device: getClientDevice(req.headers["user-agent"]),
        });


        return res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: (err as Error).message });
    }
}

export const updateProfileController = async (req: Request, res: Response) => {
    try {
        const { error, value } = updateUserSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { firstName, lastName, email, location, phoneNo } = value;

        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await Users.findById({ _id: req.userId, status: "active" });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        let imgUrl = user.imgUrl;

        if (req.file) {
            // ❌ Delete old image if it exists
            if (user.imgUrl) {
                const deleteCommand = new DeleteObjectCommand({
                    Bucket: process.env.TEBI_BUCKET,
                    Key: `users/${user.imgUrl}`, // the actual key in S3
                });

                try {
                    await tebiS3.send(deleteCommand);
                } catch (deleteErr) {
                    console.error("Failed to delete old image:", deleteErr);
                }
            }

            const fileExt = path.extname(req.file.originalname);
            const uuid = uuidv4();
            const uniqueFileName = `users/${uuid}${fileExt}`;

            const uploadCommand = new PutObjectCommand({
                Bucket: process.env.TEBI_BUCKET,
                Key: uniqueFileName,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
                ACL: "public-read",
            });

            await tebiS3.send(uploadCommand);
            imgUrl = `${uuid}${fileExt}`; // update for DB
        }
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.phoneNo = phoneNo;
        user.location = location;
        if (imgUrl) {
            user.imgUrl = imgUrl;
        }
        await user.save();
        await ActivityLog.create({
            userId: user._id,
            targetUserId: user._id,
            time: new Date(),
            action: "Update",
            description: "Updated profile details",
            IPAddress: req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.socket.remoteAddress || "unknown",
            device: getClientDevice(req.headers["user-agent"]),
        });

        return res.status(200).json({ message: "Profile updated successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: (err as Error).message });
    }
}

export const deleteUserController = async (req: Request, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await Users.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 🟡 Mark user as deleted
        user.status = "delete";

        await ActivityLog.create({
            userId: user._id,
            targetUserId: user._id,
            time: new Date(),
            action: "Delete",
            description: "Deleted account",
            IPAddress: req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.socket.remoteAddress || "unknown",
            device: getClientDevice(req.headers["user-agent"]),
        });

        await user.save();

        // ❌ Clear token
        const serialized = serialize("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",

            sameSite: "strict",
            maxAge: -1,
            path: "/",
        });
        res.setHeader("Set-Cookie", serialized);

        return res.status(200).json({ message: "Account soft-deleted successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: (err as Error).message });
    }
};

export const userMessages = async (req: Request, res: Response) => {
    try {
        if (!req.userId) return;

        const onlineUsers = req.app.locals.onlineUsers;
        const lastSeenMap = req.app.locals.lastSeenMap;

        const curUser = await Users.findById(req.userId);

        const users = await Users.aggregate([
            { $match: { status: 'active' } },
        ]);

        const usersWithStatus = users.map(user => ({
            ...user,
            isOnline: onlineUsers.has(user._id.toString()),
            lastSeen: lastSeenMap.get(user._id.toString())?.toISOString() || null
        }));

        res.status(200).json({
            users: usersWithStatus,
            curUser,
        });

    } catch (error) {
        console.error("Fetch error:", error);
        return res.status(500).json({ message: "Error Find Data" });
    }
};
