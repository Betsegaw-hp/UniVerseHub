const { json } = require('express');
const User = require('../model/user');
const jwt = require('jsonwebtoken');

const auth_page_get = (req, res ) => {
    res.render('auth/index');
};

const login_post = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    
    
};

const signup_post  = async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await User.create({name, email, password});

        res.status(200).json(user);
    } catch (err) {
        res.status(400).json({
            message: "user not created",
            error_type: err.name,
            error: err.message
        })
        console.error(err)
    }
};

module.exports = {
    auth_page_get,
    login_post,
    signup_post
};