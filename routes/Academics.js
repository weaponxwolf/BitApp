const express = require('express');
const app = express();
const axios = require('axios').default;
const cheerio = require('cheerio');
const { find } = require('cheerio/lib/api/traversing');
const jwt=require('jsonwebtoken');
const Subjects=require('../models/Subjects');
const Users=require('../models/Users');
const cookieParser=require('cookie-parser');
const async = require('hbs/lib/async');
const fileUpload=require('express-fileupload');
const bodyParser=require('body-parser');

app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(fileUpload());

const GetName = (req) => {
      var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
      return decoded.email;
}

app.get('/', (req, res) => {
      res.render('academics/index');
});

app.get('/notices', (req, res) => {
      res.render('academics/notices');
})

app.get('/syllabus',(req,res)=>{
      res.render('academics/syllabus');
});

app.get('/noticeslist', async (req, res) => {
      try {
            const f = await axios.get('https://www.bitmesra.ac.in/Show_all_Notices?cid=1')
                  .then(function (data) {
                        const $ = cheerio.load(data.data);
                        var thejson = $("#example tbody tr td a");
                        var thedates = $('#example tbody tr td span');
                        var dates = [];
                        thedates.each(function (index, element) {
                              dates.push($(element).html().replace('<i class="fa fa-clock-o"></i> ', ''))
                        })
                        var notices = [];
                        thejson.each(function (index, element) {
                              var address = $(element).attr('onclick');
                              var i = 0;
                              if (address) {
                                    var s = {
                                          name: $(element).html(),
                                          link: address.replace("return makePopUp('", '').replace("',", '$').split('$')[0],
                                          date: dates[i]
                                    }
                                    notices.push(s);
                                    i++;
                              }
                        });
                        res.send(notices);
                  });
      } catch (error) {
            console.log(error);
            res.send("OKIII");
      }

});

app.get('/addsyllabus',(req,res)=>{
      res.render('academics/addsyllabus')
})

app.post('/addsyllabus',async(req,res)=>{
      try {
            const getname=GetName(req);
            const User=await Users.findOne({
                  email : getname
            });
            if (User) {
                  if (req.files.file.mimetype=='application/pdf') {
                        const newSubject=await new Subjects({
                              name: req.body.name,
                              syllabuspdf :req.files.file.name,
                              subjectCode : req.body.code,
                              branch : User.branch
                        });
                        newSubject.save();
                        res.render('academics/addsyllabus',{message : "SUBJECT CREATED"});
                  }else{
                        res.render('academics/addsyllabus',{message : "UPLOAD ONLY PDF FILES"});
                  }
            }
      } catch (error) {
            console.log(error);
      }
})

app.get('/syllabuslist',async(req,res)=>{
      try {
            const getname=GetName(req);
            const User=await Users.findOne({
                  email : getname
            });
            if (User) {
                  const subjects=await Subjects.find({
                        branch :User.branch
                  });
                  res.send(subjects);
            }
      } catch (error) {
            
      }
});

module.exports = app;