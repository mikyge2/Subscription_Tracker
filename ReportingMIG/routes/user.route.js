import {Router} from 'express';
import {deleteUser, getUser, getUsers, updateUser} from "../controllers/user.controller.js";
import authorize from "../middlewares/auth.middleware.js";
import {signUp} from "../controllers/auth.controller.js";

const userRouter = Router();

userRouter.get('/', getUsers);
userRouter.get('/:id', authorize, getUser);
userRouter.post('/', signUp);   // Create User shared with auth signup
userRouter.put('/:id', updateUser);
userRouter.delete('/:id', deleteUser);

export default userRouter;
