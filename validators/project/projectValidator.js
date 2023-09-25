const Joi = require('joi');

const projectSchema = Joi.object({
    project_name: Joi.string().required().allow(''),
    task_description: Joi.string().allow(''),
    task_link: Joi.string().allow(''),
    assign_to: Joi.string().allow(''),
    start_date:Joi.date(),
    due_on:Joi.date(),
    effort_estimate:Joi.number(),
},{unknown:false});

module.exports = projectSchema;