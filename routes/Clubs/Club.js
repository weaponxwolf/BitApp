const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const async = require('hbs/lib/async');
const fs = require('fs')
const path = require('path');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');

const Clubs = require('../../models/Clubs');
const Locations = require('../../models/Locations');
const Posts = require('../../models/Posts');
const Sheets = require('../../models/Sheets');

app.use(fileUpload({
      useTempFiles: true,
      tempFileDir: path.join(__dirname, '..', '..', '/public/clubs/tmp/')
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
      extended: true
}));


function dynamicSortMultiple() {
      var props = arguments;
      return function (obj1, obj2) {
            var i = 0,
                  result = 0,
                  numberOfProperties = props.length;
            while (result === 0 && i < numberOfProperties) {
                  result = dynamicSort(props[i])(obj1, obj2);
                  i++;
            }
            return result;
      }
}

function dynamicSort(property) {
      var sortOrder = 1;
      if (property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
      }
      return function (a, b) {
            /* next line works with strings and numbers, 
             * and you may want to customize it to your needs
             */
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
      }
}

app.get('/', function (req, res) {
      var token = req.cookies['clubdata'];
      var decoded = jwt.verify(token, 'amitkumar');
      var getname = decoded.email;
      var getfoldername = getname.split('.').join('-').split('@')[0];
      app.use(express.static(`public/profile/${getfoldername}/`));
      if (!fs.existsSync(path.join(__dirname, "..", '..', `public/profile/${getfoldername}/index.html`))) {
            res.redirect('/club/pagefiles/');
      } else {
            res.sendFile(path.join(__dirname, "..", '..', `public/profile/${getfoldername}/index.html`));
      }
});

app.get('/admin', (req, res) => {
      res.render('clubs/admin');
});

app.get('/events', (req, res) => {
      res.render('clubs/events');
});

app.get('/events/map', (req, res) => {
      res.render('clubs/eventmap')
});

app.get('/members', (req, res) => {
      res.render('clubs/members');
});

app.get('/memberlist', async (req, res) => {
      try {
            var token = req.cookies.clubdata;
            var decoded = jwt.verify(token, 'amitkumar');
            const clubs = await Clubs.findOne({
                  email: decoded.email
            });
            var s = clubs.members;
            s.sort(dynamicSort("rank"));
            res.send(s);
      } catch (error) {

      }
});

app.get('/member/addnew', (req, res) => {
      res.render('clubs/addnewmember');
});

app.post('/member/addnew', async (req, res) => {
      try {
            var token = await req.cookies['clubdata'];
            var decoded = await jwt.verify(token, 'amitkumar');
            var getname = decoded.email;
            var club = await Clubs.findOne({
                  email: getname
            });
            club.members.push(req.body);
            club.save();
            res.redirect('/club/members');
      } catch (error) {

      }
});

app.get('/member/ranks', (req, res) => {
      res.render('clubs/ranks');
});

app.post('/member/updaterank', async (req, res) => {
      try {
            var token = await req.cookies['clubdata'];
            var decoded = await jwt.verify(token, 'amitkumar');
            var getname = decoded.email;
            var email = req.body.rollno.split('-').join('.') + '@bitmesra.ac.in';
            const s = await Clubs.update({
                  email: getname,
                  'members.email': email
            }, {
                  '$set': {
                        'members.$.rank': req.body.rank,
                  }
            });
            res.send("OK");
      } catch (error) {
            console.log(error);
      }
});

app.get('/members/listbyyear', async (req, res) => {
      try {

            var token = req.cookies.clubdata;
            var decoded = jwt.verify(token, 'amitkumar');
            const club = await Clubs.findOne({
                  email: decoded.email
            });
            var members = [];
            club.members.forEach(element => {
                  if (element.batch === req.query.year) {
                        members.push(element);
                  }
            });
            res.send(members);
      } catch (error) {
            console.log(error);
      }
});

app.get('/events/manageareaandpos', (req, res) => {
      res.render('clubs/manageareaandpos');
});

