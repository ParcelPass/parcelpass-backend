const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema(
    {
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        transporterId: {
            type: mongoose.Schema.Types.ObjectId,  
            ref: 'User'
        },
        route: {
            type: [String],
            required: true,
            default: []
        },
        deliveryStatus: {
            type: String,
            required: true, 
        },
        price: {
            type: Number,
            required: true
        },
        parcelId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Parcel'
        },
        pickupTime: {
            type: Date,
            required: true,
        },
        expectedDropoffTime: {
            type: Date,
            required: true
        }

    }
);

module.exports = mongoose.model('Transport', transportSchema);