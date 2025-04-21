const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI;
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
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the server if connection fails
  });

// API Endpoints
// Configure email transporter (use your email service config)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/api/send-report', async (req, res) => {
  try {
    const { email, csvData, fileName } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Data Report - ${fileName}`,
      text: 'Attached is your CSV data report',
      attachments: [{
        filename: `${fileName}.csv`,
        content: csvData
      }]
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Save a recording
app.post('/api/recordings', async (req, res) => {
  try {
    const { fileName, content, userEmail } = req.body;

    // Validate input
    if (!fileName || !content || !userEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await db.collection(collectionName).insertOne({
      fileName,
      content,
      userEmail,
      createdAt: new Date(),
    });

    res.status(201).json({
      message: 'Recording saved successfully',
      id: result.insertedId,
    });
  } catch (err) {
    console.error('Error saving recording:', err);
    res.status(500).json({ error: 'Failed to save recording' });
  }
});

// Delete a recording
app.delete('/api/recordings/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;

    // Validate input
    if (!fileName) {
      return res.status(400).json({ error: 'File name is required' });
    }

    const result = await db.collection(collectionName).deleteOne({ fileName });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Recording not found' });
    }

    res.json({ message: 'Recording deleted successfully' });
  } catch (err) {
    console.error('Error deleting recording:', err);
    res.status(500).json({ error: 'Failed to delete recording' });
  }
});

// Fetch all recordings
app.get('/api/recordings', async (req, res) => {
  try {
    const recordings = await db.collection(collectionName)
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.json(recordings);
  } catch (err) {
    console.error('Error fetching recordings:', err);
    res.status(500).json({ error: 'Failed to fetch recordings' });
  }
});

// Health check endpoint
app.get('/ping', async (req, res) => {
  try {
    await db.command({ ping: 1 });
    res.json({ message: 'Pong! MongoDB connection is active' });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    res.status(500).json({ error: 'MongoDB connection error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

/*
-----------------------------------------
    Mood Chart API Endpoint Functions
-----------------------------------------
*/

/*
-----------------------------------------
    Mood Chart API Endpoint Functions
-----------------------------------------
*/