const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  piUid: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  accessToken: { type: String },
  isCelebrity: { type: Boolean, default: false },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  totalReceived: { type: Number, default: 0 },
  totalGiven: { type: Number, default: 0 },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referralCount: { type: Number, default: 0 },
  location: {
    country: { type: String, default: "" },
    city: { type: String, default: "" }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);