app.get('/events/areasandpos/list', async (req, res) => {
      try {
            const locations = await Locations.find();
            res.send(locations);
      } catch (error) {
            console.log(error);

      }
});

app.post('/events/manageareaandpos', async (req, res) => {
      try {
            if (req.body.placename != "") {
                  const location = new Locations({
                        name: req.body.placename,
                        height: req.body.height,
                        width: req.body.width,
                        top: req.body.top,
                        left: req.body.left,
                        color: req.body.color,
                        type: req.body.type
                  });
                  location.save();
                  res.render('clubs/manageareaandpos');
            } else {
                  res.render('clubs/manageareaandpos');
            }
      } catch (error) {

      }
});



app.get('/member/ranklist', async (req, res) => {
      try {
            var token = req.cookies.clubdata;
            var decoded = jwt.verify(token, 'amitkumar');
            const clubs = await Clubs.findOne({
                  email: decoded.email
            });
            var s = clubs.members;
            s.sort(dynamicSort("rank"));
            res.send(s);
      } catch (error) {
            console.log(error);
      }
});


app.get('/pagefiles/:hello', async (req, res) => {
      var profileindex = true;
      var token = await req.cookies['clubdata'];
      var decoded = await jwt.verify(token, 'amitkumar');
      var getname = decoded.email;
      var getfoldername = getname.split('.').join('-').split('@')[0];
      if (!fs.existsSync(path.join(__dirname, "..", "..", `public/profile/${getfoldername}/index.html`))) {
            res.render('clubs/pagefiles');
            console.log(path.join(__dirname, "..", "..", `public/profile/${getfoldername}/index.html`))
      } else {
            res.render('clubs/pagefiles', {
                  profileindex: profileindex
            });
      }

});

app.get('/pagefiles/', async (req, res) => {
      var profileindex = true;
      var token = await req.cookies['clubdata'];
      var decoded = await jwt.verify(token, 'amitkumar');
      var getname = decoded.email;
      var getfoldername = getname.split('.').join('-').split('@')[0];
      if (!fs.existsSync(path.join(__dirname, "..", "..", `public/profile/${getfoldername}/index.html`))) {
            res.render('clubs/pagefiles');
      } else {
            res.render('clubs/pagefiles', {
                  profileindex: profileindex
            });
      }
});



app.post('/deletefolder', async (req, res) => {
      try {
            var appenddir = req.body.foldername;
            var token = await req.cookies['clubdata'];
            var decoded = await jwt.verify(token, 'amitkumar');
            var getname = decoded.email;
            var middir = "";
            if (req.body.location) {
                  middir = "/" + req.body.location;
            } else {
                  middir = "/" + middir;
            }

            var getfoldername = getname.split('.').join('-').split('@')[0];
            var dir = path.join(__dirname, "../../", "public/profile/" + getfoldername + middir + '/' + appenddir);
            dir = dir.split('%20').join(' ');
            dir = dir.split('$').join('/');
            fs.rmSync(dir, {
                  recursive: true,
                  force: true
            });
            res.send("Folder '" + appenddir + "' Deleted");
      } catch (error) {
            console.log(error);
      }

});


app.post('/deletefile', (req, res) => {
      try {
            var appenddir = req.body.filelocation;
            var filename = req.body.filename;
            var token = req.cookies['clubdata'];
            var decoded = jwt.verify(token, 'amitkumar');
            var getname = decoded.email;
            var middir = "";
            if (req.body.location) {
                  middir = "/" + req.body.location;
            } else {
                  middir = "/" + middir;
            }
            var getfoldername = getname.split('.').join('-').split('@')[0];
            if (appenddir == "/profile/profilefiles/" || appenddir == "/profile/profilefiles/") {
                  dir = path.join(__dirname, "../../", "public/profile/" + getfoldername + '/' + filename);

            } else {
                  dir = path.join(__dirname, "../../", "public/profile/" + getfoldername + middir + '/' + filename);
            }
            dir = dir.split('%20').join(' ');
            dir = dir.split('$').join('/');
            fs.unlinkSync(dir);
            res.send("File '" + filename + "' Deleted ");
      } catch (error) {
            console.log(error);
      }
});

