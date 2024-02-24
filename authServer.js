// load value from .env file's variable into process.env variable here
require('dotenv').config()

// to import the express library
const express = requires('express')
// to set up the express server - just call the express function
const app = express()
const jwt = require('jsonwebtoken')

// (2) let our application use JSON from the body - that gets passed inside of the request
app.use(express.json())


const posts = [
    {
        username: 'Kyle',
        title: 'Post 1',
    }, 
    {
        username: 'Jim',
        title: 'Post 2',
    }

]

// (1) request.rest - to allow us to make request API to our API
// you have to install REST client extension to use .rest file to make these calls
// you can use something else like postman
app.get('/posts', authenticateToken, (req, res) => {

    // (1) res.json(posts)
    
    // after (3) now we have access to our user
    res.json(posts.filter(post => post.username === req.user.name))

})


let refreshTokens = []
// (6) POST token
app.post('/token', (req, res) => {
    const refreshToken = req.body.token

    // check if that refreshToken exists
    if (refreshToken == null) return res.sendStatus(401)
    // then check if we have a valid refreshToken that exists for this refresh
    // essentially does this refresh token still valid 
    // have we removed it or is it still good
    // if it does not exist -> return that they don't have access
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)

    // now pass all the check
    // we can verify this refresh token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        // if err -> similar to normal authentication
        if (err) return res.sendStatus(403)

        // now create our access token
        // we can't pass the whole user object
        // this user object actually contains additional information 
        //      such as the issue that date of our token 
        // so we actually need to get just the name
        // pass in just raw user object and not other additional information
        const accessToken = generateAccessToken({ name: user.name })
        // return the information
        res.json({ accessToken: accessToken })
    })
})


// (2) create a login page
// use app.post() because we're creating a token
app.post('/login', (req, res) => {

    const username = req.body.username
    const user = { name: username }

    // (5) put the same user inside of both tokens
    // so we can easily create a new token from our refresh token
    const accessToken = generateAccessToken(user)
    // no expiration date on our refresh token
    // we're going to
    // manually handle the expiration of these
    // refresh tokens and we don't want JWT to
    // do that for us
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)

    // (6)
    refreshTokens.push(refreshToken)

    // don't forget to return refreshToken to our user
    res.json({ accessToken: accessToken, refreshToken: refreshToken })

})

// (5)
function generateAccessToken(user) {
    // now add in an expiration date 
    // usually expiresIn have short minute range like 10 - 15 minutes (10m)
    // but this we use 15s just to show you how the token is expired
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m'})
    res.json({ accessToken: accessToken })
}

// to have an application run on specific port number
app.listen(4000)
