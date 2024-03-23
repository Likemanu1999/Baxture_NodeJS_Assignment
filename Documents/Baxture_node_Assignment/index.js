const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const route = require("./src/Route/UserRoute")
const PORT = process.env.PORT || 4000;
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (!process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }).then(() => {
        console.log('Connected to MongoDB');
      }).catch(err => {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
      });
}

app.use('/', route)
app.listen(PORT, () => {
    console.log(`Worker ${process.pid} listening on port ${PORT}`);
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log(`Worker ${process.pid} exiting...`);
    process.exit(0);
  });