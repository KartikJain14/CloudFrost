import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Checks for the environment variable MONGO_URI, if not found, defaults to the local MongoDB Server
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/subdomain";

// Connect to MongoDB and export the connection to prevent multiple connections
export async function connectDB() {
    try {
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error connecting to MongoDB: ${err}`);
    }
}

mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
    console.error(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from DB');
});
