const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const path = require('path');

const Posts = require('../../models/Posts');
const async = require('hbs/lib/async');

app.use(cookieParser());
app.use(fileUpload());
app.use(bodyParser.urlencoded({
      extended: true
}));

app.use(express.static('public'));

const GetName = (req) => {
      var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
      return decoded.email;
}


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

app.get('/', (req, res) => {
      res.render('post/index');
});

app.get('/newpost', (req, res) => {
      res.render('post/newpost');
});

app.get('/getposts', async (req, res) => {
      try {
            var postid = req.body.postid;
            var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
            var posts = await Posts.find({
                  isDeleted: false
            }).sort({
                  createdon: -1
            });
            posts.forEach(post => {
                  var obj = post.likes.find(o => o.likedby == decoded.email)
                  if (obj) {
                        post.liked = true;
                  }
            });
            posts.forEach(post => {
                  post.nooflikes = post.likescount;
                  post.noofcomments = post.commentscount;
            });
            res.send(posts);
      } catch (error) {

      }
})

app.get('/postdetails', async (req, res) => {
      try {
            var postid = req.query.postid;
            var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
            var post = await Posts.findOne({
                  _id: postid,
                  isDeleted: false
            });
            post.nooflikes = post.likescount;
            post.noofcomments = post.commentscount;
            if (post) {
                  if (post.likes.find(o => o.likedby == decoded.email)) {
                        post.liked = true
                  }
            }
            res.send(post);
      } catch (error) {
            console.log(error);
      }

})


app.post('/comment', async (req, res) => {
      try {
            var postid = req.body.postid;
            var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
            var post = await Posts.updateOne({
                  _id: postid
            }, {
                  $push: {
                        comments: {
                              commentby: decoded.email,
                              commentbyname: decoded.name,
                              comment: req.body.comment,
                              commentedon: Date.now()
                        }
                  }
            });
            res.send("OK");
      } catch (error) {
            console.log(error);
      }
});


app.get('/comments', async (req, res) => {
      try {
            var postid = req.query.postid;
            var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
            var post = await Posts.findOne({
                  _id: postid
            });
            var comments=post.comments;
            comments.sort(dynamicSort('-commentedon'));
            res.send(comments);
      } catch (error) {
            console.log(error);
      }
});

app.post('/like', async (req, res) => {
      try {
            var postid = req.body.postid;
            var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
            var post = await Posts.updateOne({
                  _id: postid
            }, {
                  $push: {
                        likes: {
                              likedby: decoded.email,
                              likedbyname: decoded.name
                        }
                  }
            });
            res.send("OK");
      } catch (error) {
            console.log(error);
      }
});

app.post('/unlike', async (req, res) => {
      try {
            var postid = req.body.postid;
            var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
            var post = await Posts.updateOne({
                  _id: postid
            }, {
                  $pull: {
                        likes: {
                              likedby: decoded.email,
                              likedbyname: decoded.name
                        }
                  }
            });
            res.send("OK");
      } catch (error) {
            console.log(error);
      }
});

app.post('/newpost', async (req, res) => {
      try {
            const sampleFile = await req.files.image;
            const getname = GetName(req);
            var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
            const newPost = await new Posts({
                  title: req.body.title,
                  paragraph: req.body.paragraph,
                  createdby: getname,
                  createdbyname: decoded.name,
                  isDeleted: false,
                  createdon: Date.now(),
            });
            const str = sampleFile.name;
            const lastIndex = str.lastIndexOf('.');
            const replacement = '$';
            let replaced;
            if (lastIndex !== -1) {
                  replaced =
                        str.substring(0, lastIndex) +
                        replacement +
                        str.substring(lastIndex + 1);
            }
            var extension = replaced.split('$')[1];
            newPost.ImageName = newPost.id + '.' + extension;
            var uploadPath = path.join(__dirname, '../../', 'public/posts/images/', newPost.ImageName);
            await sampleFile.mv(uploadPath);
            newPost.save();

            res.render('post/newpost', {
                  message: "Uploaded"
            });
      } catch (error) {
            console.log(error);
      }

});

module.exports = app;