const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const path=require('path');

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

app.get('/', (req, res) => {
      res.render('post/index');
});

app.get('/newpost', (req, res) => {
      res.render('post/newpost');
});

app.get('/getposts',async(req,res)=>{
      try {
            const posts=await Posts.find({
                  isDeleted: false
            }).sort({createdon : -1});
            res.send(posts);
      } catch (error) {
            
      }
})

app.get('/postdetails',async(req,res)=>{
      try {
            var postid=req.query.postid;
            const post=await Posts.findOne({
                  _id : postid,
                  isDeleted: false
            });
            res.send(post);
      } catch (error) {
            console.log(error);
      }
      
})

app.post('/newpost', async (req, res) => {
      try {
            const sampleFile =await req.files.image;
            const getname = GetName(req);
            var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
            console.log(decoded);
            const newPost = await new Posts({
                  title: req.body.title,
                  paragraph: req.body.paragraph,
                  createdby: getname,
                  createdbyname : decoded.name,
                  isDeleted:false,
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
            var extension=replaced.split('$')[1];
            newPost.ImageName = newPost.id+'.'+extension;
            var uploadPath=path.join(__dirname,'../../','public/posts/images/',newPost.ImageName);
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