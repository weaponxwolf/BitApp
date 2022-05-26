const mongoose = require('mongoose');

const PostsSchema = new mongoose.Schema({
   title: String,
   paragraph: String,
   createdby: String,
   createdon: Date,
   ImageName: String,
   ImageLink: String,
   images: Array,
   body: String,
   type: String,
   clubname: String,
   isDeleted: Boolean,
   likes: Number,
   Comments: [{
      commentby: String,
      commentbyname: String,
      comment: String,
      commentedon: Date
   }],
   popularity: Number
});

module.exports = new mongoose.model("Posts", PostsSchema);