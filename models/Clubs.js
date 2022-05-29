const mongoose = require('mongoose');

const ClubsSchema = new mongoose.Schema({
  email: String,
  password: String,
  members: Array,
  events: [{
    name: String,
    location: String,
    locdata:Object,
    startdate: String,
    enddate: String,
    starttime: String,
    endtime: String,
    description: String,
    eventImage: String,
    eventIcon: String,
    isDeleted : Boolean
  }]
});

module.exports = new mongoose.model("Clubs", ClubsSchema);