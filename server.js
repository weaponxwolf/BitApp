require('./conn/mongo');
const express = require('express');
const app = express();
const http = require('http');
const port = 3000;
const server = http.createServer(app);
const {
      Server
} = require("socket.io");
const io = new Server(server);
const hbs = require('hbs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const cookie = require('cookie');
const fs = require('fs')
const path = require('path')
const ViewProfileRoute = require('./routes/ViewProfile');

var GoogleStrategy = require('passport-google-oauth20').Strategy;

const GOOGLE_CLIENT_ID = "562074292964-7rab2qmdbd0uhov2ogss0m0ihjhv86rf.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

const User = require('./models/Users');

const GetName = (req) => {
      if (req.cookies['userdata']) {
            var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
            return decoded.email;
      } else
            return null;
}


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
const PostRoutes = require('./routes/Posts');
const AcademicsRoute = require('./routes/Academics');
const ExploreRoute = require('./routes/Explore');
const Messages = require('./models/Messages');
const ClubsRoute = require('./routes/Club');
const MapsRoute = require('./routes/Maps');
const NewsRoute = require('./routes/News');


const {
      application
} = require('express');
const Users = require('./models/Users');
const Files = require('./models/Files');
const async = require('hbs/lib/async');
const Clubs = require('./models/Clubs');




app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({
      extended: true
}));
app.use(express.static('public'));
hbs.registerPartials(__dirname + '/views/partials');


app.use('/files', FilesRoute);
app.use('/profile', ProfileRoutes);
app.use('/post', PostRoutes);
app.use('/academics', AcademicsRoute);
app.use('/explore', ExploreRoute);
app.use('/news', NewsRoute);

app.get('/', (req, res) => {
      var getname = GetName(req);
      if (getname == null) {
            res.render('index');
      } else {
            res.redirect('/home');
      }
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
            res.cookie('createuser', token, {
                  maxAge: 90000000,
                  httpOnly: true,
                  secure: false,
                  overwrite: true
            });
            res.redirect('/createuser');
      });

app.get('/login', (req, res) => {
      res.render('login');
});
app.use('/viewprofile', ViewProfileRoute);

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

app.get('/notifications/create', (req, res) => {
      res.render('createnotifications');
});

app.get('/createuser', async (req, res) => {
      try {
            if (req.cookies['createuser']) {
                  var theusertoken = req.cookies['createuser'];
                  var decoded = jwt.verify(theusertoken, 'amitkumar');
                  const checkUser = await Users.findOne({
                        id: decoded.id,
                        email: decoded.email,
                        fullyCreated: false
                  });
                  if (checkUser) {
                        var theuser = {
                              email: checkUser.email,
                              firstname: checkUser.profile.name.givenName,
                              lastname: checkUser.profile.name.familyName,
                        }
                        res.render('createuser', {
                              theuser: theuser
                        });
                  } else {
                        res.redirect('/');
                  }
            } else {
                  res.redirect('/');
            }
      } catch (error) {

      }

});


app.post('/createuser', async (req, res) => {
      try {
            var theusertoken = req.cookies['createuser'];
            var decoded = jwt.verify(theusertoken, 'amitkumar');
            if (req.body.semester == "" || req.body.section == "" || req.body.branch == "" || req.body.password.length < 6 || req.body.cpassword.length < 6) {
                  res.send("INVALID INPUTS");
            } else {
                  if (req.body.password === req.body.cpassword) {
                        const User = await Users.findOneAndUpdate({
                              id: decoded.id,
                              email: decoded.email,
                              fullyCreated: false
                        }, {

                              semester: req.body.semester,
                              branch: req.body.branch,
                              section: req.body.section,
                              password: req.body.password,
                              fullyCreated: true

                        }, {
                              new: true
                        });
                        res.clearCookie("createuser");
                        res.redirect('/');
                  } else {
                        res.send("PASSWORD DOESN'T MATCH");
                  }

            }

      } catch (error) {

      }
});

app.use('/club', ClubsRoute);
app.use('/maps', MapsRoute);
app.use('/', HomeRoute);


app.post('/login', async (req, res) => {
      try {
            const User = await Users.findOne({
                  email: req.body.email,
                  password: req.body.password
            });
            if (User) {
                  var token = await jwt.sign({
                        email: User.email,
                        name: User.profile.displayName,
                        branch: User.branch,
                        section: User.section
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


app.get('/clublogin', (req, res) => {
      res.render('clublogin');
})

app.post('/clublogin', async (req, res) => {
      try {
            const club = await Clubs.findOne({
                  email: req.body.email,
                  password: req.body.password
            });
            if (club) {
                  var token = await jwt.sign({
                        email: club.email,
                  }, 'amitkumar');
                  await res.cookie('clubdata', token);
                  res.redirect('/club/admin');
            }
      } catch (error) {

      }
});

app.get('/logout', (req, res) => {
      res.clearCookie('userdata');
      res.redirect('/');
});

io.on('connection', (socket) => {

      var cookies = cookie.parse(socket.handshake.headers.cookie);
      var decoded = jwt.verify(cookies.userdata, 'amitkumar');
      socket.broadcast.emit('user', {
            username: decoded.name,
            email: decoded.email
      });
      socket.on('disconnect', () => {});

      socket.on('sendmessagetoclass', (data) => {
            socket.broadcast.emit("newmessage", data);
            Messages.create({
                  message: data.message,
                  messageby: data.nameofuser,
                  byemail: data.emailofuser,
                  messageto: "ECE_A",
                  createdon: Date.now()
            }, function (err, small) {
                  if (err) return handleError(err);
                  // saved!
            });
      });
      socket.on('broadcastnotification',(data)=>{
            console.log("hisdssis");
            socket.broadcast.emit('notification',data);
      });
});


server.listen(3000, () => {
      console.log('Server Listening on http://localhost:3000');
});