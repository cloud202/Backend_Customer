const Joi = require('joi');
const JoiObjectId = require('joi-objectid');
Joi.objectId = JoiObjectId(Joi);

const updateFieldsSchema = {
    name: Joi.string(),
    description: Joi.string(),
    scope: Joi.string(),
    startDate: Joi.date(),
    dueOn: Joi.date(),
};

const moduleSchema = Joi.object({
    customerId: Joi.objectId().required(),
    projectOid: Joi.objectId().required(),
    phaseOid: Joi.objectId().required(),
    moduleOid: Joi.objectId().required(),
    updateFields: Joi.object(updateFieldsSchema).required(),
}, { unknown: false });

module.exports = moduleSchema;