const express = require('express');
const app = express();

app.get('/',(req,res)=>{
      res.render('home/index');
});

module.exports=app;