import {Router} from "express";
import authorize from "../middleware/auth.middleware.js";
import {createSubscription, getSubscription, getSubscriptions, getUserSubscriptions} from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();

subscriptionRouter.get('/', authorize, getSubscriptions);

subscriptionRouter.get('/:id', authorize, getSubscription);

subscriptionRouter.post('/', authorize, createSubscription);

subscriptionRouter.put('/:id', (req, res) => res.send({title: 'Update Subscription'}));

subscriptionRouter.delete('/:id', (req, res) => res.send({title: 'Delete Subscription'}));

subscriptionRouter.get('/user/:id', authorize, getUserSubscriptions);

subscriptionRouter.put('/:id/cancel', (req, res) => res.send({title: 'Cancel Subscription'}));

subscriptionRouter.get('/upcoming-renewals', (req, res) => res.send({title: 'Get Upcoming Renewals'}));

export default subscriptionRouter;