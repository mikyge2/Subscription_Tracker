import User from '../models/user.model.js';
import bcrypt from "bcryptjs";

export const getUsers = async (req, res, next) => {
    try{
        const users= await User.find();
        res.status(200).json({success:true,data:users});
    } catch(error){
        next(error);
    }
}

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            const error = new Error('User Not Found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({success: true, data: user});
    }catch (error) {
        next(error);
    }
}

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        // Allow only certain fields to be updated
        const allowedFields = ['name', 'email', 'password', 'role', 'plant'];
        const filteredUpdate = {};
        const salt=await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(updateData['password'], salt);
        updateData['password']=hashedPassword;
        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                filteredUpdate[field] = updateData[field];
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: filteredUpdate },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};