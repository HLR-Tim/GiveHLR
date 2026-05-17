const express = require('express');
const router = express.Router();
const Giveaway = require('../models/Giveaway');
const User = require('../models/User');

// GET all active giveaways
router.get('/active', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true, expiresAt: { $gt: new Date() } };
    if (category && category !== 'All') filter.category = category;
    const giveaways = await Giveaway.find(filter).sort({ createdAt: -1 });
    res.json(giveaways);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LEADERBOARD — must be before /:id
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find().sort({ totalReceived: -1 }).limit(10).select('username totalReceived');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ANALYTICS for a creator — must be before /:id
router.get('/analytics/:creatorId', async (req, res) => {
  try {
    const { creatorId } = req.params;
    const giveaways = await Giveaway.find({ creatorId });
    const totalGiveaways = giveaways.length;
    const totalPiGiven = giveaways.reduce((sum, g) => sum + (g.amountPerUser * g.claimedSlots), 0);
    const totalSlots = giveaways.reduce((sum, g) => sum + g.totalSlots, 0);
    const totalClaimed = giveaways.reduce((sum, g) => sum + g.claimedSlots, 0);
    const activeGiveaways = giveaways.filter(g => g.isActive).length;
    const claimRate = totalSlots > 0 ? Math.round((totalClaimed / totalSlots) * 100) : 0;
    const recentGiveaways = giveaways
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(g => ({
        _id: g._id, title: g.title, category: g.category,
        amount: g.amount, amountPerUser: g.amountPerUser,
        totalSlots: g.totalSlots, claimedSlots: g.claimedSlots,
        isActive: g.isActive, expiresAt: g.expiresAt,
        claimRate: g.totalSlots > 0 ? Math.round((g.claimedSlots / g.totalSlots) * 100) : 0
      }));
    res.json({ totalGiveaways, totalPiGiven, totalSlots, totalClaimed, activeGiveaways, claimRate, recentGiveaways });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single giveaway
router.get('/:id', async (req, res) => {
  try {
    const giveaway = await Giveaway.findById(req.params.id);
    if (!giveaway) return res.status(404).json({ message: 'Giveaway not found' });
    res.json(giveaway);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE giveaway
router.post('/create', async (req, res) => {
  try {
    const { title, description, category, amount, amountPerUser, totalSlots,
      creatorId, creatorUsername, expiresAt, location, paymentId } = req.body;
    const giveaway = new Giveaway({
      title, description, category: category || 'General',
      amount, amountPerUser,
      totalSlots: totalSlots || Math.floor(amount / amountPerUser),
      creatorId, creatorUsername, expiresAt,
      eligibility: { location: { country: location?.country || "" } },
      paymentId, claimedSlots: 0, isActive: true
    });
    await giveaway.save();
    res.status(201).json(giveaway);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CLAIM a giveaway
router.post('/claim', async (req, res) => {
  try {
    const { giveawayId, userId } = req.body;
    const giveaway = await Giveaway.findById(giveawayId);
    if (!giveaway) return res.status(404).json({ message: 'Giveaway not found' });
    if (!giveaway.isActive) return res.status(400).json({ message: 'Giveaway is no longer active' });
    if (new Date() > new Date(giveaway.expiresAt)) return res.status(400).json({ message: 'Giveaway has expired' });
    if (giveaway.claimedBy.includes(userId)) return res.status(400).json({ message: 'You already claimed this giveaway!' });
    if (giveaway.claimedSlots >= giveaway.totalSlots) return res.status(400).json({ message: 'All slots have been claimed' });

    giveaway.claimedSlots += 1;
    giveaway.claimedBy.push(userId);
    if (giveaway.claimedSlots >= giveaway.totalSlots) giveaway.isActive = false;
    await giveaway.save();

    // Update user stats
    await User.findByIdAndUpdate(userId, { $inc: { totalReceived: giveaway.amountPerUser } });
    await User.findByIdAndUpdate(giveaway.creatorId, { $inc: { totalGiven: giveaway.amountPerUser } });

    res.json({ message: 'Giveaway claimed successfully! 🎉', giveaway });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADD comment
router.post('/:id/comment', async (req, res) => {
  try {
    const { userId, username, text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Comment cannot be empty' });
    const giveaway = await Giveaway.findById(req.params.id);
    if (!giveaway) return res.status(404).json({ message: 'Giveaway not found' });
    giveaway.comments.push({ userId, username, text: text.trim() });
    await giveaway.save();
    res.json({ message: 'Comment added!', comments: giveaway.comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LIKE / UNLIKE giveaway
router.post('/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const giveaway = await Giveaway.findById(req.params.id);
    if (!giveaway) return res.status(404).json({ message: 'Giveaway not found' });
    const liked = giveaway.likes.includes(userId);
    if (liked) {
      giveaway.likes = giveaway.likes.filter(id => id.toString() !== userId);
    } else {
      giveaway.likes.push(userId);
    }
    await giveaway.save();
    res.json({ liked: !liked, likeCount: giveaway.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CLOSE giveaway
router.delete('/:id', async (req, res) => {
  try {
    const giveaway = await Giveaway.findById(req.params.id);
    if (!giveaway) return res.status(404).json({ message: 'Giveaway not found' });
    giveaway.isActive = false;
    await giveaway.save();
    res.json({ message: 'Giveaway closed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;