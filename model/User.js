const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            max: 255,
            min: 3
        },
        email: {
            type: String,
            required: true,
            max: 1024,
            min: 6
        },
        password: {
            type: String,
            required: true,
            max: 1024,
            min: 6
        },
        balance: {
            type: Number,
            required: true,
            default: 100
        },
        savedEmissions: {
            type: Number, 
            required: true,
            default: 0
        },
        transportHistory: {
            type: [mongoose.Schema.Types.ObjectId],
            required:  true, 
            default: []
        }
    }
);

module.exports = mongoose.model('User', userSchema);