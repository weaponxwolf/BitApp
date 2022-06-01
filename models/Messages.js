const mongoose = require('mongoose');

const MessagesSchema = new mongoose.Schema({
   between: Array,
   messages: [{
      from: String,
      fromemail: String,
      to: String,
      toemail: String,
      createdon: Date,
      message: String,
      unread: {
         type: Boolean,
         default: true
      }
   }]
});

module.exports = new mongoose.model("Messages", MessagesSchema);