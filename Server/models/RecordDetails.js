const mongoose = require('mongoose')

const RecordSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    severity: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    }
})


module.exports = mongoose.model('Accident-Details', RecordSchema)