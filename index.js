const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT =  5000;

// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.get('/', (req, res) => {
  res.send('Code Execution Website API');
});

app.use('/api/submissions', require('./routes/submissions'));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
