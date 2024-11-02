
const express = require('express');
const app = express();

let counter = 0;

app.get('/', (req, res) => {
  counter++;
  res.send(`Counter: ${counter}`);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
