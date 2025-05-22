import {Router} from 'express';
import {signIn, signOut, signUp} from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/sign-up",  signUp);
authRouter.post("/sign-in",  signIn);
authRouter.post("/sign-out",  signOut); // Not Setup but may be trigger ui change

export default authRouter;