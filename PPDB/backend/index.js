const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

const authRoutes = require('./routes/authRoutes');

app.use(cors()); 
app.use(express.json()); 

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Battle control online - API is running');
});

app.listen(port, () => {
  console.log(`Kiciyo my wife online :3 di http://localhost:${port}`);
});