import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from 'bcryptjs'
import {JWT_SECRET, JWT_Expires_IN} from "../config/env.js";
import jwt from 'jsonwebtoken';
export const signUp = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        const {name, email, password}=req.body;

        const existingUser= await User.findOne({ email });
        if(existingUser){
            const error = new Error('User already exists');
            error.statusCode = 409;
            throw error;
        }
        // Hash Password
        const salt=await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create([{name, email, password:hashedPassword}], {session:session});

        const token = jwt.sign({id: newUser[0]._id}, JWT_SECRET, {expiresIn: JWT_Expires_IN});
        await session.commitTransaction();
        session.endSession();
        res.status(201).json({
            success:true,
            data: {user: newUser[0],
                token}
        });

    }catch(error){
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

export const signIn = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        const {email, password}=req.body;

        const user= await User.findOne({ email });
        if(!user){
            const error = new Error('User Not Found');
            error.statusCode = 404;
            throw error;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            const error = new Error('Invalid Password');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign({userID: user._id}, JWT_SECRET, {expiresIn: JWT_Expires_IN});
        res.status(201).json({
            success:true,
            message:"User Signed in Successfully",
            data: {
                token,
                user
            }
        });
    }catch(error){
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

export const signOut = async (req, res, next) => {

}