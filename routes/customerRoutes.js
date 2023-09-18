const router = require('express').Router();
const customerRegistrationController = require('../controllers/customerControllers/customerRegistration.js');

//customer routes for registration
router.post('/api/customer/registration',customerRegistrationController.store);
router.get('/api/customer/registration',customerRegistrationController.getAllCustomers);
router.get('/api/customer/registration/:id',customerRegistrationController.getCustomerById);
router.patch('/api/customer/registration/:id',customerRegistrationController.updateCustomer);
router.delete('/api/customer/registration/:id',customerRegistrationController.deleteCustomer);
router.get('/api/customer/registration/email/:email',customerRegistrationController.getCustomerByEmail);

module.exports = router