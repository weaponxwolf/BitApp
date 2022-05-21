const app=require('express')();
const jwt=require('jsonwebtoken');
const bodyParser=require('body-parser');
const cookieParser=require('cookie-parser');
const async = require('hbs/lib/async');

const Clubs=require('../models/Clubs');

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));

var GetClub=async(req)=>{

}

app.get('/admin',(req,res)=>{
      res.render('clubs/admin');
});

app.get('/members',(req,res)=>{
      res.render('clubs/members');
});

app.get('/memberlist',async(req,res)=>{
      try {
            console.log(req.cookies.clubdata);
            var token=req.cookies.clubdata;
            var decoded=jwt.verify(token,'amitkumar');
            console.log(decoded);
            const clubs=await Clubs.findOne({
                  email : decoded.email
            });
            console.log(clubs.members);
            res.send(clubs.members);
      } catch (error) {
            
      }
});

module.exports=app;