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

router.get('/updateBalance', verify, async (req, res) => {
    try {
        let updateBalance = req.query.balance;
        let type = req.query.type;
        let userId = req.query.userId;
        if (!updateBalance || !type || !userId) {
            res.status(400).send("Wrong Query Paramaters");
            return;
        }
        const details = await User.findById(userId).exec();
        const oldBalance = details.balance;
        let newBalance = parseInt(oldBalance);
        const balanceChange = parseInt(updateBalance);
        if(type == "add")
        {
            newBalance += balanceChange;
        }
        else if(type == "subtract")
        {
            newBalance -= balanceChange;
        }
        
        newBalance = newCoinsInt.toString();
        const updateDetails = await User.findByIdAndUpdate(userId, {
            balance: newBalance,
        }).exec();
        res.send(updateDetails);
    } catch (err) {
        res.json({ message: err });
    }
});

module.exports = router;
