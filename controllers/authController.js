const User = require('../model/user');
const jwt = require('jsonwebtoken');
const handleErrors = require('../utils/errorHandler');


const maxAge = 1 * 24 * 60 * 60; // 1 day
const createToken = (id) => {
    return jwt.sign({id}, 'guada secret', {
        expiresIn: maxAge // in sec
    });
}

const auth_page_get = (req, res ) => {
    res.render('auth/index');
};

const login_post = async (req, res) => {
    const {
        email, password
    } = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000, sameSite: true });
        res.status(200).json(user);
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({errors});
        console.log(errors);
    }
    
    
};

const signup_post  = async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await User.create({name, email, password});
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000, sameSite: true });
        res.status(200).json(user);
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({errors});
        console.error(errors);
    }
};

const auth_logout = (req, res) => {
    
    res.cookie('jwt', '', {maxAge: 1});
    res.redirect('/');
}

const username_availability_get = async (req, res) => {
    const { username } = req.query;

    try {
        // Check if the username exists in the database
        const user = await User.findOne({ username });
        
        let isAvailable = false;

        if (user) {
            // Username is taken
            // but
            if(user.username === res.locals.user.username) isAvailable = true;
        } else {
            // Username is available
            isAvailable = true;
        }

        return res.status(200).json({ available: isAvailable });
        
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({errors});
        console.error(errors);
    }
}

module.exports = {
    auth_page_get,
    login_post,
    signup_post,
    auth_logout,
    username_availability_get
};