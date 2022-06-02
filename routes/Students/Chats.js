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
                  res.render('students/chats/index', {
                        user: s
                  });
            }
      } catch (error) {}
});


const GetName = (req) => {
      var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
      return decoded.email;
}

app.get('/messenger/list', async (req, res) => {
      try {
            var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
            const conversations = await Messages.find({
                  between: decoded.email
            });
            var msgers = [];
            conversations.forEach(convo => {
                  var themsg = convo.messages[convo.messages.length - 1];
                  var thelastmsg = {
                        message: themsg.message,
                        from: themsg.from,
                        to: themsg.to,
                        fromemail: themsg.fromemail,
                        toemail: themsg.toemail,
                        createdon: themsg.createdon,
                        indexname: "",
                        indexemail: ""
                  }
                  if (themsg.fromemail == decoded.email) {
                        thelastmsg.indexname = themsg.to;
                        thelastmsg.indexemail = themsg.toemail;
                  } else {
                        thelastmsg.indexname = themsg.from;
                        thelastmsg.indexemail = themsg.fromemail;
                  }
                  msgers.push(thelastmsg);
            });
            msgers.sort(dynamicSort('-createdon'));
            res.send(msgers);
      } catch (error) {
            console.log(error);
      }
})


app.get('/messages/byemail', async (req, res) => {
      try {
            var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
            const messages = await Messages.findOne({
                  between: {
                        $all: [decoded.email, req.query.email]
                  }
            });
            res.send(messages);
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
                        section: user.section,
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


module.exports = app;