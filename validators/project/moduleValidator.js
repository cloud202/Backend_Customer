const Joi = require('joi');
const JoiObjectId = require('joi-objectid');
Joi.objectId = JoiObjectId(Joi);

const moduleSchema = Joi.object({
    customerId: Joi.string().required(),
    projectOid: Joi.objectId().required(),
    phaseOid: Joi.objectId().required(),
    moduleOid: Joi.objectId().required(),
    name: Joi.string(),
    description: Joi.string(),
    scope: Joi.string(),
}, { unknown: false });

module.exports = moduleSchema;