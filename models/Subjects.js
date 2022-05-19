const mongoose=require('mongoose');

const SubjectSchema=new mongoose.Schema({
    name : String,
    syllabuspdf: String,
    branch : String,
    subjectCode: String
});

module.exports=new mongoose.model("Subjects",SubjectSchema);