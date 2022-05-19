require('./conn/mongo');
const express = require('express');
const app = express();
const port = 3000;
const hbs = require('hbs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const passport = require('passport');

var GoogleStrategy = require('passport-google-oauth20').Strategy;

const GOOGLE_CLIENT_ID = "562074292964-7rab2qmdbd0uhov2ogss0m0ihjhv86rf.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

const User = require('./models/Users');

var GoogleStrategy = require('passport-google-oauth20').Strategy;
app.use(cookieParser());

passport.use(new GoogleStrategy({
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google/callback"
      },
      function (accessToken, refreshToken, profile, cb) {
            var s = profile.emails[0].value;
            User.findOne({
                  'profile.id': profile.id
            }, function (err, user) {
                  if (user) {
                        return cb(err, user);
                  } else {
                        User.create({
                              profile: profile,
                              email: s,
                              fullyCreated: false,
                        }, function (err, user) {
                              return cb(err, user);
                        });
                  }
            });

      }
));

passport.serializeUser((user, done) => {
      done(null, user);
});

passport.deserializeUser((user, done) => {
      done(null, user);
});

const HomeRoute = require('./routes/Home');
const FilesRoute = require('./routes/Files');
const ProfileRoutes = require('./routes/Profile');
const PostRoutes=require('./routes/Posts');
const AcademicsRoute=require('./routes/Academics');


const {
      application
} = require('express');
const Users = require('./models/Users');




app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({
      extended: true
}));
app.use(express.static('public'));
hbs.registerPartials(__dirname + '/views/partials');


app.use('/files', FilesRoute);
app.use('/profile', ProfileRoutes);
app.use('/post',PostRoutes);
app.use('/academics',AcademicsRoute);

app.get('/', (req, res) => {
      res.render('index');
});

app.get('/auth/google',
      passport.authenticate('google', {
            scope: ['https://www.googleapis.com/auth/userinfo.profile',
                  'https://www.googleapis.com/auth/userinfo.email'
            ]
      }), (req, res) => {
            console.log(req.body);
      });

app.get('/auth/google/callback',
      passport.authenticate('google', {
            failureRedirect: '/login'
      }),
      function (req, res) {
            var userdetails = {
                  name: req.user.profile.displayName,
                  userid: req.user.id,
                  email: req.user.email
            }
            var token = jwt.sign(userdetails, 'amitkumar');
            res.cookie('createuser',token, {maxAge: 90000000, httpOnly: true, secure: false, overwrite: true});
            res.redirect('/createuser');
      });

app.get('/login', (req, res) => {
      res.render('login');
});

app.get('/createuser', async (req, res) => {
      try {
            if (req.cookies['createuser']) {
                  var theusertoken = req.cookies['createuser'];
                  var decoded = jwt.verify(theusertoken, 'amitkumar');
                  const checkUser=await Users.findOne({ id : decoded.id, email : decoded.email ,fullyCreated : false});
                  if (checkUser) {
                        var theuser={
                              email : checkUser.email,
                              firstname : checkUser.profile.name.givenName,
                              lastname : checkUser.profile.name.familyName,
                        }
                        res.render('createuser',{theuser : theuser});
                  }else{
                        res.redirect('/');
                  }   
            } else {
                  res.redirect('/');
            }
      } catch (error) {

      }

});


app.post('/createuser',async(req,res)=>{
      try {
            var theusertoken = req.cookies['createuser'];
            var decoded = jwt.verify(theusertoken, 'amitkumar');
            if (req.body.semester==""||req.body.section==""||req.body.branch==""||req.body.password.length<6||req.body.cpassword.length<6) {
                  res.send("INVALID INPUTS");
            }else{
                  if (req.body.password===req.body.cpassword) {
                        const User = await Users.findOneAndUpdate({
                              id : decoded.id, email : decoded.email ,fullyCreated : false
                        }, {
                              
                              semester : req.body.semester,
                              branch : req.body.branch,
                              section : req.body.section,
                              password :req.body.password,
                              fullyCreated : true
      
                        }, {
                              new: true
                        });
                        res.clearCookie("createuser");
                        res.redirect('/');
                  }else{
                        res.send("PASSWORD DOESN'T MATCH");
                  }
                  
            }
            
      } catch (error) {
            
      }
});

app.use('/', HomeRoute);

app.post('/login', async (req, res) => {
      try {
            const User = await Users.findOne({
                  email: req.body.email,
                  password: req.body.password
            });
            if (User) {
                  var token = await jwt.sign({
                        email: User.email
                  }, 'amitkumar');
                  await res.cookie('userdata', token);
                  res.redirect('home');
            } else {
                  res.send("NOT OK");
            }
      } catch (error) {
            console.log(error);
      }
});


app.get('/logout',(req,res)=>{
      res.clearCookie('userdata');
      res.redirect('/');
});

app.listen(port, () => {
      console.log(`Example app listening on port ${port}`)
});