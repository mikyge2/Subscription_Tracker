import {Router} from 'express';
const userRouter = Router();
userRouter.get('/', (req, res) =>
    res.send({title: "GET ALL USERS"}));
userRouter.get('/:id', (req, res) =>
    res.send({title: "GET USER Details"}));
userRouter.post('/', (req, res) =>
    res.send({title: "CREATE NEW USER"}));
userRouter.put('/:id', (req, res) =>
    res.send({title: "UPDATE USER by ID"}));
userRouter.delete('/:id', (req, res) =>
    res.send({title: "DELETE USER by ID"}));

export default userRouter;