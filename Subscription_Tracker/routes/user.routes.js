import {Router} from 'express';
import authorize from "../middleware/auth.middleware.js";
import {getUser, getUsers} from "../controllers/user.controller.js";
const userRouter = Router();
userRouter.get('/', getUsers);
userRouter.get('/:id', authorize, getUser);
userRouter.post('/', (req, res) =>
    res.send({title: "CREATE NEW USER"}));
userRouter.put('/:id', (req, res) =>
    res.send({title: "UPDATE USER by ID"}));
userRouter.delete('/:id', (req, res) =>
    res.send({title: "DELETE USER by ID"}));

export default userRouter;
