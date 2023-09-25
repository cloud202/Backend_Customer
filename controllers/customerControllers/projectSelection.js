const axios = require('axios');
const Project = require('../../models/project/template');
const { ADMIN_API_BASE_URL } = require('../../config');
const projectSchema = require('../../validators/project/projectValidator')

const projectSelectionController = {
    async addProject(req, res, next) {
        try {
            const { error } = projectSchema.validate(req.body);
            if (error) {
                return next(error);
            }
            const apiUrl = 'api/admin/master/v2/project_template';
            const templateId = req.params.templateId;
            const response = await axios.get(`${ADMIN_API_BASE_URL}/${apiUrl}/${templateId}`);
            const customerId = req.params.customerId;
            const fetchedTemplate = response.data;
            const { project_name } = req.body;
            const savedProject = await Project.create({ customer_id: customerId, project_name, ...fetchedTemplate });
            return res.status(200).json(savedProject);
        } catch (error) {
            return next(error);
        }
    },
};

module.exports = projectSelectionController;