app.post('/uploadfile', async (req, res) => {
      var token = await req.cookies['clubdata'];
      var decoded = await jwt.verify(token, 'amitkumar');
      var getname = decoded.email;
      var middir = "";
      if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
      } else {
            sampleFile = req.files.file;
            var nameoffile = sampleFile.name;
            if (req.body.location) {
                  middir = "/" + req.body.location;
            } else {
                  middir = "/" + middir;
            }
            var getfoldername = getname.split('.').join('-').split('@')[0];
            dir = "";
            if (middir == "/undefined") {
                  dir = path.join(__dirname, "../../", "public/profile/" + getfoldername + '/' + nameoffile);
            } else {
                  dir = path.join(__dirname, "../../", "public/profile/" + getfoldername + middir + '/' + nameoffile);
            }
            dir = dir.split('%20').join(' ');
            dir = dir.split('$').join('/');
            var mimesupport = ["application/octet-stream", "text/x-sass", "text/x-scss", "text/javascript", "image/svg+xml", "text/html", "text/plain", "text/css", "application/vnd.ms-powerpoint", "application/pdf", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "image/png", "image/gif", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword", "image/jpeg"];
            var MAX_SIZE = 1024000;
            var found = (mimesupport.indexOf(sampleFile.mimetype) > -1);
            if (found && sampleFile.size < MAX_SIZE) {
                  var fileext = sampleFile.name.split('.')[1];
                  await sampleFile.mv(dir);
                  res.send("File '" + sampleFile.name + "' Uploaded !");
            } else {
                  res.send("INVALID FILE TYPE or FILE EXCEEDING 10Mb ")
            }
      }

});




app.get('/folderlist', async (req, res) => {
      try {
            var appenddir = req.query.location.split('$').join('/');
            if (appenddir == "undefined") {
                  appenddir = ""
            }
            var token = await req.cookies.clubdata;
            var decoded = await jwt.verify(token, 'amitkumar');
            var getname = decoded.email;
            var getfoldername = getname.split('.').join('-').split('@')[0];
            var dir = path.join(__dirname, "../../", "public/profile/" + getfoldername + '/' + appenddir);

            if (!fs.existsSync(dir)) {
                  fs.mkdirSync(dir, {
                        recursive: true
                  });
            }

            function getDirectories(path) {
                  return fs.readdirSync(path).filter(function (file) {
                        return fs.statSync(path + '/' + file).isDirectory();
                  });
            }
            res.send(getDirectories(dir));
      } catch (error) {
            console.log(error);
      }
});


app.post('/createfolder', async (req, res) => {
      try {
            var appenddir = req.body.foldername;
            var token = await req.cookies.clubdata;
            var decoded = await jwt.verify(token, 'amitkumar');
            var getname = decoded.email;
            var middir = "";
            if (req.body.location) {
                  middir = "/" + req.body.location;
            } else {
                  middir = "/" + middir;
            }

            var getfoldername = getname.split('.').join('-').split('@')[0];
            var dir = path.join(__dirname, "../../", "public/profile/" + getfoldername + middir + '/' + appenddir);

            dir = dir.split('%20').join(' ');
            dir = dir.split('$').join('/');
            if (!fs.existsSync(dir)) {
                  fs.mkdirSync(dir, {
                        recursive: true
                  });
            }
            await res.send("Folder '" + appenddir + "' Created");
      } catch (error) {
            console.log(error);
      }
});

app.post('/deletefolder', async (req, res) => {
      try {
            var appenddir = req.body.foldername;
            var getname = GetName(req);
            var middir = "";
            if (req.body.location) {
                  middir = "/" + req.body.location;
            } else {
                  middir = "/" + middir;
            }

            var getfoldername = getname.split('.').join('-').split('@')[0];
            var dir = path.join(__dirname, "..", "public/profile/" + getfoldername + middir + '/' + appenddir);
            dir = dir.split('%20').join(' ');
            dir = dir.split('$').join('/');
            await ProfileFolders.deleteOne({
                  name: appenddir,
                  filelocation: middir + '/' + appenddir,
                  createdby: getname,
            });

            fs.rmSync(dir, {
                  recursive: true,
                  force: true
            });
            res.send("Folder '" + appenddir + "' Deleted");
      } catch (error) {

      }

});

