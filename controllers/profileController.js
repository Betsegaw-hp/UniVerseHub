const {ForumPost} = require('../model/forum');
const User = require('../model/user');
const handleErrors = require('../utils/errorHandler');

const profile_get = async (req, res) => {

    try {

        if(req.params.username === res.locals.user.username) {

            const posts = await ForumPost.find({ author: res.locals.user._id });
            res.render('profile', { title: "Profile", posts, currentUser: true });
        } else {
            const username = req.params.username;
            const user = await User.findOne({ username });
            if(!user) {
                return res.redirect('../404');
            }
    
            const posts = await ForumPost.find({ author: user._id });
            res.render('profile', { title: "Profile", posts, otherUser: user, currentUser: false });
        }

    } catch (err) {
        console.error(err);
        return res.redirect('../404');
    }


}

const profile_edit_get = (req, res) => {
    res.render('profile/editProfile', { title: "Update Profile"});
}

const profile_update_put = async (req,res) => {
    const  {
        name, username, bio,
        address, occupation, avatarUrl
    } = req.body;

    try {
        if(username === '' ) return res.status(400).json({ error: "username can't be empty!"});
        if(name === '' ) return res.status(400).json({ error: "name can't be empty!"});

        const updatedUser = await User.findByIdAndUpdate( 
            res.locals.user._id, 
            {
                name, username, bio,
                address, occupation, avatarUrl
            }, 
            {new : true, rrunValidators: true}
        ).exec();

        console.log("updated:" , updatedUser);

        res.status(200).json({ user: updatedUser });

    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
        console.log(err); 
    }
}

const getProfileByUsername = async (username) => {
   
    try {
        
        const user = await User.findOne({ username });
        if(!user) {
            return null;
        }

        return user;

    } catch (err) {
        
    }
}

module.exports = { 
    profile_get,
    profile_edit_get,
    profile_update_put
 };