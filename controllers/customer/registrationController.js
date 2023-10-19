const CustomerRegistration = require('../../models/customer/customerRegistration');
const customerRegistrationSchema = require('../../validators/customer/registrationValidator');
const CustomErrorHandler = require('../../services/CustomErrorHandler');

const registrationController = {
    async store(req, res, next) {
        try {
            const { error } = customerRegistrationSchema.validate(req.body);
            if (error) {
                return next(error);
            }
            let newCustomer;
            if (req.body.isMember) {
                newCustomer = await CustomerRegistration.create({ ...req.body });
            } else {
                const lastSavedCustomer = await CustomerRegistration.findOne().sort({ createdAt: -1 });
                let newCustomerId = lastSavedCustomer ? parseInt(lastSavedCustomer.customer_id.slice(3)) + 1 : 1;
                newCustomer = await CustomerRegistration.create({ ...req.body, customer_id: 'QC_' + newCustomerId });
            }
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
            let customer = await CustomerRegistration.findOne({ customer_email: customerEmail });
            if (!customer) {
                const lastSavedCustomer = await CustomerRegistration.findOne().sort({ createdAt: -1 });
                let newCustomerId = lastSavedCustomer ? parseInt(lastSavedCustomer.customer_id.slice(3)) + 1 : 1;
                customer = await CustomerRegistration.create({ customer_email: customerEmail, customer_id: 'QC_' + newCustomerId });
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
            const removedCustomer = await CustomerRegistration.findByIdAndDelete(customerId);
            if (removedCustomer) {
                return res.status(200).json(removedCustomer);
            }
            return res.status(204).json(removedCustomer);
        } catch (error) {
            return next(error);
        }
    },

    async getMemberById(req,res,next){
        try {
            const customerId = req.params.id;
            const members = await CustomerRegistration.find({ customer_id: customerId, isMember: true });
    
            if (!members || members.length === 0) {
                return next(CustomErrorHandler.notFound('No members found for this customer'));
            }
    
            return res.status(200).json(members);
        } catch (error) {
            return next(error);
        }
    }
}

module.exports = registrationController;