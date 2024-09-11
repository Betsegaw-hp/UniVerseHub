const mongoose = require('mongoose');
const  { isEmail } = require('validator');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: [ isEmail , "please enter valid email!"]
    },
    name: {
        type: String,
        required: true,
        lowercase: true
    },
    avatarUrl: String,
    roles: {
        type: [String],
        default: ['user']
    },
    username: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    stats: {
        postCount: { type: Number, default: 0, min: 0 },
        commentCount: { type: Number, default: 0, min: 0 },
        videoCount: { type: Number, default: 0, min: 0 }
    }
}, { timestamps: true});

userSchema.pre('save', async function (next) {
    // Pre-save hook to set default username
    if (!this.username) {
      // Create default username from name and email
      this.username = `${this.name.replace(/\s+/g, '_').toLowerCase()}_${this.email.split('@')[0]}${new Date().getUTCSeconds().toString()}`;
    }

    if (!this.isModified('password')) return next(); // Skip hashing if password hasn't changed
    // hashing
    try {
        const salt = await bcrypt.genSalt();
        this.password = await bcrypt.hash(this.password, salt);
        next(); 
    } catch (error) {
        next(error); 
    }
  });

  // static method for login

  userSchema.statics.login = async function( email, password) {
    const user = await this.findOne({ email });
    if(user) {
        const auth = await bcrypt.compare(password, user.password);
        if(auth) {
            return user;
        }
        throw Error("incorrect password");
    }
    throw Error("incorrect email");
  };

const User = mongoose.model('User', userSchema);

module.exports = User;