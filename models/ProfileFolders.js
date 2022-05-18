const mongoose=require('mongoose');

const ProfileFoldersSchema=new mongoose.Schema({
    name : String,
    filetype : String,
    size : Number,
    createdby : String,
    createdon : Date,
    location : String,
    filelocation :String,
    isDeleted : Boolean,
    accessto :[
        {
            name : String,
            email : String
        }
    ]
});

module.exports=new mongoose.model("ProfileFolders",ProfileFoldersSchema);