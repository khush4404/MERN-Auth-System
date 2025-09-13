import { Request, Response } from 'express';
import Users from '../models/User';
import { updateUserByAdminSchema } from '../schemas/user.schema';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import { tebiS3 } from '../utils/tebiClient';
import { v4 as uuidv4 } from 'uuid';
import ActivityLog from '../models/ActivityLog';
import { getClientDevice } from '../utils/deviceParser';

export const allUsers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;
        const sortField = req.query.sortField as string || 'createdAt';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
        const searchTerm = (req.query.searchTerm as string || "").trim();
        const filterRole = (req.query.filterRole as string || "").trim();
        const filterStatus = (req.query.filterStatus as string || "").trim();
        const skip = (page - 1) * limit;

        const isStringField = ['firstName', 'lastName', 'email'].includes(sortField);

        const matchStage: any = {};

        if (searchTerm) {
            const regex = new RegExp(searchTerm, 'i');
            matchStage.$or = [
                { firstName: regex },
                { lastName: regex },
                { email: regex }
            ];
        }

        if (filterRole) {
            matchStage.role = filterRole;
        }

        if (filterStatus) {
            matchStage.status = filterStatus;
        }

        const pipeline: any[] = [];

        if (!req.userId) return;

        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        if (isStringField) {
            pipeline.push({
                $addFields: {
                    sortFieldLower: { $toLower: `$${sortField}` },
                }
            });
            pipeline.push({
                $sort: {
                    sortFieldLower: sortOrder,
                }
            });
        } else {
            pipeline.push({
                $sort: {
                    [sortField]: sortOrder,
                }
            });
        }

        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limit });

        const [users, totalUsers] = await Promise.all([
            Users.aggregate(pipeline),
            Users.countDocuments(matchStage),
        ]);

        res.status(200).json({
            users,
            curUser: req.userId,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error("Fetch error:", error);
        return res.status(500).json({ message: "Error Find Data" });
    }
};

export const deleteAdminController = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const user = await Users.findOne({
            _id: userId,
            status: { $in: ["active", "inActive"] },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found or already deleted" });
        }

        user.status = "delete";
        await user.save();

        await ActivityLog.create({
            userId: req.userId,
            targetUserId: user._id,
            time: new Date(),
            action: "Deleted user",
            description: `Deleted user (${user.email}) by admin`,
            IPAddress: req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.socket.remoteAddress || "unknown",
            device: getClientDevice(req.headers["user-agent"]),
        });

        return res.status(200).json({ message: "User deleted successfully" });
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAdminUserDetail = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const user = await Users.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user, message: "User Find successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: (err as Error).message });
    }
};

export const editAdminController = async (req: Request, res: Response) => {
    try {
        const { error, value } = updateUserByAdminSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { firstName, lastName, email, role, status, location, phoneNo } = value;
        const userId = req.params.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await Users.findOne({
            _id: userId,
            status: { $in: ["active", "inActive"] },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let imgUrl = user.imgUrl;

        if (req.file) {
            if (user.imgUrl) {
                const deleteCommand = new DeleteObjectCommand({
                    Bucket: process.env.TEBI_BUCKET,
                    Key: `users/${user.imgUrl}`,
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
            imgUrl = `${uuid}${fileExt}`;
        }

        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.role = role;
        user.status = status;
        user.location = location;
        user.phoneNo = phoneNo;
        if (imgUrl) user.imgUrl = imgUrl;
        await user.save();

        await ActivityLog.create({
            userId: req.userId,
            targetUserId: user._id,
            time: new Date(),
            action: "Updated user details",
            description: `Updated details of user (${user.email})`,
            IPAddress: req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.socket.remoteAddress || "unknown",
            device: getClientDevice(req.headers["user-agent"]),
        });

        return res.status(200).json({ message: "Profile updated successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: (err as Error).message });
    }
};
