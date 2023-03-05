const router = require('express').Router();
const verify = require('./verifyJWTToken');
const User = require('../model/User');

// Gets the details of the logged in user
// users/
router.get('/', verify, async (req, res) => {
    try{
        const details = await User.findById(req.user._id);
        res.send(details);
    }
    catch(err){
        res.json({message: err});
    }
});

// Gets the details of any user
// Must be logged in to use
// users/userId
router.get('/byId', verify, async (req, res) => {
    try{
        const details = await User.findById(req.query.userId);
        res.send(details);
    }
    catch(err){
        res.json({message: err});
    }
});

router.get('/updateCoins', verify, async (req, res) => {
    try {
        let updateCoins = req.query.favorCoins;
        let type = req.query.type;
        let userId = req.query.userId;
        if (!updateCoins || !type || !userId) {
            res.status(400).send("Wrong Query Paramaters");
            return;
        }
        const details = await User.findById(userId).exec();
        const oldCoins = details.favorCoins;
        let newCoinsInt = parseInt(oldCoins);
        const updateCoinsInt = parseInt(updateCoins);
        if(type == "add")
        {
            newCoinsInt += updateCoinsInt;
        }
        else if(type == "subtract")
        {
            newCoinsInt -= parseInt(updateCoins);
        }
        const newCoins = newCoinsInt.toString();
        const updateDetails = await User.findByIdAndUpdate(userId, {
            favorCoins: newCoins,
        }).exec();
        res.send(updateDetails);
    } catch (err) {
        res.json({ message: err });
    }
});

module.exports = router;
