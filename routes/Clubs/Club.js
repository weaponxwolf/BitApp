const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const async = require('hbs/lib/async');
const fs = require('fs')
const path = require('path');
const fileUpload = require('express-fileupload');

const Locations = require('../../models/Locations');


app.use(cookieParser());

app.use(bodyParser.urlencoded({
      extended: true
}));

const EventsRoute = require('./Events');
const MembersRoute = require('./Members');
const PostsRoute = require('./Posts');
const FormsRoute = require('./Forms');
const SheetsRoute = require('./Sheets');


app.use('/events', EventsRoute);
app.use('/members', MembersRoute);
app.use('/posts', PostsRoute);
app.use('/forms', FormsRoute);
app.use('/sheets', SheetsRoute);

app.use(fileUpload({
      useTempFiles: true,
      tempFileDir: path.join(__dirname, '..', '..', '/public/clubs/tmp/')
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

app.get('/home', (req, res) => {
      res.render('clubs/home');
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



module.exports = app;