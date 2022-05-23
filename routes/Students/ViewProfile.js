const express = require("express");
const fs=require('fs')
const path=require('path');


const app=express()
app.use(express.static(`public/profile/`));


app.get('/:rollno',(req,res)=>{
      rollno=req.params.rollno;
      console.log(rollno);
      var getfoldername = rollno;
      if (!fs.existsSync(path.join(__dirname,"..", `public/profile/${getfoldername}/index.html`))) {
            res.render('clubs/memberprofile');
      }else{
            res.sendFile(path.join(__dirname,"..", `public/profile/${getfoldername}/index.html`));
      }
});

module.exports=app;