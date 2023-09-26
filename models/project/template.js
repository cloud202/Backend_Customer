const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
        unique: true
    },
    task_type: {
        type: String,
        required: true,
    },
    task_solutionid: solutionSchema,
    task_actionName: {
        type: String,
    },
    task_script: {
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
    task_link: {
        type: String,
        required: false,
    },
    assign_to: {
        type: String,
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
    }]
}, { timestamps: true });

module.exports = mongoose.model('Project', templateSchema, 'customer_projects');
