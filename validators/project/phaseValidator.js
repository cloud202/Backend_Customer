const Joi = require('joi');

const phaseSchema = Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    scope: Joi.string(),
},{unknown:false});

module.exports = phaseSchema;