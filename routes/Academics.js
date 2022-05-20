const express = require('express');
const app = express();
const axios = require('axios').default;
const cheerio = require('cheerio');
const {
      find
} = require('cheerio/lib/api/traversing');
const jwt = require('jsonwebtoken');
const Subjects = require('../models/Subjects');
const Users = require('../models/Users');
const cookieParser = require('cookie-parser');
const async = require('hbs/lib/async');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
      extended: true
}));
app.use(cookieParser());
app.use(fileUpload());


const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server);




const Files = require('../models/Files');
const Folders = require('../models/Folders');
const Links = require('../models/Links');
const Messages=require('../models/Messages');


const GetName = (req) => {
      var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
      return decoded.email;
}

const GetUser = async (req) => {
      var getname = GetName(req);
      const User = await Users.findOne({
            email: getname
      });

      return {
            name: User.profile.displayName,
            branch: User.branch,
            email: User.email,
            section: User.section
      }
}

const GetUserDetails = async (email) => {
      const User = await Users.findOne({
            email: email
      });

      return {
            name: User.profile.displayName,
            branch: User.branch,
            email: User.email,
            section: User.section
      }
}

app.get('/', (req, res) => {
      res.render('academics/index');
});

app.get('/notices', (req, res) => {
      res.render('academics/notices');
})

app.get('/syllabus', (req, res) => {
      res.render('academics/syllabus');
});

app.get('/sharedfolders/folders/:location', (req, res) => {
      res.render('academics/insidesharedfolders');
});

app.get('/sharedfolders/', (req, res) => {
      res.render('academics/sharedfolders');
});



