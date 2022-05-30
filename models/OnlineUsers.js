const mongoose = require('mongoose');

const UsersOnlineSchema = new mongoose.Schema({
  email: String,
  name:  String,
  socketID : String,
  branch : String,
  section : String
});

module.exports = new mongoose.model("OnlineUsers", UsersOnlineSchema);