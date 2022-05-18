const express = require('express');
const app = express();

app.get('/home',(req,res)=>{
      res.render('home/index');
});

module.exports=app;