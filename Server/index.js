const express = require('express')
const app = express()
const mongoose = require('mongoose')
const authUser = require('./routes/auth')
const viewData = require('./routes/view')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const cors = require('cors')

dotenv.config()
app.use(cors())
//Connection to database
mongoose.connect(process.env.DB_URL, 
    {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true
      })
.then(() => {
    console.log("Database connected")
})
.catch(error => {
    console.log(error)
})


app.use(express.json())

// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: false }))

//Route middleware
app.use('/', authUser)
app.use('/records', viewData)

//Port
app.listen(3000)