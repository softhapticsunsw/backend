const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://dbUser:dbPass@cluster0.bt3feo0.mongodb.net/';
const dbName = 'cloudrecordings';
const collectionName = 'recordings';

// Middleware
app.use(cors());
app.use(express.json());

let db;

// Connect to MongoDB
MongoClient.connect(mongoUri, { useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    console.log('Connected to MongoDB');
  })
  .catch(err => console.error('MongoDB connection error:', err));

// API Endpoints
app.post('/api/recordings', async (req, res) => {
  try {
    const { fileName, content, userEmail } = req.body;

    const result = await db.collection(collectionName).insertOne({
      fileName,
      content,
      userEmail,
      createdAt: new Date()
    });

    res.status(201).json({
      message: 'Recording saved successfully',
      id: result.insertedId
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save recording' });
  }
});

app.delete('/api/recordings/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const result = await db.collection(collectionName).deleteOne({ fileName });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Recording not found' });
    }

    res.json({ message: 'Recording deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete recording' });
  }
});

app.get('/api/recordings', async (req, res) => {
  try {
    const recordings = await db.collection(collectionName)
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.json(recordings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recordings' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
