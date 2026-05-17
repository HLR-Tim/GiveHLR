const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const GiveawaySchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creatorUsername: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, default: 'General',
    enum: ['General', 'Gaming', 'Education', 'Food', 'Tech', 'Music', 'Sports', 'Fashion', 'Other']
  },
  amount: { type: Number, required: true },
  amountPerUser: { type: Number, required: true },
  totalSlots: { type: Number, required: true },
  claimedSlots: { type: Number, default: 0 },
  claimedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [CommentSchema],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  eligibility: {
    location: {
      country: { type: String, default: "" },
      city: { type: String, default: "" }
    }
  },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, required: true },
  paymentId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Giveaway', GiveawaySchema);