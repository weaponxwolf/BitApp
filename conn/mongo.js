const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/bitapp').then(()=>{
    console.log("Connected To Database");
}).catch((err)=>{
    console.log(err);
});