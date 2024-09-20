const {ForumPost} = require('../model/forum');
const User = require('../model/user');
const PromotionRequest = require('../model/promotionRequest')
const handleErrors = require('../utils/errorHandler');

const profile_get = async (req, res) => {

    try {


        if(req.params.username === res.locals.user.username) {

            const posts = await ForumPost.find({ author: res.locals.user._id });
            const aggregateStats = await getAggragateUserStat(res.locals.user._id);
            const promotionRequest = await PromotionRequest.findOne({user : res.locals.user._id});

            res.render('profile', { title: `Profile - ${res.locals.user.username}`, posts, aggregateStats, promotionRequest, currentUser: true });
        } else {
            const username = req.params.username;
            const user = await User.findOne({ username });

            if(!user) return res.redirect('../404');
    
            const posts = await ForumPost.find({ author: user._id });
            const aggregateStats = await getAggragateUserStat(user._id);
            res.render('profile', { title: `Profile - ${user.username}`, posts, otherUser: user, aggregateStats,  currentUser: false });
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

const password_update_put = async (req, res) => {
    const {
        currentPassword,
        newPassword,
        confirmNewPassword
    } = req.body;

    try {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ error: "All fields are required!" });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ error: "Passwords do not match!" });
        }

        const user = await User.login(res.locals.user.email, currentPassword);

        user.password = newPassword;

        // used this method specifically to trigger pre('save') hook for hashing
        await user.save()

        //TODO: to increase security, Invalidating jwt token from the server is a must
        // now i am just depending on the client(script) to logout
        res.status(300).json({ redirect: '/auth/logout'});

    } catch (err) {
        if(err.message = "incorrect password") {
            return res.status(400).json({ error: "Incorrect current password!" });
        }
        const errors = handleErrors(err);
        res.status(400).json({ errors });
        console.error(err);
    }
}


const role_request_post = async (req, res) => {
    const { role } = req.body;
    try {
        if(!role) {
            return res.status(400).json({ error: "role can't be empty!"});
        }
        if(role.toLowerCase() === res.locals.user.role) {
            return res.status(400).json({ error: `You are already ${role}! No need for this request.`});
        }

        let promotionRequest = await PromotionRequest.findOne({ user: res.locals.user._id});
        if(promotionRequest) {

            promotionRequest.requestedRole = role;
            promotionRequest.status = 'pending';
           await promotionRequest.save();

        } else {
            promotionRequest = await PromotionRequest.create({
                user: res.locals.user._id,
                requestedRole: role.toLowerCase()
            });
        }
        

        console.log("request made: ", promotionRequest);

        res.status(200).json({ msg: "request made successfully", promotionRequest })
    } catch (err) {
        console.error(err);
        res.status(500).json({ errors: err});
    }
}

const getAggragateUserStat = async (userId) => {
    try {
        const stats = await ForumPost.aggregate([
            {
                $match: { author: userId }  // Filter by author
            },
            {
                $group: {
                    _id: "$author",
                    totalLikes: { $sum: "$likeCount" }  // Sum the likes for all posts by this user
                }
            }]
        );

        return stats[0];
    } catch (err) {
        console.error(err);
        return null;
    }
}

module.exports = { 
    profile_get,
    profile_edit_get,
    profile_update_put,
    password_update_put,
    role_request_post
 };