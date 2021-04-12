const router = require('express').Router()
const User = require('../models/User')
const Record = require('../models/RecordDetails')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { check, validationResult } = require('express-validator')
const cookieParser = require('cookie-parser')

//mongoose.connect(mongodb+srv://clusterAnything.mongodb.net/test?retryWrites=true&w=majority, { user: process.env.MONGO_USER, pass: process.env.MONGO_PASSWORD, useNewUrlParser: true, useUnifiedTopology: true })

let refreshTokenList = []
//Route for new user registration
router.post('/register', 
[
    //User request validation
    check('email','Invalid Email').isEmail().normalizeEmail(),
    check('password','Password should be atleast 8 characters long').isLength({min: 8}),
    check('name','Invalid Name').isAlpha().isLength({ min: 1 })
] , async (req, res) => {
    const error = validationResult(req)
    if(error.isEmpty()) {

        //Check if user already exists
        const userExists = await User.findOne({ email: req.body.email })
        if(userExists) res.status(400).send('Email already exists')

        else {
        //Hashing password before storing
        const passwordSalt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, passwordSalt)

        //Create new user record
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            super_role: req.body.super_role
        })
        
        //Insert the created user into the collection
        await user.save((err,result) => {
            if (err){
                console.log(err)
            }
            else {
                res.status(200).send(result)
            }
        })
    }
   
}  
    else {
            console.log(error)
            res.send(error.errors[0].msg)
        }
})

//Route for user login
router.post('/login', [
    check('email','Invalid Email').isEmail().normalizeEmail(),
] , async (req, res) => {
    const user = await User.findOne({ email: req.body.email})
    if(!user) res.status(400).send('Invalid username or password')
    else {
        const checkPassword = await bcrypt.compare(req.body.password, user.password)
        if(!checkPassword) res.status(400).send('Invalid username or password')

        //Create a token and send it in the header
        const accessToken = await jwt.sign({id: user._id}, process.env.ACCESS_SECRET, 
            { expiresIn: process.env.ACCESS_TOKEN_LIFE })
        //Refresh token
        const refreshToken = await jwt.sign({id: user._id}, process.env.REFRESH_SECRET, 
            { expiresIn: process.env.REFRESH_TOKEN_LIFE,
              audience: user.email })
        refreshTokenList += refreshToken
        //Send the generated tokens in the response
        res
        .cookie("accessToken", accessToken, {httpOnly: true})
        .status(200).send({accessToken, refreshToken})
    }
})

router.post('/token', (req, res) => {
    const refreshToken = req.body.refresh
    console.log(refreshToken)
    if(!refreshToken) res.status(400).send('No token')
    if(!refreshTokenList.includes(refreshToken)) res.status(403).send('No token')

    //If refresh token does exist, verify it and grant a new access token to the user
    jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user) => {
        if(err) return res.sendStatus(403)
        const accessToken = jwt.sign({id: user._id}, process.env.ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_LIFE })
        res.send({accessToken})
    })
})

router.delete('/logout', (req, res) => {
    refreshTokenList = refreshTokenList.filter(token => token !== req.header('refresh'))
    res.send('Logout')
})

module.exports = router