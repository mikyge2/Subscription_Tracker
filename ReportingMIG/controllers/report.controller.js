import AmenReport from '../models/amenReport.model.js';
import { SERVER_URL } from "../config/env.js";
import WakeneReport from "../models/wakeneReport.model.js";

export const createReport = async (req, res, next) => {
    try {
        const report = await AmenReport.create({
            ...req.body,
            reporter: req.user._id,
        });

        res.status(201).json({success: true, data: report});
    } catch (error){
        next(error);
    }
}

export const getUserReports = async (req, res, next) => {
    try {
        if(req.user.id !== req.params.id){
            const error = new Error(`You are not the owner of this account + ${req.params.id} + ${req.user.id}`);
            error.statusCode = 401;
            throw error;
        }
        const reports = await AmenReport.find({reporter: req.params.id});
        res.status(200).json({success: true, data: reports});
    } catch (error) {
        console.log(error);
        next(error);
    }
}

export const getReport = async (req, res, next) => {
    try {
        const report = await AmenReport.findById(req.params.id);
        if (!report) {
            const error = new Error('AmenReport Not Found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({success: true, data: report});
    } catch (error) {
        next(error);
    }
}

export const getReports = async (req, res, next) => {
    try{
        const report= await AmenReport.find();
        res.status(200).json({success:true,data:report});
    }
    catch(error){
        next(error);
    }
}

export const getPlantReports = async (req, res, next) => {
    const plantName=req.params.name;
    try{
        if(plantName === "Amen"){
            const reports = await AmenReport.find({plant: req.params.name});
            res.status(200).json({success: true, data: reports});
        }else if(plantName === "Plast"){
            const reports = await PlastReport.find({plant: req.params.name});
            res.status(200).json({success: true, data: reports});
        }else if(plantName === "Wakene"){
            const reports = await WakeneReport.find({plant: req.params.name});
            res.status(200).json({success: true, data: reports});
        }else if(plantName === "Export"){
            const reports = await ExportReport.find({plant: req.params.name});
            res.status(200).json({success: true, data: reports});
        }
    }
    catch(error){
        console.log(error);
        next(error);
    }
}

export const updateReport = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        // Whitelist allowed fields
        const allowedFields = ['date', 'production', 'sales', 'unitPrice', 'problemOccurred', 'solutionTaken'];
        const filteredUpdate = {};

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                filteredUpdate[field] = updateData[field];
            }
        }

        const updatedReport = await AmenReport.findByIdAndUpdate(
            id,
            { $set: filteredUpdate },
            { new: true, runValidators: true }
        );

        if (!updatedReport) {
            return res.status(404).json({ message: 'AmenReport not found' });
        }

        res.status(200).json(updatedReport);
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteReport = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedReport = await AmenReport.findByIdAndDelete(id);

        if (!deletedReport) {
            return res.status(404).json({ message: 'AmenReport not found' });
        }

        res.status(200).json({ message: 'AmenReport deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};