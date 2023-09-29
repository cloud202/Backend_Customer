const Joi = require('joi');

const moduleSchema = Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    scope: Joi.string(),
},{unknown:false});

module.exports = moduleSchema;