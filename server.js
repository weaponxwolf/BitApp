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
require('dotenv').config()
const async = require('hbs/lib/async');

//IMPORTANT MIDDLEWARES
app.use(cookieParser());
app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({
      extended: true
}));
app.use(express.static('public'));
hbs.registerPartials(__dirname + '/views/partials');


//MODELS
const Users = require('./models/Users');
const Clubs = require('./models/Clubs');
const Messages = require('./models/Messages');

//CHECK LOG IN FUNCTION
var IsLoggedIn = async (req, res, next) => {
      try {
            if (req.cookies['userdata']) {
                  var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
                  const user = await Users.findOne({
                        email: decoded.email
                  });
                  if (user) {
                        next();
                  } else {
                        res.redirect('/');
                  }
            } else
                  res.redirect('/');
      } catch (error) {
            res.redirect('/');
      }
}
var IsClubLoggedIn = async (req, res, next) => {
      try {
            if (req.cookies['clubdata']) {
                  var decoded = jwt.verify(req.cookies['clubdata'], 'amitkumar');
                  const club = await Clubs.findOne({
                        email: decoded.email
                  });
                  if (club) {
                        next();
                  } else {
                        res.redirect('/');
                  }
            } else
                  res.redirect('/');
      } catch (error) {
            res.redirect('/');
      }
}

//GET USER DETAILS BY EMAIL
const GetUserDetails = async (email) => {
      const User = await Users.findOne({
            email: email
      });
      if (User) {
            return {
                  name: User.profile.displayName,
                  branch: User.branch,
                  email: User.email,
                  section: User.section
            }
      } else {
            return null;
      }

}

const GetName = (req) => {
      if (req.cookies['userdata']) {
            var decoded = jwt.verify(req.cookies['userdata'], process.env.JWT_SIGNATURE);
            return decoded.email;
      } else
            return null;
}
const GetClubName = (req) => {
      if (req.cookies['clubdata']) {
            var decoded = jwt.verify(req.cookies['clubdata'], process.env.JWT_SIGNATURE);
            return decoded.email;
      } else
            return null;
}

//ALL ROUTES
const HomeRoute = require('./routes/Students/Home');
const FilesRoute = require('./routes/Students/Files');
const ProfileRoutes = require('./routes/Students/Profile');
const PostRoutes = require('./routes/Students/Posts');
const AcademicsRoute = require('./routes/Students/Academics');
const ViewProfileRoute = require('./routes/Students/ViewProfile');
const ExploreRoute = require('./routes/Students/Explore');
const ClubsRoute = require('./routes/Clubs/Club');
const MapsRoute = require('./routes/Students/Maps');
const NewsRoute = require('./routes/Students/News');
const ChatsRoute = require('./routes/Students/Chats');
const {
      decode
} = require('punycode');


//ALL CLUB ACCESS ROUTES
app.use('/club', IsClubLoggedIn, ClubsRoute);

//ALL STUDENT ACCESS ROUTES
app.use('/maps', IsLoggedIn, MapsRoute);
app.use('/files', IsLoggedIn, FilesRoute);
app.use('/profile', IsLoggedIn, ProfileRoutes);
app.use('/post', IsLoggedIn, PostRoutes);
app.use('/academics', IsLoggedIn, AcademicsRoute);
app.use('/explore', IsLoggedIn, ExploreRoute);
app.use('/news', IsLoggedIn, NewsRoute);
app.use('/viewprofile', ViewProfileRoute);
app.use('/home', IsLoggedIn, HomeRoute);
app.use('/chats', IsLoggedIn, ChatsRoute);


//FIRST PAGE - OPTIONS FOR LOG IN
app.get('/', (req, res) => {
      var getname = GetName(req);
      var getclubname = GetClubName(req);
      if (getname == null && getclubname == null) {
            res.render('index');
      } else if (getname) {
            res.redirect('/home');
      } else if (getclubname) {
            res.redirect('/club/admin')
      } else {
            res.render('index');
      }
});


//SIGN UP BY GOOGLE AUTHENTICATION
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

