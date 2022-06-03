const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fileUpload = require('express-fileupload');

// app.use(fileUpload());

const Posts = require('../../models/Posts');
const TempPosts = require('../../models/TempPosts');
const cookieParser = require('cookie-parser');
const async = require('hbs/lib/async');


app.use(fileUpload({
      useTempFiles: true,
      safeFileNames: true,
      tempFileDir: path.join(__dirname, '..', '..', '/public/clubs/tmp/')
}));


app.use(cookieParser());
app.use(bodyParser.urlencoded({
      extended: true
}));


app.get('/', (req, res) => {
      res.render('clubs/posts/index');
});
app.get('/addnew', (req, res) => {
      res.render('clubs/posts/addnewpost');
});

app.get('/manage', (req, res) => {
      res.render('clubs/posts/manageposts')
});


app.get('/edit/:postid', async (req, res) => {
      try {
            var token = await req.cookies.clubdata;
            var decoded = await jwt.verify(token, 'amitkumar');
            var getname = decoded.email;
            const post = await Posts.findOne({
                  clubname: getname,
                  _id: req.query.postid
            });
            res.render('clubs/editpost');
      } catch (error) {

      }
});




app.get('/view', async (req, res) => {
      try {
            var token = await req.cookies.clubdata;
            var decoded = await jwt.verify(token, 'amitkumar');
            var getname = decoded.email;
            const post = await Posts.findOne({
                  clubname: getname,
                  _id: req.query.postid
            });
            res.send(post);
      } catch (error) {

      }
});


app.post('/delete', async (req, res) => {
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


app.post('/undodelete', async (req, res) => {
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


app.get('/list', async (req, res) => {
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

app.post('/addnew', async (req, res) => {
      try {
            var token = await req.cookies.clubdata;
            var decoded = await jwt.verify(token, 'amitkumar');
            if (req.body.title && req.body.postbody) {
                  var post = {
                        title: req.body.title,
                        body: req.body.postbody,
                        createdby: decoded.membername + ',' + decoded.memberemail + ',' + decoded.memberdesignation,
                        clubname: decoded.email,
                        createdon: Date.now(),
                        isDeleted: false,
                        type: "clubpost",
                        images: []
                  }
                  if (req.files) {
                        if (req.files.file[1]) {
                              var files = req.files.file;
                              files.forEach(file => {
                                    var objid = mongoose.Types.ObjectId();
                                    if (file.mimetype == 'image/jpeg') {
                                          filename = objid + '.jpg';
                                    }
                                    if (file.mimetype == 'image/png') {
                                          filename = objid + '.png';
                                    }
                                    uploadPath = path.join(__dirname, '..', '..', 'public/posts/images', filename);
                                    file.mv(uploadPath, function (err) {

                                    });
                                    post.images.push(filename);
                              });
                        } else if (req.files.file) {
                              var file = req.files.file;
                              var objid = mongoose.Types.ObjectId();
                              if (file.mimetype == 'image/jpeg') {
                                    filename = objid + '.jpg';
                              }
                              if (file.mimetype == 'image/png') {
                                    filename = objid + '.png';
                              }
                              uploadPath = path.join(__dirname, '..', '..', 'public/posts/images', filename);
                              file.mv(uploadPath, function (err) {

                              });
                              post.images.push(filename);
                        }
                  }
                  const newpost = await new TempPosts(post);
                  await newpost.save();
                  res.render('clubs/posts/previewpost', {
                        post: newpost
                  });
            } else {
                  res.render('clubs/posts/addnewpost', {
                        message: "POST TITLE AND BODY REQUIRED"
                  });
            }

      } catch (error) {
            console.log(error);
      }
});


app.post('/publish', async (req, res) => {
      try {
            var token = await req.cookies.clubdata;
            var decoded = await jwt.verify(token, 'amitkumar');
            const post = await TempPosts.findOne({
                  _id: req.body.postid
            });
            const newPost = await new Posts({
                  title: post.title,
                  body: post.body,
                  createdby: decoded.membername + ',' + decoded.memberemail + ',' + decoded.memberdesignation,
                  clubname: decoded.email,
                  createdon: Date.now(),
                  isDeleted: false,
                  type: "clubpost",
                  images: post.images
            });
            newPost.save();
            res.send("DONE")
      } catch (error) {

      }
})

module.exports = app;