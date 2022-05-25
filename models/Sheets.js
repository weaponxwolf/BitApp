const { type } = require('express/lib/response');
const mongoose = require('mongoose');

const SheetsSchema = mongoose.Schema({
      name: String,
      createdby : String,
      createdon : Date,
      clubname : String,
      createdbyname: String,
      columns: Array,
      allrows : {
            type : Array,
            rowvalues : Array
      }
});

module.exports=new mongoose.model("Sheets",SheetsSchema);