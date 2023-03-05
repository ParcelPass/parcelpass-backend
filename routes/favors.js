const router = require("express").Router();
const verify = require("./verifyJWTToken");
const Favor = require("../model/Favor");
const User = require("../model/User");
var moment = require('moment');
var datejs = require('datejs');
// Validate register and login fields
const { favorValidation } = require("../validation/favorValidation");

const getValidStartTime = () => {
    const nowDateObj = new Date(Date.now());
    // console.log(date);
    var oldDateObj = moment(nowDateObj).subtract(60, 'm').toDate();
    return oldDateObj;
};

// Get a Favor by Favor ID
router.get("/byCategory", verify, async (req, res) => {
    try {
        let category = req.query.category;
        let validDate = getValidStartTime();
        if (!category) {
            res.status(400).send("Wrong Query Paramaters");
            return;
        }
        const details = await Favor.find({
            category: category,
            status: "Requested",
            favorRequestTime: {"$gt": validDate}
        })
            .where("favoreeId")
            .ne(req.user._id)
            .sort({favorRequestTime: 'desc'})
            .exec();
        res.send(details);
    } catch (err) {
        res.json({ message: err });
    }
});

// Get a Favor by Favor ID
router.get("/byId", verify, async (req, res) => {
    try {
        let favorId = req.query.favorId;
        if (!favorId) {
            res.status(400).send("Wrong Query Paramaters");
            return;
        }
        const details = await Favor.findById(favorId).exec();
        res.send(details);
    } catch (err) {
        res.json({ message: err });
    }
});

// Get a Favor by Favoree ID
router.get("/byFavoreeId", verify, async (req, res) => {
    try {
        let favoreeId = req.query.favoreeId;
        let validDate = getValidStartTime();
        if (!favoreeId) {
            res.status(400).send("Wrong Query Paramaters");
            return;
        }
        const details = await Favor.find({
            favoreeId: favoreeId,
            favorRequestTime: {"$gt": validDate}
        })
            .sort({ favorRequestTime: "desc" })
            .exec();
        res.send(details);
    } catch (err) {
        res.json({ message: err });
    }
});

// Get all Favors with status: 'Requested'
router.get("/", verify, async (req, res) => {
    let validDate = getValidStartTime();
    try {
        const details = await Favor.find({ status: "Requested", favorRequestTime: {"$gt": validDate} })
            .where("favoreeId")
            .ne(req.user._id)
            .sort({ favorRequestTime: "desc" })
            .exec();
        res.send(details);
    } catch (err) {
        res.json({ message: err });
    }
});

//Create a New Favor
router.post("/", verify, async (req, res) => {
    // Validating the Data
    let favoreeDetails = await User.findById(req.user._id).exec();
    let favorCoins = favoreeDetails.favorCoins;
    const { error } = favorValidation(req.body, req.user);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    if (favorCoins < req.body.favorCoins) {
        return res
            .status(400)
            .send("Favor Coins can't be more than account balance.");
    }

    // Creatng a Favor
    const favor = new Favor({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        favoreeId: req.user._id,
        favorCoins: req.body.favorCoins,
    });

    try {
        const savedFavor = await favor.save();
        res.send({ favor: favor._id, favoreeId: req.user._id });
    } catch (err) {
        res.status(400).send(err);
    }
});

router.delete("/byId", verify, async (req, res) => {
    try {
        let favorId = req.query.favorId;
        if (!favorId) {
            res.status(400).send("Wrong Query Paramaters");
            return;
        }
        const details = await Favor.findByIdAndRemove(favorId).exec();
        res.send(details);
    } catch (err) {
        res.json({ message: err });
    }
});

router.get("/updateStatus", verify, async (req, res) => {
    try {
        let status = req.query.status;
        let favorId = req.query.favorId;
        console.log(req.query);
        if (!favorId || !status) {
            res.status(400).send("Wrong Query Paramaters");
            return;
        }
        const details = await Favor.findByIdAndUpdate(favorId, {
            status: status,
        }).exec();
        res.send("Favor status succesfully changet to " + status);
    } catch (err) {
        res.json({ message: err });
    }
});

module.exports = router;
