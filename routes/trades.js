const router = require("express").Router();
const verify = require("./verifyJWTToken");
const Favor = require("../model/Favor");
const Trade = require("../model/Trade");

// Validate trade
const { tradeValidation } = require("../validation/tradeValidation");

// Accept and Post a favor to the trade table 
router.post("/", verify, async (req, res) => {
    // Validating the Data
    const { error } = tradeValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const details = await Favor.findById(req.body.favorId).exec();
    const favoreeId = details.favoreeId
    // Creatng a Favor
    const trade = new Trade({
        favorerId: req.user._id,
        favoreeId: favoreeId,
        favorId: req.body.favorId
    });

    try {
        const savedTrade = await trade.save();
        res.send( trade );
    } catch (err) {
        res.status(400).send(err);
    }
});

// Get a Favor by Favor ID
router.get("/byFavorId", verify, async (req, res) => {
    try {
        let favorId = req.query.favorId;
        if (!favorId) {
            res.status(400).send("Wrong Query Paramaters");
            return;
        }
        const details = await Trade.find({
            favorId: favorId,
        }).exec();
        res.send(details);
    } catch (err) {
        res.json({ message: err });
    }
});

// Get a Favor by Favoree ID
router.get("/byFavoreeId", verify, async (req, res) => {
    try {
        let favoreeId = req.query.favoreeId;
        if (!favoreeId) {
            res.status(400).send("Wrong Query Paramaters");
            return;
        }
        const details = await Trade.find({
            favoreeId: favoreeId,
        }).exec();
        res.send(details);
    } catch (err) {
        res.json({ message: err });
    }
});

// Get a Favor by Favorer ID
router.get("/byFavorerId", verify, async (req, res) => {
    try {
        let favorerId = req.user._id;
        if (!favorerId) {
            res.status(400).send("Error: User not logged in!");
            return;
        }
        const details = await Trade.find({
            favorerId: favorerId,
        }).exec();

        var favors = []
        for(let i = 0; i < details.length; i++)
        {
            const favor = await Favor.findById(details[i].favorId);
            favors.push(favor);
        }
        res.send(favors);
    } catch (err) {
        res.json({ message: err });
    }
});

module.exports = router;