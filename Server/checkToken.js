const jwt = require('jsonwebtoken')

const checkToken = (req, res, next) => {
    //Extract token from auth header
    const token = req.header('auth')
    if(!token) res.status(400).send('Forbidden')

    //Verify token
    const auth = jwt.verify(token, process.env.ACCESS_SECRET)
    if(!auth) res.status(400).send('Invalid token value')

    req.user = auth
    next()
}

module.exports = checkToken