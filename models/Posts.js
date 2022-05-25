const mongoose=require('mongoose');

const PostsSchema=new mongoose.Schema({
   title : String,
   paragraph : String,
   createdby : String,
   createdon : Date,
   ImageName : String,
   ImageLink : String,
   images : Array,
   body : String,
   type : String,
   clubname : String
});

module.exports=new mongoose.model("Posts",PostsSchema);