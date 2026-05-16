const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const giveawayRoutes = require('./routes/giveaway');
const taskRoutes = require('./routes/tasks');

app.use('/api/auth', authRoutes);
app.use('/api/giveaways', giveawayRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'PiGive API is running!' });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pigive';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected!');
    app.listen(PORT, () => {
      console.log('Server running on port ' + PORT);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
