const mongoose=require('mongoose');

const ClubsSchema=new mongoose.Schema({
  email : String,
  password : String,
  members : Array
});

module.exports=new mongoose.model("Clubs",ClubsSchema);