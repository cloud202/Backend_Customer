const CustomerRegistration = require('../../models/customerRegistration');
const customerRegistrationSchema = require('../../validators/customerRegistrationValidator');
const CustomErrorHandler = require('../../services/CustomErrorHandler');
const customerRegistration = require('../../models/customerRegistration');

const CustomerRegistrationController = {
    async store(req, res, next) {
        try {
            const { error } = customerRegistrationSchema.validate(req.body);
            if (error) {
                return next(error);
            }
            const lastSavedCustomer = await CustomerRegistration.findOne().sort({ createdAt: -1 });
            let newCustomerId = lastSavedCustomer ? parseInt(lastSavedCustomer.customer_id.slice(3)) + 1 : 1;
            const newCustomer = await CustomerRegistration.create({ ...req.body, customer_id: 'QC_' + newCustomerId });
            return res.status(201).json(newCustomer);
        } catch (error) {
            return next(error);
        }
    },
    async getAllCustomers(req, res, next) {
        try {
            const allCustomers = await CustomerRegistration.find();
            return res.status(200).json(allCustomers);
        } catch (error) {
            return next(error);
        }
    },
    async getCustomerById(req, res, next) {
        try {
            const customerId = req.params.id;
            const customer = await CustomerRegistration.findById(customerId);
            if (!customer) {
                return next(CustomErrorHandler.notFound('Customer not found'));
            }
            return res.status(200).json(customer);
        } catch (error) {
            return next(error);
        }
    },
    async getCustomerByEmail(req, res, next) {
        try {
            const customerEmail = req.params.email;
            const customer = await CustomerRegistration.findOne({ customer_email: customerEmail });
            if (!customer) {
                return next(CustomErrorHandler.notFound('Customer not found'));
            }
            return res.status(200).json(customer);
        } catch (error) {
            return next(error);
        }
    },
    async updateCustomer(req, res, next) {
        try {
            const customerId = req.params.id;
            const { error } = customerRegistrationSchema.validate(req.body);
            if (error) {
                return next(error);
            }
            const updatedCustomer = await CustomerRegistration.findOneAndUpdate({ _id: customerId }, { ...req.body }, { new: true });
            if (!updatedCustomer) {
                return next(CustomErrorHandler.notFound('Customer not found'));
            }
            return res.status(200).json(updatedCustomer);
        } catch (error) {
            return next(error);
        }
    },
    async deleteCustomer(req, res, next) {
        try {
            const customerId = req.params.id;
            const removedCustomer = await customerRegistration.findByIdAndDelete(customerId);
            if (removedCustomer) {
                return res.status(200).json(removedCustomer);
            }
            return res.status(204).json(removedCustomer);
        } catch (error) {
            return next(error);
        }
    }
}

module.exports = CustomerRegistrationController;