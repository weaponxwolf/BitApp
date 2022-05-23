const mongoose=require('mongoose');

const LocationsSchema=new mongoose.Schema({
  name : String,
  type : String,
  top : String,
  left : String,
  height :String,
  width : String,
  color : String,
  mapname : String
});

module.exports=new mongoose.model("Locations",LocationsSchema);