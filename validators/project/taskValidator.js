const Joi = require('joi');

const taskSchema = Joi.object({
    name: Joi.string(),
    task_description: Joi.string(),
    scope: Joi.string(),
    task_link: Joi.string(),
    assign_to: Joi.string(),
}, { unknown: false });

module.exports = taskSchema;