const axios = require('axios');
const Project = require('../../models/project/template');
const { ADMIN_API_BASE_URL } = require('../../config');
const projectSchema = require('../../validators/project/projectValidator');
const CustomErrorHandler = require('../../services/CustomErrorHandler');

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

    async getProjectPhases(req, res, next) {
        try {
            const projectId = req.params.id;
            const customerId = req.params.customerId;
            const project = await Project.findOne({
                $and: [
                    {
                        _id: projectId
                    },
                    {
                        customer_id: customerId
                    }
                ]
            }).select('phases');
            if (!project) {
                return next(CustomErrorHandler.notFound('Project not found'));
            }
            const processedPhases = {};
            const result = [];
            project.phases.forEach(phase => {
                const key = phase.phasesId._id;
                if (key in processedPhases === false) {
                    processedPhases[key] = key;
                    result.push(phase.phasesId);
                }
            });
            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    },

    async getProjectModules(req, res, next) {
        try {
            const projectId = req.params.id;
            const customerId = req.params.customerId;
            const project = await Project.findOne({
                $and: [
                    {
                        _id: projectId
                    },
                    {
                        customer_id: customerId
                    }
                ]
            }).select('phases.modules.moduleId');
            if (!project) {
                return next(CustomErrorHandler.notFound('Project not found'));
            }
            const processedModules = {};
            const result = [];
            project.phases.forEach(phase => {
                phase.modules.forEach(module => {
                    const key = module.moduleId._id;
                    if (key in processedModules === false) {
                        processedModules[key] = key;
                        result.push(module.moduleId);
                    }
                });
            });
            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    },

    async getProjectTasks(req, res, next) {
        try {
            const projectId = req.params.id;
            const customerId = req.params.customerId;
            const project = await Project.findOne({
                $and: [
                    {
                        _id: projectId
                    },
                    {
                        customer_id: customerId
                    }
                ]
            }).select('phases.modules.tasks.taskId');
            if (!project) {
                return next(CustomErrorHandler.notFound('Project not found'));
            }
            const processedTasks = {};
            const result = [];
            project.phases.forEach(phase => {
                phase.modules.forEach(module => {
                    module.tasks.forEach(task => {
                        const key = task.taskId._id;
                        if (key in processedTasks === false) {
                            processedTasks[key] = key;
                            result.push(task.taskId);
                        }
                    });
                });
            });
            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    },
};

module.exports = projectSelectionController;