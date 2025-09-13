import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Users from "../models/User";
import multer from "multer";

const SECRET = process.env.JWT_SECRET || "fallbackSecret";

export const verifyAuthMiddleware = async (
    req: Request & { userId?: string },
    res: Response,
    next: NextFunction
): Promise<void> => {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const decoded = jwt.verify(token, SECRET) as { userId: string };
        const user = await Users.findOne({ _id: decoded.userId, status: "active" });

        if (!user) {
            res.status(403).json({ message: "Access denied (user inactive or deleted)" });
            return;
        }

        req.userId = user._id.toString();
        next();
    } catch {
        res.status(401).json({ message: "Invalid token" });
    }
};

export const adminAuthMiddleware = async (
    req: Request & { userId?: string },
    res: Response,
    next: NextFunction
): Promise<void> => {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ message: "Unauthorized" });
        return
    }

    try {
        const decoded = jwt.verify(token, SECRET) as { userId: string };
        const user = await Users.findOne({ _id: decoded.userId, status: "active" });

        if (!user || user.role !== "admin") {
            res.status(403).json({ message: "Admin access only" });
            return
        }

        req.userId = user._id.toString();
        next();
    } catch {
        res.status(401).json({ message: "Invalid token" });
    }
};


const upload = multer({ storage: multer.memoryStorage() });
export const registerRouteMiddleware = upload.single("profileImage");