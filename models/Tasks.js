const mongoose=require('mongoose');

const TasksSchema=new mongoose.Schema({
    name : String,
    taskdesc : String,
    createdon : Date,
    createdby : String,
    dateoftask : Date,
    timeoftask : String,
    isTaskDone : Boolean
});

module.exports=new mongoose.model("Tasks",TasksSchema);