const router = require('express').Router();
const registrationController = require('../controllers/customer/registrationController.js');
const projectController = require('../controllers/project/projectController.js')

//customer routes for registration
router.post('/api/customer/registration',registrationController.store);
router.get('/api/customer/registration',registrationController.getAllCustomers);
router.get('/api/customer/registration/:id',registrationController.getCustomerById);
router.patch('/api/customer/registration/:id',registrationController.updateCustomer);
router.delete('/api/customer/registration/:id',registrationController.deleteCustomer);
router.get('/api/customer/registration/email/:email',registrationController.getCustomerByEmail);

//custumer routes for project selection
router.post('/api/customer/:customerId/project/add/:templateId',projectController.addProject);
router.get('/api/customer/:customerId/project/:id/phases',projectController.getProjectPhases);
router.get('/api/customer/:customerId/project/:id/modules',projectController.getProjectModules);
router.get('/api/customer/:customerId/project/:id/tasks',projectController.getProjectTasks);
router.get('/api/customer/:customerId/project/allprojects',projectController.getCustomerProjects);
router.get('/api/customer/project/:id',projectController.getCustomerProjectById);
router.patch('/api/customer/project/phase',projectController.updatePhaseById);
router.patch('/api/customer/project/module',projectController.updateModuleById);
router.patch('/api/customer/project/task',projectController.updateTaskById);

module.exports = router