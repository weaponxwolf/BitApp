const express = require("express");
const async = require("hbs/lib/async");
const jwt = require('jsonwebtoken');
const {
      v4: uuidv4
} = require('uuid')
const {
      default: mongoose
} = require("mongoose");
const app = express();


const Users = require('../../models/Users');
const {
      find
} = require("cheerio/lib/api/traversing");
const Messages = require("../../models/Messages");


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

app.get('/', async (req, res) => {
      try {
            var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
            const user = await Users.findOne({
                  email: decoded.email,
                  fullyCreated: true
            });
            if (user) {
                  var s = {
                        name: user.profile.displayName,
                        email: decoded.email,
                        branch: decoded.branch,
                        section: decoded.section
                  }
                  // console.log(s);
                  res.render('chats/index', {
                        user: s
                  });
            }

      } catch (error) {

      }


});


const GetName = (req) => {
      var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
      return decoded.email;
}

app.get('/messenger/list', async (req, res) => {
      try {
            var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
            const messages = await Messages.find({
                  $or: [{
                        fromemail: decoded.email
                  }, {
                        toemail: decoded.email
                  }]
            }).sort({
                  createdon: -1
            });
            console.log(messages);
            var messengers = new Set();
            messages.forEach(message => {
                  if (message.fromemail != decoded.email) {
                        messengers.add(message.fromemail);
                  }
            })
            var messengerarray = Array.from(messengers);
            var msgandmsgers = [];
            for (let i = 0; i < messengerarray.length; i++) {
                  const message = await Messages.findOne({
                        fromemail: messengerarray[i],
                        toemail: decoded.email
                  }).sort({
                        createdon: -1
                  });
                  msgandmsgers.push(message);
            }
            res.send(msgandmsgers)
      } catch (error) {
            console.log(error);
      }
})


app.get('/messages/byemail', async (req, res) => {
      try {
            var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
            const messages = await Messages.find({
                  $or: [{
                        fromemail: req.query.email,
                        toemail: decoded.email
                  }, {
                        fromemail: decoded.email,
                        toemail: req.query.email
                  }]
            });
            console.log(messages);
            res.send(messages)
      } catch (error) {
            console.log(error);
      }
})

app.get('/users/list', async (req, res) => {
      try {
            var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
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
            var data = {
                  allusers: allusers,
                  useremail: decoded.email,
                  username: decoded.name,
            }
            res.send(data);
      } catch (error) {
            console.log(error);
      }
});

app.post('/chatroom', async (req, res) => {
      try {
            var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
            const user = await Users.findOne({
                  email: decoded.email
            });
            var obj = user.chatrooms.find((o) => o.with == req.body.email);
            if (obj) {
                  res.send(obj.chatroomid);
            } else {
                  var id = uuidv4();
                  var s = {
                        with: req.body.email,
                        chatroomid: id
                  }
                  await Users.updateOne({
                        email: decoded.email
                  }, {
                        $push: {
                              chatrooms: s
                        }
                  });
                  const anotheruser = await Users.findOne({
                        email: req.body.email
                  });
                  var obj = anotheruser.chatrooms.find((o) => o.with == decoded.email);
                  if (obj) {
                        res.send("OK")
                  } else {
                        var x = {
                              with: decoded.email,
                              chatroomid: id
                        }
                        await Users.updateOne({
                              email: req.body.email
                        }, {
                              $push: {
                                    chatrooms: x
                              }
                        });
                        res.send(id);
                  }
            }
      } catch (error) {
            console.log(error);
      }
});

module.exports = app;