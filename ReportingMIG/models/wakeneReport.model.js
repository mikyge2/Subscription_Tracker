// models/Report.js
import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    production: {
        '360ml': { type: Number, default: 0 },
        '600ml': { type: Number, default: 0 },
        '1L': { type: Number, default: 0 },
        '2L': { type: Number, default: 0 }
    },
    sales: {
        '360ml': { type: Number, default: 0 },
        '600ml': { type: Number, default: 0 },
        '1L': { type: Number, default: 0 },
        '2L': { type: Number, default: 0 }
    },
    unitPrice: {
        '360ml': { type: Number, required: true, default: 1 },
        '600ml': { type: Number, required: true, default: 1 },
        '1L': { type: Number, required: true, default: 1 },
        '2L': { type: Number, required: true, default: 1 }
    },
    problemOccurred: {
        type: String,
        default: 'None'
    },
    solutionTaken: {
        type: String,
        default: 'None'
    },
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    reporterName: {
        type: String,
        ref: 'UserName',
        required: true,
        default: 'UnNamed'
    }
}, {timestamps: true});

const WakeneReport = mongoose.model('WakeneReport', reportSchema);

export default WakeneReport;