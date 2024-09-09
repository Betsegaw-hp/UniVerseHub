const jwt  = require('jsonwebtoken');
const User = require('../model/user');

const requireAuth = (req, res, next) => {
    
    const token = req.cookies.jwt;

    if(token) {
        jwt.verify(token, 'guada secret', (err, decodedToken) => {
            if(err) {
                console.error(err);
                res.redirect('/auth');
            } else {
                console.log(decodedToken);
                
                next();
            }
        });
    } else res.redirect('/auth');
}

const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;

    if(token) {
        jwt.verify(token, 'guada secret', async (err, decodedToken) => {
            if(err) {
                console.log(err);
                res.locals.user = null;
                next();
            } else {
                console.log(decodedToken);
                const user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
}

module.exports = {requireAuth, checkUser};