app.get('/fileslist', async (req, res) => {
      try {
            var appenddir = req.query.location.split('$').join('/');
            if (appenddir == "undefined") {
                  appenddir = ""
            }
            var token = await req.cookies.clubdata;
            var decoded = await jwt.verify(token, 'amitkumar');
            var getname = decoded.email;
            var getfoldername = getname.split('.').join('-').split('@')[0];
            var dir = path.join(__dirname, "../../", "public/profile/" + getfoldername + '/' + appenddir);
            var files = [];
            var allfiles = await fs.readdirSync(dir);
            allfiles.forEach(element => {
                  if (element.indexOf('.') != -1) {
                        files.push(element);
                  }
            });
            res.send(files);
      } catch (error) {
            console.log(error);
      }
});


app.get('/events/addnew', (req, res) => {
      res.render('clubs/addnewevent');
});

app.post('/events/addnew', async (req, res) => {
      try {
            var {
                  name,
                  location,
                  locid,
                  startdate,
                  enddate,
                  starttime,
                  endtime,
                  description
            } = req.body;
            var token = await req.cookies.clubdata;
            var decoded = await jwt.verify(token, 'amitkumar');
            var getname = decoded.email;
            if (req.body && req.files) {
                  var club = await Clubs.findOne({
                        email: getname
                  });
                  if (club) {
                        var eventIcon = req.files.eventicon;
                        var eventImage = req.files.eventimage;
                        var eventdata = {
                              _id: mongoose.Types.ObjectId(),
                              name: name,
                              location: location,
                              startdate: startdate,
                              enddate: enddate,
                              starttime: starttime,
                              endtime: endtime,
                              description: description
                        }

                        iconext = '';
                        imgext = '';

                        if (eventIcon.mimetype == 'image/png') {
                              iconext = "png"
                        }
                        if (eventIcon.mimetype == 'image/jpeg') {
                              iconext = "jpg"
                        }
                        if (eventImage.mimetype == 'image/png') {
                              imgext = "png"
                        }
                        if (eventImage.mimetype == 'image/jpeg') {
                              imgext = "jpg"
                        }

                        iconName = eventdata._id + '.' + iconext;
                        imageName = eventdata._id + '.' + imgext;

                        iconUploadPath = path.join(__dirname, '..', '..', 'public/clubs/events/icons/', iconName);
                        imageUploadPath = path.join(__dirname, '..', '..', 'public/clubs/events/images/', imageName);

                        eventImage.mv(imageUploadPath);
                        eventIcon.mv(iconUploadPath);

                        eventdata.eventImage = imageName;
                        eventdata.eventIcon = iconName;

                        await Clubs.updateOne({
                              email: getname
                        }, {
                              $push: {
                                    events: eventdata
                              }
                        });
                  }
            }
            res.render('clubs/addnewevent');
      } catch (error) {
            console.log(error);
      }
});


app.get('/locations/list', async (req, res) => {
      try {
            const locations = await Locations.find({
                  name: {
                        $regex: req.query.location,
                        $options: 'i'
                  }
            });
            res.send(locations);
      } catch (error) {
            console.log(error);
      }
});

app.get('/events/list', async (req, res) => {
      try {
            var token = await req.cookies.clubdata;
            var decoded = await jwt.verify(token, 'amitkumar');
            var getname = decoded.email;
            var club = await Clubs.findOne({
                  email: getname
            });
            var events = [];
            club.events.forEach(element => {
                  if (element.isDeleted == false) {
                        events.push(element);
                  }
            });
            events.sort(dynamicSort("startdate"));
            res.send(events);
      } catch (error) {
            console.log(error);
      }
});

app.get('/posts', (req, res) => {
      res.render('clubs/posts');
});
app.get('/posts/addnew', (req, res) => {
      res.render('clubs/addnewpost');
});

