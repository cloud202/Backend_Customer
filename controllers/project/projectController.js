const axios = require('axios');
const Project = require('../../models/project/template');
const CustomerRegistration = require('../../models/customer/customerRegistration');
const History = require('../../models/project/history');
const { ADMIN_API_BASE_URL } = require('../../config');
const { projectSchema, updateProjectSchema } = require('../../validators/project/projectValidator');
const CustomErrorHandler = require('../../services/CustomErrorHandler');
const phaseSchema = require('../../validators/project/phaseValidator');
const moduleSchema = require('../../validators/project/moduleValidator');
const taskSchema = require('../../validators/project/taskValidator');
const assignRevokeProjectSchema = require('../../validators/project/assignRevokeProjectValidator');

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
            const project = await Project.findOne(
                {
                    _id: projectOid
                }
            ).select('phases');
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
            const project = await Project.findOne(
                {
                    _id: projectOid
                }
            ).select('phases.modules.moduleId');
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
            const project = await Project.findOne(
                {
                    _id: projectOid
                }
            ).select('phases.modules.tasks.taskId');
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
            const customer = await CustomerRegistration.findById(customerId);
            if (!customer) {
                return next(CustomErrorHandler.notFound('Customer not found'));
            }
            let allProjects;
            if (customer.isMember) {
                allProjects = await Project.find({ _id: { $in: customer.projects } });
            } else {
                allProjects = await Project.find({ customer_id: customerId });
            }
            if (allProjects.length === 0) {
                return next(CustomErrorHandler.notFound('No projects available for the customer'));
            }
            return res.status(200).json(allProjects);
        } catch (error) {
            return next(error);
        }
    },

    async getCustomerProjectById(req, res, next) {
        try {
            const projectOid = req.params.id;
            const project = await Project.findOneAndUpdate(
                {
                    _id: projectOid
                },
                {
                    $set: {
                        "phases.$[].modules.$[].tasks.$[task].taskId.task_status": "Due"
                    }
                },
                {
                    "arrayFilters": [
                        {
                            $and: [
                                { "task.taskId.task_status": { $in: ["In-progress", "Onboarded"] } },
                                { "task.taskId.due_on": { $lte: new Date() } }
                            ]
                        }
                    ],
                    new: true
                }
            )
            if (!project) {
                return next(CustomErrorHandler.notFound('No project available for the customer'));
            }
            return res.status(200).json(project);
        } catch (error) {
            return next(error);
        }
    },

    async updatePhaseById(req, res, next) {
        try {
            const updateFields = req.body.updateFields;
            const { error } = phaseSchema.validate(req.body);
            if (error) {
                return next(error);
            }
            const projectOid = req.body.projectOid;
            const phaseOid = req.body.phaseOid;
            const ids = { phaseOid, updateFields };
            const updatedPhase = await Project.findOneAndUpdate(
                {
                    _id: projectOid
                },
                {
                    "$set": {
                        "phases.$[phase].phasesId.name": updateFields.name,
                        "phases.$[phase].phasesId.description": updateFields.description,
                        "phases.$[phase].phasesId.scope": updateFields.scope,
                        "phases.$[phase].phasesId.start_date": updateFields.startDate,
                        "phases.$[phase].phasesId.due_on": updateFields.dueOn,
                    },
                    "$inc": {
                        "version": 1
                    }
                },
                {
                    "arrayFilters": [
                        {
                            "phase._id": phaseOid
                        }
                    ],
                    new: true,
                    ids
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
            const { error } = moduleSchema.validate(req.body);
            if (error) {
                return next(error);
            }
            const projectOid = req.body.projectOid;
            const phaseOid = req.body.phaseOid;
            const moduleOid = req.body.moduleOid;
            const ids = { phaseOid, moduleOid, updateFields };
            const updatedModule = await Project.findOneAndUpdate(
                {
                    _id: projectOid
                },
                {
                    "$set": {
                        "phases.$[phase].modules.$[module].moduleId.name": updateFields.name,
                        "phases.$[phase].modules.$[module].moduleId.description": updateFields.description,
                        "phases.$[phase].modules.$[module].moduleId.scope": updateFields.scope,
                        "phases.$[phase].modules.$[module].moduleId.start_date": updateFields.startDate,
                        "phases.$[phase].modules.$[module].moduleId.due_on": updateFields.dueOn,
                    },
                    "$inc": {
                        "version": 1
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
                    new: true,
                    ids
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

    async updateTaskById(req, res, next) {
        try {
            const { error } = taskSchema.validate(req.body);
            if (error) {
                return next(error);
            }
            const updateFields = req.body.updateFields;
            const projectOid = req.body.projectOid;
            const phaseOid = req.body.phaseOid;
            const moduleOid = req.body.moduleOid;
            const taskOid = req.body.taskOid;
            const ids = { phaseOid, moduleOid, taskOid, updateFields };
            const updatedTask = await Project.findOneAndUpdate(
                {
                    _id: projectOid
                },
                {
                    "$set": {
                        "phases.$[phase].modules.$[module].tasks.$[task].taskId.name": updateFields.name,
                        "phases.$[phase].modules.$[module].tasks.$[task].taskId.start_date": updateFields.startDate,
                        "phases.$[phase].modules.$[module].tasks.$[task].taskId.due_on": updateFields.dueOn,
                        "phases.$[phase].modules.$[module].tasks.$[task].taskId.effort_estimate": updateFields.effortEstimate,
                        "phases.$[phase].modules.$[module].tasks.$[task].taskId.task_status": updateFields.taskStatus,
                        "phases.$[phase].modules.$[module].tasks.$[task].taskId.task_description": updateFields.taskDescription,
                        "phases.$[phase].modules.$[module].tasks.$[task].taskId.assign_to": updateFields.assignTo,
                    },
                    "$inc": {
                        "version": 1
                    }
                },
                {
                    arrayFilters: [
                        {
                            "phase._id": phaseOid
                        },
                        {
                            "module._id": moduleOid
                        },
                        {
                            "task._id": taskOid
                        }
                    ],
                    new: true,
                    ids,
                }
            );
            if (!updatedTask) {
                return next(CustomErrorHandler.notFound('Task not found'));
            }
            return res.status(200).json(updatedTask);
        } catch (error) {
            return next(error);
        }
    },

    async updateProjectById(req, res, next) {
        try {
            const { error } = updateProjectSchema.validate(req.body);
            if (error) {
                return next(error);
            }
            const projectOid = req.params.id;
            const updatedProject = await Project.findOneAndUpdate({ _id: projectOid }, { ...req.body, $inc: { version: 1 } }, { new: true });
            if (!updatedProject) {
                return next(CustomErrorHandler.notFound('Project not found'));
            }
            return res.status(200).json(updatedProject);
        } catch (error) {
            return next(error);
        }
    },

    async getProjectLinks(req, res, next) {
        try {
            const projectOid = req.params.id;
            const project = await Project.findById(projectOid).select('links');
            if (!project) {
                return next(CustomErrorHandler.notFound('Project not found'));
            }
            return res.status(200).json(project.links);
        } catch (error) {
            return next(error);
        }
    },

    async getProjectHistory(req, res, next) {
        try {
            const projectOid = req.params.id;
            const projectHistory = await History.find({ project_id: projectOid }).sort({ version: 1 }).populate('updated_by');
            if (projectHistory.length === 0) {
                return next(CustomErrorHandler.notFound("Project Not Updated"));
            }
            return res.status(200).json(projectHistory);
        } catch (error) {
            return next(error);
        }
    },

    async assignProject(req, res, next) {
        try {
            const { error } = assignRevokeProjectSchema.validate(req.body);
            if (error) {
                return next(error);
            }
            const { memberId, projectId } = req.body;
            const member = await CustomerRegistration.findOneAndUpdate(
                {
                    $and: [
                        {
                            _id: memberId
                        },
                        {
                            isMember: true
                        }
                    ]
                },
                {
                    "$addToSet": { "projects": projectId }
                },
                {
                    new: true,
                }
            )
            if (!member) {
                return next(CustomErrorHandler.notFound("Member not found"));
            }
            return res.status(200).json(member.projects);
        } catch (error) {
            return next(error);
        }
    },

    async revokeProject(req, res, next) {
        try {
            const { error } = assignRevokeProjectSchema.validate(req.body);
            if (error) {
                return next(error);
            }
            const { memberId, projectId } = req.body;
            const member = await CustomerRegistration.findOneAndUpdate(
                {
                    $and: [
                        {
                            _id: memberId
                        },
                        {
                            isMember: true
                        }
                    ]
                },
                {
                    "$pull": { "projects": projectId }
                },
                {
                    new: true,
                }
            )
            if (!member) {
                return next(CustomErrorHandler.notFound("Member not found"));
            }
            return res.status(200).json({ "Remaining Projects": member.projects });
        } catch (error) {
            return next(error);
        }
    },
};

module.exports = projectController;