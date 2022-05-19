const mongoose=require('mongoose');

const UserSchema=new mongoose.Schema({
    name : String,
    email :String,
    password : String,
    profile : Object,
    fullyCreated:Boolean,
    branch :  String,
    section : String,
    semester : String,
    password : String,
    semester : String,
    branch : String,
    password : String,
    loginsessions : Array
});

module.exports=new mongoose.model("Users",UserSchema);