const mongoose = require('mongoose');

const MessagesSchema = new mongoose.Schema({
   message: String,
   from: String,
   fromemail: String,
   to: String,
   toemail: String,
   createdon: Date
});

module.exports = new mongoose.model("Messages", MessagesSchema);