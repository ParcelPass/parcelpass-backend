// VALIDATION 
const Joi = require('@hapi/joi');

// Register Validation 
const registerValidation = data => {
    const schema = Joi.object().keys({
        name: Joi.string().min(6).required(), 
        email: Joi.string().min(6).regex(/.*ucla\.edu$/).messages({'string.pattern.base': `Must be a Valid UCLA Email`}).required().email(),
        password: Joi.string().min(6).required(),
        phone: Joi.string().regex(/^[0-9]{10}$/).messages({'string.pattern.base': `Phone number must have 10 digits.`}).required()
    });
    return schema.validate(data);
};

// Login Validation 
const loginValidation = data => {
    const schema = Joi.object().keys({
        email: Joi.string().min(6).regex(/.*ucla\.edu$/).messages({'string.pattern.base': `Must be a valid ucla.edu email`}).required().email(),
        password: Joi.string().min(6).required()
    });
    return schema.validate(data);
};

module.exports.loginValidation = loginValidation;
module.exports.registerValidation = registerValidation;