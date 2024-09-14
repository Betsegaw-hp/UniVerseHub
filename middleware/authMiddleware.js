const jwt  = require('jsonwebtoken');
const User = require('../model/user');

const requireAuth = (req, res, next) => {
    
    const token = req.cookies.jwt;

    if(token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if(err) {
                console.error(err);
                res.redirect('/auth');
            } else {
                // console.log(decodedToken);
                
                next();
            }
        });
    } else res.redirect('/auth');
}

const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;

    if(token) {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if(err) {
                console.log(err);
                res.locals.user = null;
                next();
            } else {
                try {
                    const user = await User.findById(decodedToken.id);
                    res.locals.user = user;  
                    next();
                } catch (err) {
                    console.error('Error finding user:', err);
                    res.locals.user = null;
                    next();
                }
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
}

const requireRole = (roles) => {
    return (req, res, next) => {
        const token = req.cookies.jwt;

        if (token) {
            jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
                if (err) {
                    console.error(err);
                    return res.status(401).json({ error: 'Unauthorized access' });
                } else {
                    try {
                        const user = await User.findById(decodedToken.id);
                        if (roles.includes(user.role)) {
                            next();  // User has the required role, proceed to the route
                        } else {
                            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
                        }
                    } catch (err) {
                        console.error('Error finding user:', err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }
                }
            });
        } else {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }
    };
};

module.exports = {requireAuth, checkUser, requireRole};