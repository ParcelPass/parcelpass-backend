const mongoose = require('mongoose');

const parcelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            max: 255,
            min: 3
        },
        description: {
            type: String,
            required: true,
            max: 1024,
            min: 6
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        transportId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,        // null until assigned
            ref: 'Transport'
        },
        assigned:{
            type: Boolean,
            required: true,
            default: false
        },
        startLocation: {
            type: String,
            required: true,
            max: 1024,
            min: 6
        },
        endLocation: {
            type: String,
            required: true,
            max: 1024,
            min: 6
        }
    }
);

module.exports = mongoose.model('Parcel', parcelSchema);