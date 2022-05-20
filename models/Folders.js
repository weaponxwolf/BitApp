const mongoose=require('mongoose');

const FolderSchema=new mongoose.Schema({
    name : String,
    createdby : String,
    createdbyname : String,
    createdon : Date,
    location : String,
    isDeleted : Boolean,
    accessto :[{
        name : String,
        mountlocation : String
    }]
});

module.exports=new mongoose.model("Folders",FolderSchema);