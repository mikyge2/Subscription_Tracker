import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {type: String,
        required: [true, 'User Name is required'],
        trim: true,
        minLength: 4,
        maxLength: 50,
    },
    email: {
        type: String,
        required: [true, 'User Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/],
    },
    password: {
        type: String,
        required: [true, 'User Password is required'],
        minlength: 6,
    },
    role: {
        type: String,
        required: [true, 'User Role is required'],
        enum: ['factory', 'hq', 'admin'],
        default: 'factory',
    },
    plant: {
        type: String,
        enum: ['Amen', 'Plast', 'Wakene', 'Export', 'HeadQuarters'],
        default: 'HeadQuarters',
    }
},{timestamps:true});

const User =mongoose.model('User',userSchema);

export default User;