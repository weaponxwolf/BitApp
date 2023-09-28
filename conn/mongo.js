const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
mongoose.connect(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.2yfzi8u.mongodb.net/bitapp?retryWrites=true&w=majority`).then(()=>{
    console.log("Connected To Database");
}).catch((err)=>{
    console.log(err);
});