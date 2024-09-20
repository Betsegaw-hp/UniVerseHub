const PromotionRequest = require('../model/promotionRequest');
const User = require('../model/user');
const handleErrors = require('../utils/errorHandler');

const admin_page_get = async (req, res) => {

    try {

        const promotionRequests = await PromotionRequest.find({ status: "pending" })
                                                        .populate('user', 'name username role');
        const allUsers = await User.find();
        
        res.render('admin', { title: "Admin Dashboard | UniVerseHub", promotionRequests, allUsers});
    } catch (err) {
        console.error(err);
        res.status(500).json({ errors: err});
    }
}

const suspend_user_put = async (req, res) => {
    const id = req.params.id;

    try {
        const user = await User.findById(id);

        if(user.status == "suspended") {
            return res.status(400).json({ error: "User Already Supended!"});
        }
        user.status = "suspended";
        await user.save();

        console.log("done: ", user.status);

        res.status(200).json({ msg: "User Supended!"});
    } catch (err) {
        console.error(err);
        res.status(500).json( { error: err });
    }
}
const reactivate_user_put = async (req, res) => {
    const id = req.params.id;

    try {
        const user = await User.findById(id);

        if(user.status == "active") {
            return res.status(400).json({ error: "User Already Active!"});
        }
        user.status = 'active';
        await user.save();

        console.log("done: ", user.status);

        res.status(200).json({ msg: "User Reactivated!"});
    } catch (err) {
        console.error(err);
        res.status(500).json( { error: err });
    }
}

const role_requests_get = async  (req, res) => {
    try {

        const promotionRequests = await PromotionRequest.find()
                                                        .populate('user', 'name username role')
                                                        .populate('handledBy', 'username');
        
        res.render('admin/role-request', { title: "Role Requests | UniVerseHub ", promotionRequests});
    } catch (err) {
        console.error(err);
        res.status(500).json({ errors: err});
    }
}

const approve_role_request_put = async (req, res) => {
    const requestId = req.params.id;

    try {
        const promotionRequest = await PromotionRequest.findById(requestId);

        promotionRequest.status = 'approved';
        promotionRequest.handledBy = res.locals.user._id;
        
        const user = await User.findByIdAndUpdate(
            promotionRequest.user,
            { role: promotionRequest.requestedRole },
            { new: true, runValidators: true}
        );

        await promotionRequest.save();

        console.log("Request Approved!", promotionRequest, user);

        res.status(200).json({ msg: "Request Approved!", promotionRequest});
    } catch (err) {
        console.error(err);
        res.status(500).json({ errors: err});
    }
}

const reject_role_request_put = async (req, res) => {
    const requestId = req.params.id;

    try {
        const promotionRequest = await PromotionRequest.findById(requestId);

        promotionRequest.status = 'rejected';
        promotionRequest.handledBy = res.locals.user._id;

        await promotionRequest.save();

        console.log("Request Rejected!", promotionRequest)

        res.status(200).json({ msg: "Request Rejected!", promotionRequest});
    } catch (err) {
        console.error(err);
        res.status(500).json({ errors: err});
    }
}


const users_get = async (req, res ) => {
    try {
        const allUsers = await User.find();

        res.render('admin/users', { title: "All Users | UniVerseHub", users: allUsers});

    } catch (err) {
        console.error(err);
        res.status(500).json({ errors: err});
    }
}

const force_edit_user = async (req, res) => {
    const {
        role,
        newPassword,
        userId
    } = req.body;

    try {
        if(!role && !newPassword) {
            return res.status(400).json({ error: "fill atleast one field!" });
        }

        if(role) {
            const user = await User.findByIdAndUpdate(
                userId,
                { role },
                {new: true, runValidators: true}
            );

            console.log("role updated: ", user.role);
        }

        if(newPassword) {

           const  user = await User.findById(userId);
           user.password = newPassword;

            // used this method specifically to trigger pre('save') hook for hashing
           await user.save();

           console.log("password updated: ", user.password);
        }

        res.status(200).json({ msg: "Updated successfully!" });
        
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
        console.error(err);
    }
}

module.exports = {
    admin_page_get,
    suspend_user_put,
    reactivate_user_put,
    role_requests_get,
    approve_role_request_put,
    reject_role_request_put,
    users_get,
    force_edit_user
}