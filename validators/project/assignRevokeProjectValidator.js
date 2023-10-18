const Joi = require('joi');
const JoiObjectId = require('joi-objectid');
Joi.objectId = JoiObjectId(Joi);

const assignRevokeProjectSchema = Joi.object({
    memberId: Joi.objectId().required(),
    projectId: Joi.objectId().required(),
});

module.exports = assignRevokeProjectSchema;