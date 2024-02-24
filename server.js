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





// (3) test accessToken
// get the token that they send us
// verify that this is the correct user 
// and then return that user up into the function get '/posts'
function authenticateToken(req, res, next) {
    // the token comes from the header
    // we're going to have a header called bearer
    // the token comes after the keyword bearer

    // to get to the authorization header
    // which have the format of Bearer followed by TOKEN
    // like this
    // Bearer TOKEN 
    const authHeader = req.headers['authorization']
    // then get our token by split on whitespace
    // short circuit: if we have an authHeader then return our token
    // otherwise just return undefined
    const token = authHeader && authHeader.split(',')[1]

    // if token is null - user don't have access
    if (token == null) return res.sendStatus(401)

    // now we have a valid token, we want to verify the token
    // jwt.verify(toke, secret, callback consists of error and value we serialized
    //      which in our case is a user object)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        // if there's an error, like you have a token, but token is invalid
        // they don't have access
        if (err) return res.sendStatus(403)

        // now we have a valid token
        // so set a user on our request
        req.user = user
        next() // move on from our middleware

    })

}


// to have an application run on specific port number
app.listen(3000)
