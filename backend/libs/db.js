import mongoose from "mongoose";

const DbCon = async () => {
    try {
        // Use MONGODB_URI for main app DB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Mongodb is connected');
    } catch (error) {
        console.log('mongodb connection error', error);
    }
};

export default DbCon;