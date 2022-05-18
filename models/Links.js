const mongoose=require('mongoose');

const LinksSchema=new mongoose.Schema({
    name : String,
    link : String,
    createdby : String,
    createdon : Date,
    linklocation :String,
    isDeleted : Boolean,
    accessto :[
        {
            name : String,
            email : String
        }
    ]
});

module.exports=new mongoose.model("Links",LinksSchema);