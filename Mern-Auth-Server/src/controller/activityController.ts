import mongoose from "mongoose";
import ActivityLog from "../models/ActivityLog";
import Users from "../models/User";
import { Request, Response } from "express";

export const userActivityController = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;

        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;
        const sortField = (req.query.sortField as string) || "createdAt";
        const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;
        const searchTerm = (req.query.searchTerm as string || "").trim();
        const skip = (page - 1) * limit;

        const matchStage: any = {
            targetUserId: new mongoose.Types.ObjectId(userId),
        };

        if (searchTerm) {
            const regex = new RegExp(searchTerm, "i");
            matchStage.$or = [
                { IPAddress: regex },
                { action: regex },
            ];
        }

        const pipeline: any[] = [
            { $match: matchStage },
            {
                $lookup: {
                    from: "users", // collection name
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        ];

        // Handle case-insensitive sort
        const isStringField = [
            "time", "action", "description", "IPAddress", "device", "userId", "targetUserId"
        ].includes(sortField);

        if (isStringField) {
            pipeline.push({
                $addFields: {
                    sortFieldLower: { $toLower: `$${sortField}` },
                },
            });
            pipeline.push({
                $sort: { sortFieldLower: sortOrder },
            });
        } else {
            pipeline.push({
                $sort: { [sortField]: sortOrder },
            });
        }

        pipeline.push({
            $facet: {
                logs: [
                    { $skip: skip },
                    { $limit: limit },
                ],
                totalCount: [
                    { $count: "count" },
                ],
            },
        });

        const result = await ActivityLog.aggregate(pipeline);
        const logs = result[0]?.logs || [];
        const totalCount = result[0]?.totalCount[0]?.count || 0;

        res.json({
            user,
            logs,
            totalCount,
            page,
            limit,
        });
    } catch (error) {
        console.error("Fetch error:", error);
        return res.status(500).json({ message: "Error fetching activity log" });
    }
};

