import {JWT_SECRET} from "../config/env.js";
import jwt from 'jsonwebtoken';
import User from "../models/user.model.js";
const authorize = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if(!token){ return res.status(401).json({message: "Unauthorized Token"}); }
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded.userID);

        if(!user){return res.status(401).json({message: "Unauthorized User"}); }

        req.user = user;

        next();
    } catch (error) {
        res.status(401).json({message: 'unauthorized', error: error.message});
        next(error);
    }
}

export default authorize;