const router = require("express").Router();
const verify = require("./verifyJWTToken");
const Parcel = require("../model/Parcel");
const Transport = require("../model/Transport");

// Validate trade
// const { tradeValidation } = require("../validation/tradeValidation");

// Accept and Post a favor to the trade table 
router.post("/", verify, async (req, res) => {
    // Validating the Data
    // const { error } = tradeValidation(req.body);
    // if (error) return res.status(400).send(error.details[0].message);

    const details = await Parcel.findById(req.body.parcelId).exec();
    const clientId = details.userId

    const route = [] // TODO: fix

    // Creatng a Transport
    const transport = new Transport({
        transporterId: req.user._id,
        clientId: clientId,
        route: route,
        deliveryStatus: "In Progress",
        price: 10, 
        packageId: req.body.parcelId,
        pickupTime: req.body.pickupTime,
        expectedDropoffTime: req.body.pickupTime
    });

    try {
        const savedTransport = await transport.save();
        res.send( transport );
    } catch (err) {
        res.status(400).send(err);
    }
});

// Get a Parcel by Parcel ID
router.get("/byParcelId", verify, async (req, res) => {
    try {
        let parcelId = req.query.parcelId;
        if (!parcelId) {
            res.status(400).send("Wrong Query Paramaters");
            return;
        }
        const details = await Transport.find({
            parcelId: parcelId,
        }).exec();
        res.send(details);
    } catch (err) {
        res.json({ message: err });
    }
});

// Get a Parcel by ClientId
router.get("/byClientId", verify, async (req, res) => {
    try {
        let clientId = req.query.clientId;
        if (!clientId) {
            res.status(400).send("Wrong Query Paramaters");
            return;
        }
        const details = await Transport.find({
            clientId: clientId,
        }).exec();
        res.send(details);
    } catch (err) {
        res.json({ message: err });
    }
});

// Get a Parcel by Transporter ID
router.get("/byTransporterId", verify, async (req, res) => {
    try {
        let transporterId = req.user._id;
        if (!transporterId) {
            res.status(400).send("Error: User not logged in!");
            return;
        }
        const details = await Transport.find({
            transporterId: transporterId,
        }).exec();

        var parcels = []
        for(let i = 0; i < details.length; i++)
        {
            const parcel = await Parcel.findById(details[i].parcelId);
            parcels.push(parcel);
        }
        res.send(parcels);
    } catch (err) {
        res.json({ message: err });
    }
});

module.exports = router;