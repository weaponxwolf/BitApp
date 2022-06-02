const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

const ProfileFolders = require('../../models/ProfileFolders');
const ProfileFiles = require('../../models/ProfileFiles');

const async = require('hbs/lib/async');

app.use(cookieParser());
app.use(fileUpload());

const GetName = (req) => {
      if (req.cookies['userdata']) {
            var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
            return decoded.email;
      }else{
            return "";
      }
      
}


app.get('/', function(req, res) {
      var getname=GetName(req);
      var getfoldername = getname.split('.').join('-').split('@')[0];
      app.use(express.static(`public/profile/${getfoldername}/`));
      
      if (!fs.existsSync(path.join(__dirname,"..",'..', `public/profile/${getfoldername}/index.html`))) {
            res.redirect('/profile/profilefiles/');
      }else{
            res.sendFile(path.join(__dirname,"..",'..', `public/profile/${getfoldername}/index.html`));
      }
      
});

app.get('/profilefiles/:hello', (req, res) => {
      var profileindex=true; 
      var getname=GetName(req);
      var getfoldername = getname.split('.').join('-').split('@')[0];
      if (!fs.existsSync(path.join(__dirname,"..",'..', `public/profile/${getfoldername}/index.html`))) {
            res.render('students/profile/profilefiles');
      }else{
            res.render('students/profile/profilefiles',{profileindex : profileindex});
      }
      
});

app.get('/profilefiles/', (req, res) => {
      var profileindex=true;
      var getname=GetName(req);
      var getfoldername = getname.split('.').join('-').split('@')[0];
      if (!fs.existsSync(path.join(__dirname,"..", '..',`public/profile/${getfoldername}/index.html`))) {
            res.render('students/profile/profilefiles');
      }else{
            res.render('students/profile/profilefiles',{profileindex : profileindex});
      }
      
});

app.post('/createfolder', async (req, res) => {
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
            var dir = path.join(__dirname, "..",'..', "public/profile/" + getfoldername + middir + '/' + appenddir);
            dir = dir.split('%20').join(' ');
            dir = dir.split('$').join('/');
            if (!fs.existsSync(dir)) {
                  fs.mkdirSync(dir, {
                        recursive: true
                  });
            }
            const newProfileFile = new ProfileFolders({
                  name: appenddir,
                  filelocation: middir + '/' + appenddir,
                  createdby: getname,
                  createdon: Date.now()
            });

            newProfileFile.save();
            await res.send("Folder '" + appenddir + "' Created");
      } catch (error) {
            console.log(error);
      }
});


app.post('/uploadfile', async (req, res) => {
      var getname = GetName(req);
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
            dir="";
            if (middir=="/undefined") {
                  dir = path.join(__dirname, "..",'..', "public/profile/" + getfoldername + '/' + nameoffile);
            }else{
                  dir = path.join(__dirname, "..", '..',"public/profile/" + getfoldername + middir + '/' + nameoffile);
            }
            dir = dir.split('%20').join(' ');
            dir = dir.split('$').join('/');
            var mimesupport = ["application/octet-stream","text/x-sass","text/x-scss","text/javascript","image/svg+xml","text/html","text/plain","text/css", "application/vnd.ms-powerpoint", "application/pdf", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "image/png", "image/gif", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword", "image/jpeg"];
            var MAX_SIZE = 1024000;
            var found = (mimesupport.indexOf(sampleFile.mimetype) > -1);
            if (found && sampleFile.size < MAX_SIZE) {
                  var fileext = sampleFile.name.split('.')[1];
                  const newfile = await new ProfileFiles({
                        name: nameoffile,
                        filetype: sampleFile.mimetype,
                        createdby: getname,
                        filelocation: middir + '/' + nameoffile,
                        isDeleted: false,
                        createdon: Date.now()
                  });
                  const filename = newfile.id;
                  await sampleFile.mv(dir);
                  newfile.save();
                  res.send("File '" + newfile.name + "' Uploaded !");
            } else {
                  res.send("INVALID FILE TYPE or FILE EXCEEDING 10Mb ")
            }
      }

});


app.get('/fileslist', async (req, res) => {
      try {
            var appenddir = req.query.location.split('$').join('/');
            if (appenddir == "undefined") {
                  appenddir = ""
            }
            var getname = GetName(req);
            var getfoldername = getname.split('.').join('-').split('@')[0];
            var dir = path.join(__dirname, "..",'..', "public/profile/" + getfoldername + '/' + appenddir);
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

})

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
            var dir = path.join(__dirname, "..", '..',"public/profile/" + getfoldername + middir + '/' + appenddir);
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

app.get('/folderlist', async (req, res) => {
      try {
            var appenddir = req.query.location.split('$').join('/');
            if (appenddir == "undefined") {
                  appenddir = ""
            }
            var getname = GetName(req);
            var getfoldername = getname.split('.').join('-').split('@')[0];
            var dir = path.join(__dirname, "..",'..', "public/profile/" + getfoldername + '/' + appenddir);
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


app.post('/deletefile',(req,res)=>{
      try {
            var appenddir = req.body.filelocation;
            var filename =req.body.filename;
            var getname = GetName(req);
            var middir = "";
            if (req.body.location) {
                  middir = "/" + req.body.location;
            } else {
                  middir = "/" + middir;
            }
            var getfoldername = getname.split('.').join('-').split('@')[0];
            if (appenddir=="/profile/profilefiles/"||appenddir=="/profile/profilefiles/") {
                  dir = path.join(__dirname, "..",'..', "public/profile/" + getfoldername + '/' + filename);
                 
            }else{
                  dir = path.join(__dirname, "..",'..', "public/profile/" + getfoldername + middir + '/' + filename);
            }
            console.log(dir);
            dir = dir.split('%20').join(' ');
            dir = dir.split('$').join('/');
            fs.unlinkSync(dir);
            res.send("File '"+filename+"' Deleted ");
      } catch (error) {
            console.log(error);
      }
});

module.exports = app;