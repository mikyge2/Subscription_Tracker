import {Router} from "express";

const subscriptionRouter = Router();

subscriptionRouter.get('/', (req, res) => res.send({title: 'GET ALL Subscription'}));

subscriptionRouter.get('/:id', (req, res) => res.send({title: 'GET Subscription Deatils by ID'}));

subscriptionRouter.post('/', (req, res) => res.send({title: 'Create Subscription'}));

subscriptionRouter.put('/:id', (req, res) => res.send({title: 'Update Subscription'}));

subscriptionRouter.delete('/:id', (req, res) => res.send({title: 'Delete Subscription'}));

subscriptionRouter.get('/user/:id', (req, res) => res.send({title: 'Get all user Subscription'}));

subscriptionRouter.put('/:id/cancel', (req, res) => res.send({title: 'Cancel Subscription'}));

subscriptionRouter.get('/upcoming-renewals', (req, res) => res.send({title: 'Get Upcoming Renewals'}));

export default subscriptionRouter;