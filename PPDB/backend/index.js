require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const jurusanRoutes = require('./routes/jurusanRoutes');
const userRoutes = require('./routes/userRoutes');
const listUserRoutes = require('./routes/listUserRoutes');
const listDataUserRoutes = require('./routes/listDataUserRoutes');
const inboxRoutes = require('./routes/inboxRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const pdfRoutes = require('./routes/pdfRoutes');

app.use(cors()); 
app.use(express.json()); 

app.use('/avatars', express.static(path.join(__dirname, 'public/avatars')));
app.use('/jurusan', express.static(path.join(__dirname, 'public/jurusan')));
app.use('/ijazah', express.static(path.join(__dirname, 'public/ijazah')));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jurusan', jurusanRoutes);
app.use('/api/user', userRoutes);
app.use('/api/list_user', listUserRoutes);
app.use('/api/list_data_user', listDataUserRoutes);
app.use('/api/inbox', inboxRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/pdf', pdfRoutes);

app.get('/', (req, res) => {
  res.send('Battle control online - API is running');
});

app.listen(port, () => {
  console.log(`Kiciyo my wife online :3 di http://localhost:${port}`);
});