var GoogleStrategy = require('passport-google-oauth20').Strategy;
passport.use(new GoogleStrategy({
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google/callback"
      },
      function (accessToken, refreshToken, profile, cb) {
            var s = profile.emails[0].value;
            Users.findOne({
                  'profile.id': profile.id
            }, function (err, user) {
                  if (user) {
                        return cb(err, user);
                  } else {
                        Users.create({
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
app.get('/auth/google', passport.authenticate('google', {
      scope: ['https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
      ]
}), (req, res) => {
      console.log(req.body);
});
app.get('/auth/google/callback', passport.authenticate('google', {
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
                        res.redirect('/login');
                  }
            } else {
                  res.redirect('/');
            }
      } catch (error) {

      }
});


// LOG IN AS USER
app.get('/login', async (req, res) => {
      try {
            if (req.cookies['userdata']) {
                  var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
                  const user = await Users.findOne({
                        email: decoded.email
                  });
                  if (user) {
                        next();
                  } else {
                        res.render('login');
                  }
            } else
                  res.render('login');
      } catch (error) {
            res.redirect('/');
      }
});

//LOGIN IN POST REQUEST
app.post('/login', async (req, res) => {
      try {
            if (req.body.email == "" || req.body.password == "") {
                  res.render('login', {
                        message: "Please Enter Username and Password !"
                  })
            } else if (req.body.email == "") {
                  res.render('login', {
                        message: "Plaease Enter Email !"
                  })
            } else if (req.body.password == "") {
                  res.render('login', {
                        message: "Please Enter Password !"
                  });
            } else {
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
                        res.redirect('/home');
                  } else {
                        res.render('login', {
                              message: " Invalid Credentials !"
                        });
                  }
            }
      } catch (error) {
            console.log(error);
      }
});




app.get('/notifications/create', (req, res) => {
      res.render('createnotifications');
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
      } catch (error) {}
});


//CLUB LOGIN
app.get('/clublogin', (req, res) => {
      res.render('clublogin');
})

app.post('/clublogin', async (req, res) => {
      try {

            const club = await Clubs.findOne({
                  email: req.body.email,
            });
            if (club) {
                  var obj = club.members.find((e) => e.email === req.body.memberemail);
                  if (obj) {
                        var token = await jwt.sign({
                              email: club.email,
                              memberemail: obj.email,
                              membername: obj.name,
                              memberdesignation: obj.designation,
                              batch: obj.batch,
                              rank: obj.rank,
                        }, 'amitkumar');
                        await res.cookie('clubdata', token);
                        res.redirect('/club/admin');
                  } else {
                        res.render('clublogin', {
                              message: "You are Not Registered As Member Of The Club !"
                        })
                  }
            } else {
                  res.render('clublogin', {
                        message: "Club Is Not Registered in BitApp !"
                  })
            }
      } catch (error) {
            console.log(error);
      }
});



app.get('/logout', (req, res) => {
      res.clearCookie('userdata');
      res.clearCookie('clubdata');
      res.redirect('/');
});




const UsersOnline = require('./models/OnlineUsers');

//SOCKETS
io.on('connection', (socket) => {
      if (socket.handshake.headers.cookie) {
            var cookies = cookie.parse(socket.handshake.headers.cookie);
            if (cookies.userdata) {
                  var decoded = jwt.verify(cookies.userdata, process.env.JWT_SIGNATURE);
                  UsersOnline.findOne({
                        email: decoded.email
                  }, (err, user) => {
                        if (user) {} else {
                              UsersOnline.create({
                                    email: decoded.email,
                                    name: decoded.name,
                                    branch: decoded.branch,
                                    section: decoded.section,
                                    socketID: socket.id
                              }, (err, doc) => {});
                        }
                  });
                  socket.on('disconnect', () => {
                        UsersOnline.deleteOne({
                              email: decoded.email
                        }, (err, doc) => {});
                  });

                  socket.on('private_message', (data) => {
                        UsersOnline.findOne({
                              email: data.recieveremail
                        }, (err, user) => {
                              if (user) {
                                    Messages.findOne({
                                          $or: [{
                                                between: [data.senderemail, data.recieveremail]
                                          }, {
                                                between: [data.recieveremail, data.senderemail]
                                          }]
                                    }, (err, doc) => {
                                          if (doc) {
                                                var message = {
                                                      fromemail: data.senderemail,
                                                      from: data.sendername,
                                                      toemail: data.recieveremail,
                                                      to: data.recievername,
                                                      message: data.message,
                                                      createdon: Date.now()
                                                }
                                                Messages.findOneAndUpdate({
                                                      $or: [{
                                                            between: [data.senderemail, data.recieveremail]
                                                      }, {
                                                            between: [data.recieveremail, data.senderemail]
                                                      }]
                                                }, {
                                                      $push: {
                                                            messages: message
                                                      }
                                                }, {
                                                      new: true
                                                }, (err, doc) => {
                                                });
                                          } else {
                                                var message = {
                                                      fromemail: data.senderemail,
                                                      from: data.sendername,
                                                      toemail: data.recieveremail,
                                                      to: data.recievername,
                                                      message: data.message,
                                                      createdon: Date.now()
                                                }
                                                Messages.create({
                                                      between: [data.senderemail, data.recieveremail]
                                                }, (err, doc) => {
                                                      Messages.findOneAndUpdate({
                                                            $or: [{
                                                                  between: [data.senderemail, data.recieveremail]
                                                            }, {
                                                                  between: [data.recieveremail, data.senderemail]
                                                            }]
                                                      }, {
                                                            $push: {
                                                                  messages: message
                                                            }
                                                      }, {
                                                            new: true
                                                      }, (err, doc) => {
                                                      });
                                                });

                                          }
                                    })
                                    socket.broadcast.to(user.socketID).emit('new_message', data);
                              } else {
                                    Messages.findOne({
                                          $or: [{
                                                between: [data.senderemail, data.recieveremail]
                                          }, {
                                                between: [data.recieveremail, data.senderemail]
                                          }]
                                    }, (err, doc) => {
                                          if (doc) {
                                                var message = {
                                                      fromemail: data.senderemail,
                                                      from: data.sendername,
                                                      toemail: data.recieveremail,
                                                      to: data.recievername,
                                                      message: data.message,
                                                      createdon: Date.now()
                                                }
                                                Messages.findOneAndUpdate({
                                                      $or: [{
                                                            between: [data.senderemail, data.recieveremail]
                                                      }, {
                                                            between: [data.recieveremail, data.senderemail]
                                                      }]
                                                }, {
                                                      $push: {
                                                            messages: message
                                                      }
                                                }, {
                                                      new: true
                                                }, (err, doc) => {
                                                });
                                          } else {
                                                var message = {
                                                      fromemail: data.senderemail,
                                                      from: data.sendername,
                                                      toemail: data.recieveremail,
                                                      to: data.recievername,
                                                      message: data.message,
                                                      createdon: Date.now()
                                                }
                                                Messages.create({
                                                      between: [data.senderemail, data.recieveremail]
                                                }, (err, doc) => {
                                                      Messages.findOneAndUpdate({
                                                            $or: [{
                                                                  between: [data.senderemail, data.recieveremail]
                                                            }, {
                                                                  between: [data.recieveremail, data.senderemail]
                                                            }]
                                                      }, {
                                                            $push: {
                                                                  messages: message
                                                            }
                                                      }, {
                                                            new: true
                                                      }, (err, doc) => {
                                                            
                                                      });
                                                });

                                          }
                                    });
                              }

                        });
                  });

                  socket.on('online_users', (branchandsection) => {
                        UsersOnline.find({
                              branch: branchandsection.branch,
                              section: branchandsection.section
                        }, (err, users) => {
                              socket.emit('users_online', users);
                        })
                  })
            }

      }


      socket.on('broadcastnotification', (data) => {
            socket.broadcast.emit('notification', data);
      });
});


server.listen(process.env.PORT, () => {
      console.log('Server Listening on http://localhost:3000');
});