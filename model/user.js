const mongoose = require('mongoose');
const  { isEmail } = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { default: isURL } = require('validator/lib/isURL');
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
    bio: {
      type: String,
      minlength: 20,
      maxlength: 250
    },
    address: {
        type: String
    },
    occupation: String,
    avatarUrl: { 
        type: String,
        validate: [isURL, 'make sure it is URL!']
    },
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


    // set deafult avatarUrl (dicebear as a provider)
    if(!this.avatarUrl) {
        const avatarCategory = ["lorelei", "initials", "thumbs", "identicon"];
        const avatarSeed = this.name;
        this.avatarUrl = `https://api.dicebear.com/9.x/${avatarCategory[0]}/svg?seed=${avatarSeed}&backgroundType=solid,gradientLinear&backgroundRotation=0,360,20,40&glassesProbability=25&hairAccessoriesProbability=10&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf,transparent`;
    }

    // set default username
    if (!this.username) {
        console.log(this.username)
      // Create default username from name and email
      this.username = `${this.name.trim().replace(/\s+/g, '_').toLowerCase()}_${this.email.split('@')[0].slice(0, 4)}_${crypto.randomBytes(3).toString('hex')}`;
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