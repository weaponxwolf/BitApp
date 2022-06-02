const express = require('express');
const app = express();

app.get('/',(req,res)=>{
      res.render('students/clubactivities/index')
});

module.exports = app;