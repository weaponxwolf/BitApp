const mongoose=require('mongoose');

const FilesSchema=new mongoose.Schema({
    name : String,
    filetype : String,
    size : Number,
    createdby : String,
    createdbyname : String,
    createdon : Date,
    location : String,
    filelocation :String,
    isDeleted : Boolean,
    accessto :[
        {
            name : String,
            mountlocation : String
        }
    ]
});

module.exports=new mongoose.model("Files",FilesSchema);