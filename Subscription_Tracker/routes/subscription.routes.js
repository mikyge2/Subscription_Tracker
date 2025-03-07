import {Router} from "express";

const subscriptionRouter = Router();

subscriptionRouter.get('/', (req, res) => res.send({title: 'GET ALL Subscription'}));

export default subscriptionRouter;