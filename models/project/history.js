const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const historySchema = new Schema({
    version: {
        type: Number,
        required: true
    },
    project_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    updated_by: {
        type: Schema.Types.ObjectId,
        required: true
    },
    data: {
        type: Schema.Types.Mixed
    },
}, { timestamps: true });

module.exports = mongoose.model('History', historySchema, 'project_history');