const Joi = require('joi');

const customerRegistrationSchema = Joi.object({
    customer_name: Joi.string().required().allow(''),
    customer_role: Joi.string().required().allow(''),
    customer_company: Joi.string().required().allow(''),
    customer_company_size: Joi.number().required().allow(''),
    customer_country: Joi.string().required().allow(''),
    customer_industry: Joi.string().required().allow(''),
    customer_email: Joi.string().email().required(),
    customer_mobile: Joi.object({
        countryCode: Joi.string().required().allow(''),
        phoneNumber: Joi.string().required().allow(''),
    })
},{unknown:false});

module.exports = customerRegistrationSchema;