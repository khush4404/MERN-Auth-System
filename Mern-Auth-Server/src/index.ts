import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./database";
import userRoutes from "./routes/userroute";
import adminRoutes from "./routes/adminRoute";
import activityRoutes from "./routes/activityRoute";

dotenv.config();

const app = express();

app.set("trust proxy", true);
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.use("/", userRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/activity", activityRoutes);

const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
        });
    })
    .catch(() => {
        throw Error("❌ 501, Unable to connect to database");
    });