app.get('/sharedfolders/folders', async (req, res) => {
      try {
            
            if (req.query.location) {
                  location = req.query.location;
                  location = location.split(' ').join('%20');
                  const user = await GetUser(req);
                  var accesssto = user.branch + "_" + user.section;
                  const folders = await Folders.find({
                        'accessto.name': accesssto,
                        isDeleted: false
                  });
                  var editedfolder = [];
                  folders.forEach(element => {
                        accesssname = 'ECE_A';
                        let obj = element.accessto;
                        if (obj) {
                              var mntloc=location+'1x1'+element.name.split(' ').join('%20');
                              var s = obj.find((o) => o.name === accesssto);
                              if (s) {
                                    if (s.mountlocation == mntloc){
                                          element.location=s.mountlocation;
                                          editedfolder.push(element);
                                    }
                              }
                        }
                  });
                  res.send(editedfolder);
            }else{
                  var getname=await GetName(req);
                  var getfolder=getname.split('@')[0].split('.').join('-');
                  var location=getfolder+'1x1';
                  const user = await GetUser(req);
                  var accesssto = user.branch + "_" + user.section;
                  const folders = await Folders.find({
                        'accessto.name': accesssto,
                        isDeleted: false
                  });
                  var editedfolder = [];
                  folders.forEach(element => {
                        accesssname = 'ECE_A';
                        var foldername=location+element.name.split(' ').join('%20');
                        let obj = element.accessto;
                        if (obj) {
                              var s = obj.find((o) => o.name === accesssto);
                              if (s) {
                                    if (s.mountlocation == foldername){
                                          element.location=s.mountlocation;
                                          editedfolder.push(element);
                                    }
                              }
                        }
                  });
                  res.send(editedfolder);
            }

      } catch (error) {
            console.log(error);
      }
});
app.get('/sharedfolders/files', async (req, res) => {
      try {
            
            if (req.query.location) {
                  location = req.query.location;
                  location = location.split(' ').join('%20');
                  const user = await GetUser(req);
                  var accesssto = user.branch + "_" + user.section;
                  const files = await Files.find({
                        'accessto.name': accesssto,
                        isDeleted: false
                  });
                  var editedfiles = [];
                  files.forEach(element => {
                        accesssname = 'ECE_A';
                        let obj = element.accessto;
                        if (obj) {
                              var mntloc=location+'1x1'+element.name.split(' ').join('%20');
                              var s = obj.find((o) => o.name === accesssto);
                              if (s) {
                                    if (s.mountlocation == mntloc){
                                          element.location=s.mountlocation;
                                          editedfiles.push(element);
                                    }
                              }
                        }
                  });
                  res.send(editedfiles);
            }else{
                  var getname=await GetName(req);
                  var getfolder=getname.split('@')[0].split('.').join('-');
                  var location=getfolder+'1x1';
                  const user = await GetUser(req);
                  var accesssto = user.branch + "_" + user.section;
                  const files = await Files.find({
                        'accessto.name': accesssto,
                        isDeleted: false
                  });
                  var editedfiles = [];
                  files.forEach(element => {
                        accesssname = 'ECE_A';
                        var foldername=location+element.name.split(' ').join('%20');
                        let obj = element.accessto;
                        if (obj) {
                              var s = obj.find((o) => o.name === accesssto);
                              if (s) {
                                    if (s.mountlocation == foldername){
                                          element.location=s.mountlocation;
                                          editedfolder.push(element);
                                    }
                              }
                        }
                  });
                  res.send(editedfiles);
            }
      } catch (error) {
            console.log(error);
      }
});
app.get('/sharedfolders/links', async (req, res) => {
      try {
            if (req.query.location) {
                  location = req.query.location;
                  location = location.split(' ').join('%20');
                  const user = await GetUser(req);
                  var accesssto = user.branch + "_" + user.section;
                  const links = await Links.find({
                        'accessto.name': accesssto,
                        isDeleted: false
                  });
                  var editedlinks = [];
                  links.forEach(element => {
                        accesssname = 'ECE_A';
                        let obj = element.accessto;
                        if (obj) {
                              var mntloc=location+'1x1'+element.name.split(' ').join('%20');
                              var s = obj.find((o) => o.name === accesssto);
                              if (s) {
                                    if (s.mountlocation == mntloc){
                                          element.location=s.mountlocation;
                                          editedlinks.push(element);
                                    }
                              }
                        }
                  });
                  res.send(editedlinks);
            }else{
                  var getname=await GetName(req);
                  var getfolder=getname.split('@')[0].split('.').join('-');
                  var location=getfolder+'1x1';
                  const user = await GetUser(req);
                  var accesssto = user.branch + "_" + user.section;
                  const links = await Links.find({
                        'accessto.name': accesssto,
                        isDeleted: false
                  });
                  var editedlinks = [];
                  links.forEach(element => {
                        accesssname = 'ECE_A';
                        var foldername=location+element.name.split(' ').join('%20');
                        let obj = element.accessto;
                        if (obj) {
                              var s = obj.find((o) => o.name === accesssto);
                              if (s) {
                                    if (s.mountlocation == foldername){
                                          element.location=s.mountlocation;
                                          editedfolder.push(element);
                                    }
                              }
                        }
                  });
                  res.send(editedlinks);
            }
      } catch (error) {
            console.log(error);
      }
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

app.get('/addsyllabus', (req, res) => {
      res.render('academics/addsyllabus')
})

app.post('/addsyllabus', async (req, res) => {
      try {
            const getname = GetName(req);
            const User = await Users.findOne({
                  email: getname
            });
            if (User) {
                  if (req.files.file.mimetype == 'application/pdf') {
                        const newSubject = await new Subjects({
                              name: req.body.name,
                              syllabuspdf: req.files.file.name,
                              subjectCode: req.body.code,
                              branch: User.branch
                        });
                        newSubject.save();
                        res.render('academics/addsyllabus', {
                              message: "SUBJECT CREATED"
                        });
                  } else {
                        res.render('academics/addsyllabus', {
                              message: "UPLOAD ONLY PDF FILES"
                        });
                  }
            }
      } catch (error) {
            console.log(error);
      }
})

app.get('/syllabuslist', async (req, res) => {
      try {
            const getname = GetName(req);
            const User = await Users.findOne({
                  email: getname
            });
            if (User) {
                  const subjects = await Subjects.find({
                        branch: User.branch
                  });
                  res.send(subjects);
            }
      } catch (error) {

      }
});

app.get('/classchat',async (req,res)=>{
      try {
            var token=req.cookies.userdata;
            var decoded=jwt.verify(req.cookies.userdata,'amitkumar');
            res.render('academics/classchat',{userdata : decoded });
      } catch (error) {
            console.log(error);
      }
      
})


app.get('/classmessages',async(req,res)=>{
      try {
            const messages=await Messages.find({
                  messageto : 'ECE_A'
            });
            res.send(messages);
      } catch (error) {
            
      }
});



module.exports = app;