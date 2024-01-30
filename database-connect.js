const mongoose = require('mongoose');

let db = mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Database connection successfull");
  
}).catch(err => {
  console.error("Error connecting to database");
  
});

module.exports = db;