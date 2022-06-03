const mongoose = require('mongoose');

const TempPostsSchema = new mongoose.Schema({
   title: String,
   paragraph: String,
   createdby: String,
   createdbyname: String,
   createdon: Date,
   ImageName: String,
   ImageLink: String,
   images: Array,
   body: String,
   type: String,
   clubname: String,
   isDeleted: Boolean,
});


module.exports = new mongoose.model("TempPosts", TempPostsSchema);