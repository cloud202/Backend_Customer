const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customerRegistrationSchema = new Schema({
    customer_id: {
        type: String,
        unique: false,
        required: true,
    },
    customer_name: {
        type: String,
        required: false,
        set: name => name === '' ? undefined : name
    },
    customer_role: {
        type: String,
        required: false,
        set: role => role === '' ? undefined : role
    },
    customer_company: {
        type: String,
        required: false,
        set: company => company === '' ? undefined : company
    },
    customer_company_size: {
        type: Number,
        required: false,
        set: companySize => companySize === '' ? undefined : companySize
    },
    customer_country: {
        type: String,
        required: false,
        set: country => country === '' ? undefined : country
    },
    customer_industry: {
        type: String,
        required: false,
        set: industry => industry === '' ? undefined : industry
    },
    customer_email: {
        type: String,
        required: true,
        unique: true,
    },
    customer_mobile: {
        countryCode: {
            type: String,
            required: false,
            set: countryCode => countryCode === '' ? undefined : countryCode
        },
        phoneNumber: {
            type: String,
            required: false,
            set: phoneNumber => phoneNumber === '' ? undefined : phoneNumber

        }
    },
    isMember: {
        type: Boolean,
        default: false
    },
    projects: [{
        type: Schema.Types.ObjectId,
        ref: "Project"
    }]

}, { timestamps: true, minimize: true });

module.exports = mongoose.model('CustomerRegistration', customerRegistrationSchema, 'customers');
