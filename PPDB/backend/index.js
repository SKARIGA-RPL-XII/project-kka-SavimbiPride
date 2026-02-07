const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const jurusanRoutes = require('./routes/jurusanRoutes');

app.use(cors()); 
app.use(express.json()); 

app.use('/avatars', express.static(path.join(__dirname, 'public/avatars')));
app.use('/jurusan', express.static(path.join(__dirname, 'public/jurusan')));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jurusan', jurusanRoutes);

app.get('/', (req, res) => {
  res.send('Battle control online - API is running');
});

app.listen(port, () => {
  console.log(`Kiciyo my wife online :3 di http://localhost:${port}`);
});