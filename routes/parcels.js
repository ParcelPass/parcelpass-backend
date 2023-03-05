const router = require("express").Router();
const verify = require("./verifyJWTToken");
const Parcel = require("../model/Parcel");
const User = require("../model/User");
var moment = require('moment');
var datejs = require('datejs');
// Validate register and login fields

// Get a Parcel by Parcel ID
router.get("/byId", verify, async (req, res) => {
    try {
        let parcelId = req.query.parcelId;
        if (!parcelId) {
            res.status(400).send("Wrong Query Paramaters");
            return;
        }
        const details = await Parcel.findById(parcelId).exec();
        res.send(details);
    } catch (err) {
        res.json({ message: err });
    }
});

// Get a Parcel by User ID
router.get("/byUserId", verify, async (req, res) => {
    try {
        let userId = req.user._id;
        if (!userId) {
            res.status(400).send("Wrong Query Paramaters");
            return;
        }
        const details = await Parcel.find({
            userId: userId
        })
            .exec();
        res.send(details);
    } catch (err) {
        res.json({ message: err });
    }
});

// Get all Parcels with status: 'not assigned'
router.get("/", verify, async (req, res) => {
    try {
        const details = await Parcel.find({ status: "not assigned"})
            .where("userId")
            .ne(req.user._id)
            .exec();
        res.send(details);
    } catch (err) {
        res.json({ message: err });
    }
});

// Create a Parcel
router.post("/", verify, async (req, res) => {
    // Validating the Data
    let clientDetails = await User.findById(req.user._id).exec();
    let balance = clientDetails.balance;

    // Creating a Parcel
    const parcel = new Parcel({
        startLocation: req.body.startLocation,
        endLocation: req.body.endLocation,
        content: req.body.content,
        userId: req.user._id,
        assigned: "not assigned"
    });

    try {
        const savedParcel = await parcel.save();
        res.send({ parcel: parcel._id, userId: req.user._id });
    } catch (err) {
        res.status(400).send(err);
    }
});

// Parcel status updated
router.get("/updateStatus", verify, async (req, res) => {
    try {
        let status = req.query.assigned;
        let parcelId = req.query.parcelId;
        console.log(req.query);
        if (!parcelId || !status) {
            res.status(400).send("Wrong Query Paramaters");
            return;
        }
        const details = await Parcel.findByIdAndUpdate(parcelId, {
            status: status,
        }).exec();
        res.send("Parcel status succesfully changed to " + status);
    } catch (err) {
        res.json({ message: err });
    }
});

// Parcel transport updated
router.get("/updateTransport", verify, async (req, res) => {
    try {
        let transport = req.query.transportId;
        let parcelId = req.query.parcelId;
        console.log(req.query);
        if (!parcelId || !status) {
            res.status(400).send("Wrong Query Paramaters");
            return;
        }
        const details = await Parcel.findByIdAndUpdate(parcelId, {
            transportId: transportId,
        }).exec();
        res.send("Parcel transportId succesfully changed to " + transportId);
    } catch (err) {
        res.json({ message: err });
    }
});

module.exports = router;
