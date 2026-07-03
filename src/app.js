require('dotenv').config();

const express = require('express');
const createApp = require('./createApp');
const docsRoutes = require('./routes/docsRoutes');

const app = createApp();
const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Analytics service running on port ${PORT}`);
});

if (process.env.PORT_DOCS) {
  const docsApp = express();
  docsApp.use(docsRoutes);
  docsApp.listen(process.env.PORT_DOCS, () => {
    console.log(`API docs available on http://localhost:${process.env.PORT_DOCS}/api/docs`);
  });
}

module.exports = app;
