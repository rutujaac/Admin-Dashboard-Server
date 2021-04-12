const RecordSchema = require('../models/RecordDetails')
const checkToken = require('../checkToken')
const router = require('express').Router()

//Route to get all records
router.get('/get', async (req, res) => {
    const records = await RecordSchema.find({})
    res.status(200).send(records)
})

module.exports = router