app.get('/posts/list', async (req, res) => {
      try {
            var token = await req.cookies.clubdata;
            var decoded = await jwt.verify(token, 'amitkumar');
            var getname = decoded.email;
            const posts = await Posts.find({
                  type: "clubpost",
                  clubname: getname,
                  isDeleted: false
            }).sort({
                  createdon: -1
            });
            res.send(posts);
      } catch (error) {
            console.log(error);
      }
});

app.post('/posts/createpreview', async (req, res) => {
      var token = await req.cookies.clubdata;
      var decoded = await jwt.verify(token, 'amitkumar');
      var getname = decoded.email;
      thebody = req.body.thebody;
      var images = [];
      if (thebody.indexOf('<') == -1) {
            thepreview = thebody
                  .split(`__H1("`).join('<h1>')
                  .split(`")1H__`).join('</h1>')
                  .split(`__H2("`).join('<h1>')
                  .split(`")2H__`).join('</h1>')
                  .split(`__H3("`).join('<h1>')
                  .split(`")3H__`).join('</h1>')
                  .split(`__H4("`).join('<h1>')
                  .split(`")4H__`).join('</h1>')
                  .split(`__H5("`).join('<h1>')
                  .split(`")5H__`).join('</h1>')
                  .split(`__H6("`).join('<h1>')
                  .split(`")6H__`).join('</h1>');

            thepreview = thepreview.split(`__L("`).join('<a href="').split(`")L__`).join('</a>').split("$").join(`">`);

            if (req.files) {
                  if (req.files['file[]'][1]) {
                        var s = 1;
                        req.files['file[]'].forEach(element => {
                              const imageType = element.mimetype.replace('image/', '.');
                              const imagePath = element.tempFilePath + imageType;
                              fs.renameSync(element.tempFilePath, imagePath);
                              shortimagepath = element.tempFilePath.split(`\\tmp\\`)[1] + imageType;
                              images.push(shortimagepath);
                        });
                        data = {
                              thetitle: req.body.title,
                              thebody: thepreview,
                              images: images,
                              email: getname
                        }
                        res.send(data);
                  } else if (req.files['file[]']) {
                        var images = [];
                        var element = req.files['file[]'];
                        const imageType = element.mimetype.replace('image/', '.');
                        const imagePath = element.tempFilePath + imageType;
                        fs.renameSync(element.tempFilePath, imagePath);
                        shortimagepath = element.tempFilePath.split(`\\tmp\\`)[1] + imageType;
                        images.push(shortimagepath);
                        data = {
                              thetitle: req.body.title,
                              thebody: thepreview,
                              images: images,
                              email: getname
                        }
                        res.send(data);
                  }
            } else {
                  data = {
                        thetitle: req.body.title,
                        thebody: thepreview,
                        email: getname
                  }
                  res.send(data);
            }

      } else {
            res.send("INVALID CHARACTER '<' ");
      }


});

app.post('/posts/publish', async (req, res) => {
      try {
            var token = await req.cookies.clubdata;
            var decoded = await jwt.verify(token, 'amitkumar');
            var getname = decoded.email;
            thetitle = req.body.title;
            thebody = req.body.thebody;
            images = req.body.images;
            var imgs = [];
            var post = {
                  title: req.body.title,
                  images: [],
                  body: req.body.body,
                  createdby: decoded.membername + ',' + decoded.memberemail + ',' + decoded.memberdesignation,
                  createdon: Date.now(),
                  type: "clubpost",
                  clubname: decoded.email,
                  isDeleted: false
            }
            images.forEach(element => {
                  var ext;
                  if (element.indexOf('.png')) {
                        ext = '.png';
                  }
                  if (element.indexOf('.jpeg')) {
                        ext = '.jpeg';
                  }
                  var objid = mongoose.Types.ObjectId();
                  var oldPath = path.join(__dirname, '..', '..', 'public' + element);
                  var newPath = path.join(__dirname, '..', '..', 'public/posts/images/' + objid + ext);

                  fs.rename(oldPath, newPath, function (err) {
                        if (err) throw err
                  });
                  post.images.push(objid + ext);
                  const newpost = new Posts(post);
                  newpost.save();
            });
            res.send("Published");
      } catch (error) {
            console.log(error);
      }
});

