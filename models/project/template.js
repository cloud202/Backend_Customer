const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const History = require('./history');

const industrySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    scope: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
    }
});

const segmentSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    scope: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
    }
});

const moduleSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    scope: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    },
    start_date: {
        type: Date,
        required: false
    },
    due_on: {
        type: Date,
        required: false
    }
});

const phaseSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    scope: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    },
    start_date: {
        type: Date,
        required: false
    },
    due_on: {
        type: Date,
        required: false
    }
});

const solutionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    allActions: [{
        action: {
            type: String,
            required: true
        },
        api: {
            type: String,
            required: true
        }
    }],
    status: {
        type: Boolean,
        default: true
    }
});

const taskSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    },
    task_id: {
        type: String,
        unique: false
    },
    task_type: {
        type: String,
        required: true,
    },
    task_solutionid: solutionSchema,
    task_actionName: {
        type: String,
    },
    start_date: {
        type: Date,
        required: false,
    },
    due_on: {
        type: Date,
        required: false,
    },
    effort_estimate: {
        type: Number,
        required: false,
    },
    task_description: {
        type: String,
        required: false,
    },
    assign_to: {
        type: String,
        required: false,
    },
    task_status: {
        type: String,
        required: false
    },
    playbook: {
        type: [String],
        required: false,
    }
});

const typeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    scope: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    }
});

const templateSchema = new Schema({
    project_id: {
        type: String,
        required: true,
    },
    customer_id: {
        type: String,
        required: true,
    },
    project_name: {
        type: String,
        required: true,
    },
    project_industry: industrySchema,
    project_CAP: {
        type: String,
        required: true,
    },
    project_TS: [String],
    project_WT: [String],
    template_name: {
        type: String,
        required: true,
    },
    template_type_id: typeSchema,
    template_segments: [{ segment_id: segmentSchema }],
    template_industries: [{ industry_id: industrySchema }],
    template_usecase: {
        type: String,
    },
    phases: [{
        phasesId: phaseSchema,
        modules: [{
            moduleId: moduleSchema,
            tasks: [
                { taskId: taskSchema }
            ]
        }]
    }],
    links: {
        sales: [String],
        funding: [String],
        delivery: [String],
        operations: [String],
    },
    start_date: {
        type: Date,
        required: false
    },
    end_date: {
        type: Date,
        required: false
    },
    details: {
        type: String,
        required: false
    },
    version: {
        type: Number,
        default: 1
    }
}, { timestamps: true });


templateSchema.pre('findOneAndUpdate', async function (next) {
    try {
        let isNeeded = true;
        if (this.options.preHookFlag == false) {
            isNeeded = false;
        }
        if (isNeeded) {
            const docToUpdate = await this.model.findOne(this.getQuery());
            let updated_field = "PROJECT";
            let updated_by = this.options.customerId;
            const ids = this.options.ids ? this.options.ids : {};
            let data = {}
            if (Object.keys(ids).length === 2) {
                updated_field = "PHASE";
                docToUpdate.phases.forEach(phase => {
                    if (phase._id == ids.phaseOid) {
                        data = filterDifferances(phase.phasesId, ids.updateFields)
                    }
                })
            } else if (Object.keys(ids).length === 3) {
                updated_field = "MODULE";
                docToUpdate.phases.forEach(phase =>
                    phase.modules.forEach(module => {
                        if (module._id == ids.moduleOid) {
                            data = filterDifferances(module.moduleId, ids.updateFields)
                        }
                    })
                )
            } else if (Object.keys(ids).length === 4) {
                updated_field = "TASK";
                docToUpdate.phases.forEach(phase =>
                    phase.modules.forEach(module => {
                        module.tasks.forEach(task => {
                            if (task._id == ids.taskOid) {
                                data = filterDifferances(task.taskId, ids.updateFields)
                            }
                        })
                    })
                )
            } else {
                updated_by = this._update.customerId;
                const old = {
                    project_name: docToUpdate.project_name,
                    start_date: docToUpdate.start_date,
                    end_date: docToUpdate.end_date,
                    details: docToUpdate.details,
                };
                const newVals = {
                    project_name: this._update.project_name,
                    start_date: this._update.start_date,
                    end_date: this._update.end_date,
                    details: this._update.details,
                };
                data = filterDifferances(old, newVals)
            }
            if (Object.keys(data).length !== 0) {
                const historyEntry = {
                    version: docToUpdate.version,
                    project_id: docToUpdate._id,
                    updated_by,
                    updated_field,
                    data
                }
                await History.create(historyEntry);
            }
        }
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Project', templateSchema, 'customer_projects');

function filterDifferances(oldDocument, newDocument) {
    const updatedKeyValues = Object.fromEntries(
        Object.entries(newDocument).filter(([key, value]) => oldDocument[key] !== value)
    );
    return updatedKeyValues;
}