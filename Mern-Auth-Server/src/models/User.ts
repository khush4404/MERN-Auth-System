import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    firstname: string,
    lastName: string;
    email: string;
    phoneNo: string;
    location: string;
    password: string;
    role: 'user' | 'admin';
    status: 'active' | 'inActive' | 'delete';
}

const UserSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNo: { type: String, required: true },
    location: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: 'user' },
    status: { type: String, required: true, default: 'active' },
    imgUrl: { type: String, required: false },
}, {
    timestamps: true,
});

const Users = mongoose.models.Users || mongoose.model<IUser>('Users', UserSchema);

const seedDatabase = async () => {
    const count = await Users.countDocuments();

    if (count === 0) {
        const password = "12345678";
        bcrypt.hash(password, 10, async (err, hash) => {
            if (err) {
                console.log("Error : ", err);
            } else {
                const user = await Users.create({
                    firstName: "Khush",
                    lastName: "Vagadiya",
                    email: "khush.dbc@gmail.com",
                    phoneNo: "1234567890",
                    location: "India",
                    password: hash,
                });
                console.log("user", user);
            }
        });
        console.log('Database seeded with default user data.');
    } else {
        console.log('Database already contains data. Seeding not required.');
    }
}

seedDatabase();

export default Users;