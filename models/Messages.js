const mongoose=require('mongoose');

const MessagesSchema=new mongoose.Schema({
   message : String,
   messageby : String,
   byemail: String,
   messageto : String,
   createdon : Date
});

module.exports=new mongoose.model("Messages",MessagesSchema);