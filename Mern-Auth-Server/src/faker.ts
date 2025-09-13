import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });


const MONGO_URI = process.env.MONGO_URI;
console.log(MONGO_URI);

if (!MONGO_URI) {
    console.error('❌ MONGO_URI not defined in .env');
    process.exit(1);
}

const userSchema = new mongoose.Schema(
    {
        firstName: String,
        lastName: String,
        email: String,
        password: String,
        role: { type: String, enum: ['user', 'admin'] },
        status: { type: String, enum: ['active', 'inActive', 'delete'] },
        imgUrl: { type: String, default: '' },
        location: String,
        phoneNo: String,
    },
    {
        timestamps: true, // ✅ Automatically adds `createdAt` and `updatedAt`
    }
);


const User = mongoose.model('User', userSchema);

const generateFakeUsers = (count = 50) => {
    return Array.from({ length: count }, () => {
        const plainPassword = faker.internet.password({
            length: 12,
            memorable: false,
            pattern: /[A-Za-z0-9!@#$%^&*()_+]/,
        });

        return {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            password: plainPassword,
            role: faker.helpers.arrayElement(['user', 'admin']),
            status: faker.helpers.arrayElement(['active', 'inActive', 'delete']),
            location: faker.location.city(), // or you can use faker.location.country()
            phoneNo: faker.phone.number(),  // generates a realistic phone number
        };

    });
};


const seedUsers = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } as mongoose.ConnectOptions);
        console.log('✅ Connected to MongoDB');

        const fakeUsers = generateFakeUsers(50);

        // Optional: hash passwords
        // for (const user of fakeUsers) {
        //     user.password = await bcrypt.hash(user.password, 10);
        // }

        await User.insertMany(fakeUsers);
        console.log('🎉 50 fake users inserted!');
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('❌ Error seeding users:', error.message);
        } else {
            console.error('❌ Error seeding users:', error);
        }
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
};

seedUsers();
