const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('battle control online');
});

app.listen(port, () => {
  console.log(`kiciyo my wife online :3 di http://localhost:${port}`);
});