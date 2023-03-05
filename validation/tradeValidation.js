// VALIDATION 
const Joi = require('@hapi/joi');

// Register Validation 
const tradeValidation = data => {
    const schema = Joi.object().keys({
        favorerId: Joi.string().min(6),
        favorId: Joi.string().min(6).required()
      });
    return schema.validate(data);
};


module.exports.tradeValidation = tradeValidation;
