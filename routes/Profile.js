const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

app.use(cookieParser());
app.use(fileUpload());

const GetName = (req) => {
      var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
      return decoded.email;
}


app.get('/', (req, res) => {
      res.render('profile/index');
});

app.get('/profilefiles/:hello', (req, res) => {
      res.render('profile/profilefiles.hbs');
});


app.get('/profilefiles', (req, res) => {
      res.render('profile/profilefiles.hbs');
});


app.post('/createfolder',async (req,res)=>{
      try {
            var appenddir=req.body.foldername;
            var getname = GetName(req);
            var middir="";
            
            
            if (req.body.location) {
                  middir="/"+req.body.location;
            }else
            {
                  middir="/"+middir;
            }
            
            var getfoldername = getname.split('.').join('-').split('@')[0];
            var dir = path.join(__dirname, "..", "public/profile/" + getfoldername+middir+'/'+appenddir);
            dir=dir.split('%20').join(' ');
            dir=dir.split('$').join('/');
            console.log(dir);
            if (!fs.existsSync(dir)) {
                  fs.mkdirSync(dir, {
                        recursive: true
                  });
            }
            await res.send("Folder '"+ appenddir +"' Created");
      } catch (error) {
            console.log(error);
      }
});

app.get('/folderlist', async (req, res) => {
      try {
            var appenddir=req.query.location.split('$').join('/');
            if (appenddir=="undefined") {
                  appenddir=""
            }
            var getname = GetName(req);
            var getfoldername = getname.split('.').join('-').split('@')[0];
            var dir = path.join(__dirname, "..", "public/profile/" + getfoldername+'/'+appenddir);
            if (!fs.existsSync(dir)) {
                  fs.mkdirSync(dir, {
                        recursive: true
                  });
            }
            function getDirectories(path) {
                  return fs.readdirSync(path).filter(function (file) {
                    return fs.statSync(path+'/'+file).isDirectory();
                  });
            }
            res.send(getDirectories(dir));
      } catch (error) {
            console.log(error);
      }
});


module.exports = app;