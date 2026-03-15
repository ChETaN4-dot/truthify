// truthify-backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// 👉 ADD THIS LINE TO ENABLE YOUR NEW ROUTES:
app.use('/api/auth', require('./routes/authroutes'));
app.use('/api/scans', require('./routes/scanroutes'));

app.get('/', (req, res) => {
  res.send('TRUTHIFY Backend is ALIVE!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});