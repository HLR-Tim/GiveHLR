const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Generate referral code
const generateReferralCode = (username) => {
  return username.toUpperCase().slice(0, 4) + Math.random().toString(36).slice(2, 6).toUpperCase();
};

// Pi Login
router.post('/pi-login', async (req, res) => {
  try {
    const { piUid, username, accessToken, referralCode } = req.body;
    let user = await User.findOne({ piUid });
    if (!user) {
      const newReferralCode = generateReferralCode(username);
      user = new User({ piUid, username, accessToken, referralCode: newReferralCode });
      // Handle referral
      if (referralCode) {
        const referrer = await User.findOne({ referralCode });
        if (referrer && referrer.piUid !== piUid) {
          user.referredBy = referrer._id;
          referrer.referralCount += 1;
          await referrer.save();
        }
      }
      await user.save();
    } else {
      user.accessToken = accessToken;
      user.username = username;
      if (!user.referralCode) user.referralCode = generateReferralCode(username);
      await user.save();
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-accessToken')
      .populate('referredBy', 'username');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Follow
router.post('/follow', async (req, res) => {
  try {
    const { followerId, targetId } = req.body;
    if (followerId === targetId) return res.status(400).json({ message: "You can't follow yourself!" });
    const follower = await User.findById(followerId);
    const target = await User.findById(targetId);
    if (!follower || !target) return res.status(404).json({ message: "User not found" });
    if (follower.following.includes(targetId)) return res.status(400).json({ message: "Already following!" });
    follower.following.push(targetId);
    target.followers.push(followerId);
    await follower.save();
    await target.save();
    res.json({ message: "Followed successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unfollow
router.post('/unfollow', async (req, res) => {
  try {
    const { followerId, targetId } = req.body;
    const follower = await User.findById(followerId);
    const target = await User.findById(targetId);
    if (!follower || !target) return res.status(404).json({ message: "User not found" });
    follower.following = follower.following.filter(id => id.toString() !== targetId);
    target.followers = target.followers.filter(id => id.toString() !== followerId);
    await follower.save();
    await target.save();
    res.json({ message: "Unfollowed successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get celebrities
router.get('/celebrities', async (req, res) => {
  try {
    const celebrities = await User.find({ isCelebrity: true }).select('username followers isCelebrity');
    res.json(celebrities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;