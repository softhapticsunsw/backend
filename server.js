// server.js
require('dotenv').config(); // Add this line at the top
const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
app.use(express.json());

const MONGO_URI = process.env.MONGODB_URI; // From environment variables
const client = new MongoClient(MONGO_URI);

app.post('/recordings', async (req, res) => {
  try {
    const db = client.db('cloudrecordings');
    await db.collection('recordings').insertOne(req.body);
    res.status(201).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/recordings/:userId', async (req, res) => {
  try {
    const db = client.db('cloudrecordings');
    const recordings = await db.collection('recordings')
      .find({ userId: req.params.userId })
      .toArray();
    res.json(recordings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize connection and start server
client.connect().then(() => {
  app.listen(3000, () => console.log('API running on port 3000'));
});