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
   liked: Boolean,
   nooflikes: Number,
   noofcomments:Number,
   likes: [{
      likedby: String,
      likedbyname: String
   }],
   comments: [{
      commentby: String,
      commentbyname: String,
      comment: String,
      commentedon: Date
   }],
   popularity: Number
});

PostsSchema.virtual('likescount').get(function () {
   return this.likes.length;
});
PostsSchema.virtual('commentscount').get(function () {
   return this.comments.length;
});

module.exports = new mongoose.model("Posts", PostsSchema);