const axios = require('axios');
const Project = require('../../models/project/template');
const { ADMIN_API_BASE_URL } = require('../../config');
const projectSchema = require('../../validators/project/projectValidator');
const CustomErrorHandler = require('../../services/CustomErrorHandler');
const phaseSchema = require('../../validators/project/phaseValidator');
const moduleSchema = require('../../validators/project/moduleValidator');
const taskSchema = require('../../validators/project/taskValidator');

const projectController = {
    async addProject(req, res, next) {
        try {
            const { error } = projectSchema.validate(req.body);
            if (error) {
                return next(error);
            }
            const apiUrl1 = 'api/admin/master/v2/project_template';
            const apiUrl2 = 'api/admin/master/project_industry';
            const templateId = req.params.templateId;
            const projectIndustryId = req.body.project_industry_id;
            const [response1, response2] = await Promise.all([
                axios.get(`${ADMIN_API_BASE_URL}/${apiUrl1}/${templateId}`),
                axios.get(`${ADMIN_API_BASE_URL}/${apiUrl2}/${projectIndustryId}`)
            ]);
            const fetchedTemplate = response1.data;
            const project_industry = response2.data;
            const customerId = req.params.customerId;
            const { project_name, project_CAP, project_TS, project_WT } = req.body;
            const savedProject = await Project.create({ customer_id: customerId, project_industry, project_name, project_CAP, project_TS, project_WT, ...fetchedTemplate });
            return res.status(201).json(savedProject);
        } catch (error) {
            return next(error);
        }
    },

    async getProjectPhases(req, res, next) {
        try {
            const projectOid = req.params.id;
            const customerId = req.params.customerId;
            const project = await Project.findOne({
                $and: [
                    {
                        _id: projectOid
                    },
                    {
                        customer_id: customerId
                    }
                ]
            }).select('phases');
            if (!project) {
                return next(CustomErrorHandler.notFound('Project not found'));
            }
            const result = project.phases;
            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    },

    async getProjectModules(req, res, next) {
        try {
            const projectOid = req.params.id;
            const customerId = req.params.customerId;
            const project = await Project.findOne({
                $and: [
                    {
                        _id: projectOid
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
            const projectOid = req.params.id;
            const customerId = req.params.customerId;
            const project = await Project.findOne({
                $and: [
                    {
                        _id: projectOid
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

    async getCustomerProjects(req, res, next) {
        try {
            const customerId = req.params.customerId;
            const allProjects = await Project.find({ customer_id: customerId });
            if (allProjects.length === 0) {
                return next(CustomErrorHandler.notFound('No projects available for the customer'));
            }
            return res.status(200).json(allProjects);
        } catch (error) {
            return next(error);
        }
    },

    async updatePhaseById(req, res, next) {
        try {
            const updateFields = req.body.updateFields;
            const { error } = phaseSchema.validate(req.body.updateFields);
            if (error) {
                return next(error);
            }
            const customerId = req.body.customerId;
            const projectOid = req.body.projectOid;
            const phaseOid = req.body.phaseOid;
            const updatedPhase = await Project.findOneAndUpdate(
                {
                    $and: [
                        {
                            customer_id: customerId,
                        },
                        {
                            _id: projectOid
                        }
                    ]
                },
                {
                    "$set": {
                        "phases.$[phase].phasesId.name": updateFields.name,
                        "phases.$[phase].phasesId.description": updateFields.description,
                        "phases.$[phase].phasesId.scope": updateFields.scope,
                    }
                },
                {
                    "arrayFilters": [
                        {
                            "phase._id": phaseOid
                        }
                    ],
                    new: true
                }
            );
            if (!updatedPhase) {
                return next(CustomErrorHandler.notFound('Phase not found'));
            }
            return res.status(200).json(updatedPhase);
        } catch (error) {
            return next(error);
        }
    },

    async updateModuleById(req, res, next) {
        try {
            const updateFields = req.body.updateFields;
            const { error } = moduleSchema.validate(req.body.updateFields);
            if (error) {
                return next(error);
            }
            const customerId = req.body.customerId;
            const projectOid = req.body.projectOid;
            const phaseOid = req.body.phaseOid;
            const moduleOid = req.body.moduleOid;
            const updatedModule = await Project.findOneAndUpdate(
                {
                    $and: [
                        {
                            customer_id: customerId,
                        },
                        {
                            _id: projectOid
                        }
                    ]
                },
                {
                    "$set": {
                        "phases.$[phase].modules.$[module].moduleId.name": updateFields.name,
                        "phases.$[phase].modules.$[module].moduleId.description": updateFields.description,
                        "phases.$[phase].modules.$[module].moduleId.scope": updateFields.scope,
                    }
                },
                {
                    arrayFilters: [
                        {
                            "phase._id": phaseOid
                        },
                        {
                            "module._id": moduleOid
                        }
                    ],
                    new: true
                },
            );
            if (!updatedModule) {
                return next(CustomErrorHandler.notFound('Module not found'));
            }
            return res.status(200).json(updatedModule);
        } catch (error) {
            return next(error);
        }
    },

    // async updateTaskById(req, res, next) {
    //     try {
    //         const updateFields = req.body.updateFields;
    //         const { error } = phaseSchema.validate(req.body.updateFields);
    //         if (error) {
    //             return next(error);
    //         }
    //         const customerId = req.body.customerId;
    //         const projectOid = req.body.projectOid;
    //         const phaseOid = req.body.phaseOid;
    //         const moduleOid = req.body.moduleOid;
    //         const taskOid = req.body.taskOid;
    //         const updatedTask = await Project.findOneAndUpdate(
    //             {
    //                 $and: [
    //                     {
    //                         customer_id: customerId,
    //                     },
    //                     {
    //                         _id: projectOid
    //                     }
    //                 ]
    //             },
    //             {
    //                 "$set": {
    //                     "phases.$[phase].modules.$[module].moduleId.name": updateFields.name,
    //                     "phases.$[phase].modules.$[module].moduleId.description": updateFields.description,
    //                     "phases.$[phase].modules.$[module].moduleId.scope": updateFields.scope,
    //                 }
    //             },
    //             {

    //             }
    //         );
    //     } catch (error) {
    //         return next(error);
    //     }
    // },
};

module.exports = projectController;