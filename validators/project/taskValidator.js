const Joi = require('joi');
const JoiObjectId = require('joi-objectid');
Joi.objectId = JoiObjectId(Joi);

const updateFieldsSchema = {
    name: Joi.string(),
    startDate: Joi.date(),
    dueOn: Joi.date(),
    effortEstimate: Joi.number(),
    taskStatus: Joi.string(),
    taskDescription: Joi.string(),
    assignTo: Joi.string(),
};

const taskSchema = Joi.object({
    customerId: Joi.string().required(),
    projectOid: Joi.objectId().required(),
    phaseOid: Joi.objectId().required(),
    moduleOid: Joi.objectId().required(),
    taskOid: Joi.objectId().required(),
    updateFields : Joi.object(updateFieldsSchema).required(),
}, { unknown: false });

module.exports = taskSchema;