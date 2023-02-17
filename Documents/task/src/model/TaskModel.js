const mongoose = require('mongoose')
const TaskSchema = new mongoose.Schema({
    Title: {
        type: String,
        require: true
    },
    Description: {
        type: String,
        require: true
    },
    Completed: {
        type: Boolean,
        default: false,
    }
})
module.exports = mongoose.model('task', TaskSchema)

