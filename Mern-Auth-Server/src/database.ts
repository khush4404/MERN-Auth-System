import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URL = process.env.MONGO_URI;
if (!MONGO_URL) {
    throw new Error("MONGO_URI environment variable is not defined");
}
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        // console.log(mongoose.modelNames());
        console.log("🚀 MongoDB Connected!");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1);
    }
};
export default connectDB;
