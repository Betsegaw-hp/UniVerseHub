const mongoose = require('mongoose');


const PromotionRequestSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
    unique: true
  },
  
  requestedRole: {
    type: String,
    enum: ['moderator', 'admin'], 
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  // Optional: Admin who approves/rejects the request
  handledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    default: null
  }

}, { timestamps: true } );


// Create the model from the schema
const PromotionRequest = mongoose.model('PromotionRequest', PromotionRequestSchema);

module.exports = PromotionRequest;
