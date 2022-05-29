const express = require("express");
const async = require("hbs/lib/async");
const jwt = require('jsonwebtoken');
const { default: mongoose } = require("mongoose");
const app = express();


const Users = require('../../models/Users');


app.get('/', (req, res) => {
      res.render('chats/index');
});


const GetName = (req) => {
      var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
      return decoded.email;
}

app.get('/users/list', async (req, res) => {
      try {
            var email = GetName(req);
            const users = await Users.find({
                  fullyCreated: true
            });
            var allusers = []
            users.forEach(user => {
                  var s = {
                        email: user.email,
                        name: user.profile.displayName,
                        firstName: user.profile.name.givenName,
                        lastName: user.profile.name.familyName,
                        branch: user.branch,
                        sectiion: user.section,
                        semester: user.semester
                  }
                  allusers.push(s);
            });
            var data={
                  allusers : allusers,
                  yourinfo : email
            }
            res.send(data);
      } catch (error) {
            console.log(error);
      }
});

module.exports = app;