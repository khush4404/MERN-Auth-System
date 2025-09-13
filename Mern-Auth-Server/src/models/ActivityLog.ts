import mongoose, { Schema, Document, Types } from "mongoose";

export interface ActivityLog extends Document {
    time: Date;
    action: string;
    description: string;
    IPAddress: string;
    device: string;
    userId: Types.ObjectId;
    targetUserId?: Types.ObjectId; // Optional for self-activity
}

const ActivityLogSchema = new Schema<ActivityLog>({
    time: { type: Date, required: true, default: Date.now },
    action: { type: String, required: true },
    description: { type: String, required: true },
    IPAddress: { type: String, required: true },
    device: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetUserId: { type: Schema.Types.ObjectId, ref: 'User' }, // New field
});

const ActivityLog = mongoose.models.ActivityLog || mongoose.model<ActivityLog>('ActivityLog', ActivityLogSchema);

export default ActivityLog;
