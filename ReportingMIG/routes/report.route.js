import {Router} from "express";
import authorize from "../middlewares/auth.middleware.js";
import {
    createReport,
    deleteReport,
    getReport,
    getReports,
    getUserReports,
    getPlantReports,
    updateReport
} from "../controllers/report.controller.js";

const reportRouter = Router();

reportRouter.get('/', authorize, getReports);

reportRouter.get('/:id', authorize, getReport);

// reportRouter.get('/plant/:name', authorize, getPlantReports);
reportRouter.get('/plant/:name', authorize, getReports);

reportRouter.get('/user/:id', authorize, getUserReports);

reportRouter.post('/', authorize, createReport);

reportRouter.put('/:id', updateReport);

reportRouter.delete('/:id', deleteReport);

export default reportRouter;