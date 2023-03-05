// VALIDATION 
const Joi = require('@hapi/joi');

// Register Validation 
const favorValidation = (data, user) => {
    const schema = Joi.object().keys({
        title: Joi.string().min(6).required(), 
        description: Joi.string().min(6).required(), 
        category: Joi.string().min(4).required(),
        favorCoins: Joi.number().min(1)
      });
    return schema.validate(data);
};


module.exports.favorValidation = favorValidation;
