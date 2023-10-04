const Joi = require('joi');
const JoiObjectId = require('joi-objectid');
Joi.objectId = JoiObjectId(Joi);

const projectSchema = Joi.object({
    project_name: Joi.string().required(),
    project_CAP: Joi.string().required(),
    project_industry_id: Joi.objectId().required(),
    project_TS: Joi.array().items(Joi.string()),
    project_WT: Joi.array().items(Joi.string()),
}, { unknown: false });

// const updateProjectSchema = Joi.object({
//     project_name: Joi.string(),
//     start_date: Joi.date(),
//     end_date: Joi.date(),
//     details: Joi.string()
// }, { unknown: false });

// module.exports = { projectSchema, updateProjectSchema };
module.exports =  projectSchema;