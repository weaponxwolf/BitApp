const express = require("express");

const app=express();

app.get('/', (req, res) => {
      res.render('clubs/forms/index');
});

app.get('/addnew', (req, res) => {
      res.render('clubs/forms/addform');
});

module.exports=app; 