app.get('/events/manage', (req, res) => {
      res.render('clubs/manageevents.hbs')
});




app.get('/posts/manage', (req, res) => {
      res.render('clubs/manageposts.hbs')
});

app.post('/posts/delete', async (req, res) => {
      try {
            var token = await req.cookies.clubdata;
            var decoded = await jwt.verify(token, 'amitkumar');
            var getname = decoded.email;
            var post = await Posts.findOne({
                  _id: req.body.postid,
                  clubname: getname
            });
            post.isDeleted = true;
            post.save();
            res.send("DELETED");
      } catch (error) {
            console.log(error);
      }
});


app.post('/events/delete', async (req, res) => {
      try {
            var token = await req.cookies.clubdata;
            var decoded = await jwt.verify(token, 'amitkumar');
            var getname = decoded.email;
            const club = await Clubs.updateOne({
                  email: getname,
                  'events._id': req.body.eventid
            }, {
                  '$set': {
                        'events.$.isDeleted': true
                  }
            });
            res.send("DELETED");

      } catch (error) {
            console.log(error);
      }
});
app.post('/events/undodelete', async (req, res) => {
      try {
            var token = await req.cookies.clubdata;
            var decoded = await jwt.verify(token, 'amitkumar');
            var getname = decoded.email;
            const club = await Clubs.updateOne({
                  email: getname,
                  'events._id': req.body.eventid
            }, {
                  '$set': {
                        'events.$.isDeleted': false
                  }
            });
            res.send("DELETED");

      } catch (error) {
            console.log(error);
      }
});

app.post('/posts/undodelete', async (req, res) => {
      try {
            var token = await req.cookies.clubdata;
            var decoded = await jwt.verify(token, 'amitkumar');
            var getname = decoded.email;
            var post = await Posts.findOne({
                  _id: req.body.postid,
                  clubname: getname
            });
            post.isDeleted = false;
            post.save();
            res.send("UNDONE DELETED");
      } catch (error) {
            console.log(error);
      }
});


app.get('/forms', (req, res) => {
      res.render('clubs/forms');
});

app.get('/forms/addnew', (req, res) => {
      res.render('clubs/addnewform');
});
app.get('/sheets', (req, res) => {
      res.render('clubs/sheets');
});


app.get('/sheets/addnew', (req, res) => {
      res.render('clubs/addnewsheet');
});

app.get('/sheets/list', async (req, res) => {
      try {
            const sheets = await Sheets.find();
            res.send(sheets);
      } catch (error) {
            console.log(error);
      }
});

app.get('/sheet/edit/:id', async (req, res) => {
      try {
            res.render('clubs/editsheet');
      } catch (error) {
            console.log(error);
      }
});

app.post('/sheet/save', async (req, res) => {
      try {
            var sheet = await Sheets.updateOne({
                  _id: req.body.sheetid
            }, {
                  columns: req.body.allcols,
                  allrows: req.body.tabledata
            });
            res.send("SAVED");
      } catch (error) {
            console.log(error);
      }
});

app.get('/sheet/data/:id', async (req, res) => {
      try {
            const sheets = await Sheets.findOne({
                  _id: req.params.id
            });
            res.send(sheets);
      } catch (error) {
            console.log(error);
      }
});

app.post('/sheets/addnew', async (req, res) => {
      try {
            var token = await req.cookies.clubdata;
            var decoded = await jwt.verify(token, 'amitkumar');
            var getname = decoded.email;
            var sheet = {
                  name: req.body.name,
                  createdby: decoded.memberemail,
                  createdon: Date.now(),
                  clubname: getname,
                  createdbyname: decoded.membername,
                  columns: [],
                  allrows: [
                        []
                  ]
            };
            var columns = req.body.column;
            columns.forEach(element => {
                  sheet.columns.push(element);
            });
            const newSheet = new Sheets(sheet);
            newSheet.save();
            res.redirect('/club/sheets');
      } catch (error) {
            console.log(error);
      }
});

module.exports = app;