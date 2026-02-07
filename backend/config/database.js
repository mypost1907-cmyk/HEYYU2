import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vibe-social', {
            // Modern mongoose doesn't need these options anymore
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Log database name
        console.log(`📦 Database: ${conn.connection.name}`);

    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
