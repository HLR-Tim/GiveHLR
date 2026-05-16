const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');

// Get all active tasks
router.get('/active', async (req, res) => {
  try {
    const tasks = await Task.find({ isActive: true });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete a task
router.post('/complete', async (req, res) => {
  try {
    const { taskId, userId } = req.body;
    const task = await Task.findById(taskId);
    const user = await User.findById(userId);
    if (!task || !user) return res.status(404).json({ message: "Task or user not found" });
    if (task.completedBy.includes(userId)) return res.status(400).json({ message: "Task already completed!" });
    task.completedBy.push(userId);
    user.totalReceived += task.reward;
    await task.save();
    await user.save();
    res.json({ message: "Task completed! You earned " + task.reward + " Pi!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
