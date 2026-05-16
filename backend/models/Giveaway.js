const mongoose = require('mongoose');

const GiveawaySchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  amount: { type: Number, required: true },
  amountPerUser: { type: Number, required: true },
  totalSlots: { type: Number, required: true },
  claimedSlots: { type: Number, default: 0 },
  claimedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  eligibility: {
    location: {
      country: { type: String, default: "" },
      city: { type: String, default: "" }
    }
  },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Giveaway', GiveawaySchema);
