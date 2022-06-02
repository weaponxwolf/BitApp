const express=require('express');
const app=express();

app.get('/',(req,res)=>{
      res.render('students/mails/index');
})

module.exports=app;