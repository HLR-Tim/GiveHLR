const express = require('express');
const router = express.Router();
const Giveaway = require('../models/Giveaway');
const User = require('../models/User');

// Get active giveaways
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const giveaways = await Giveaway.find({ isActive: true, expiresAt: { $gt: now } });
    res.json(giveaways);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create giveaway
router.post('/create', async (req, res) => {
  try {
    const { creatorId, title, description, amount, amountPerUser, location, expiresAt } = req.body;
    const totalSlots = Math.floor(amount / amountPerUser);
    const giveaway = new Giveaway({
      creatorId, title, description, amount, amountPerUser,
      totalSlots, claimedSlots: 0,
      eligibility: { location },
      expiresAt, isActive: true
    });
    await giveaway.save();
    res.json({ message: "Giveaway created!", giveaway });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Claim giveaway with location filtering
router.post('/claim', async (req, res) => {
  try {
    const { giveawayId, userId } = req.body;
    const giveaway = await Giveaway.findById(giveawayId);
    const user = await User.findById(userId);
    if (!giveaway || !user) return res.status(404).json({ message: "Not found" });
    if (!giveaway.isActive) return res.status(400).json({ message: "Giveaway is no longer active" });
    if (giveaway.claimedSlots >= giveaway.totalSlots) return res.status(400).json({ message: "All slots have been claimed!" });
    if (giveaway.claimedBy && giveaway.claimedBy.includes(userId)) return res.status(400).json({ message: "You already claimed this giveaway!" });

    // Location check
    const requiredCountry = giveaway.eligibility?.location?.country;
    if (requiredCountry && requiredCountry.trim() !== "") {
      const userCountry = user.location?.country;
      if (!userCountry || userCountry.toLowerCase() !== requiredCountry.toLowerCase()) {
        return res.status(403).json({ message: "This giveaway is only available in " + requiredCountry });
      }
    }

    giveaway.claimedSlots += 1;
    if (!giveaway.claimedBy) giveaway.claimedBy = [];
    giveaway.claimedBy.push(userId);
    if (giveaway.claimedSlots >= giveaway.totalSlots) giveaway.isActive = false;
    await giveaway.save();

    user.totalReceived = (user.totalReceived || 0) + giveaway.amountPerUser;
    await user.save();

    res.json({ message: "Giveaway claimed successfully! You received " + giveaway.amountPerUser + " Pi!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find().sort({ totalReceived: -1 }).limit(10).select('username totalReceived');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
