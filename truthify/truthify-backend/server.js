// truthify-backend/server.js
// Fix for Node 18+ IPv6-first DNS breaking MongoDB SRV lookups
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const fssaiRoutes = require('./routes/fssairoutes');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// 👉 ADD THIS LINE TO ENABLE YOUR NEW ROUTES:
app.use('/api/auth', require('./routes/authroutes'));
app.use('/api/scans', require('./routes/scanroutes'));
app.use('/api/profile', require('./routes/profileroutes'));
app.use('/api/fssai', fssaiRoutes);

app.get('/', (req, res) => {
  res.send('TRUTHIFY Backend is ALIVE!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});