import mongoose from 'mongoose';
import {DB_URI, NODE_ENV} from '../config/env.js';

if(!DB_URI){
    throw new Error('MongoDB URI is missing');
}

const connectToDatabase = async ()=>{
    try{
        await mongoose.connect(DB_URI);
        console.log(`MongoDB Connected in ${NODE_ENV} mode`);
    }
    catch(error){
        console.error('Error trying to connect to MongoDB', error);
        process.exit(1)
    }
}

export default connectToDatabase;