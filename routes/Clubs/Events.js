const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const jwt = require('jsonwebtoken');
const Clubs = require('../../models/Clubs');
const Locations = require('../../models/Locations');


function dynamicSort(property) {
      var sortOrder = 1;
      if (property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
      }
      return function (a, b) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
      }
}

app.get('/', (req, res) => {
      res.render('clubs/events/index')
})


app.get('/map', (req, res) => {
      res.render('clubs/events/map')
});

app.get('/manageareaandpos', (req, res) => {
      res.render('clubs/events/manageareaandpos');
});

app.get('/areasandpos/list', async (req, res) => {
      try {
            const locations = await Locations.find();
            res.send(locations);
      } catch (error) {
            console.log(error);

      }
});

app.get('/manage', (req, res) => {
      res.render('clubs/events/manageevents')
});



app.get('/addnew', (req, res) => {
      res.render('clubs/events/addevent');
});



app.post('/addnew', async (req, res) => {
      try {
            var {
                  name,
                  location,
                  locid,
                  startdate,
                  enddate,
                  starttime,
                  endtime,
                  description
            } = req.body;
            var token = await req.cookies.clubdata;
            var decoded = await jwt.verify(token, 'amitkumar');
            var getname = decoded.email;
            if (req.body && req.files) {
                  var club = await Clubs.findOne({
                        email: getname
                  });
                  if (club) {
                        var eventIcon = req.files.eventicon;
                        var eventImage = req.files.eventimage;
                        var locdata = await Locations.findOne({
                              name: location
                        });
                        var eventdata = {
                              _id: mongoose.Types.ObjectId(),
                              name: name,
                              location: location,
                              startdate: startdate,
                              enddate: enddate,
                              starttime: starttime,
                              endtime: endtime,
                              description: description,
                              locdata: locdata,
                              isDeleted: false
                        }

                        iconext = '';
                        imgext = '';

                        if (eventIcon.mimetype == 'image/png') {
                              iconext = "png"
                        }
                        if (eventIcon.mimetype == 'image/jpeg') {
                              iconext = "jpg"
                        }
                        if (eventImage.mimetype == 'image/png') {
                              imgext = "png"
                        }
                        if (eventImage.mimetype == 'image/jpeg') {
                              imgext = "jpg"
                        }

                        iconName = eventdata._id + '.' + iconext;
                        imageName = eventdata._id + '.' + imgext;

                        iconUploadPath = path.join(__dirname, '..', '..', 'public/clubs/events/icons/', iconName);
                        imageUploadPath = path.join(__dirname, '..', '..', 'public/clubs/events/images/', imageName);

                        eventImage.mv(imageUploadPath);
                        eventIcon.mv(iconUploadPath);

                        eventdata.eventImage = imageName;
                        eventdata.eventIcon = iconName;

                        await Clubs.updateOne({
                              email: getname
                        }, {
                              $push: {
                                    events: eventdata
                              }
                        });
                  }
            }
            res.render('clubs/events/addevent');
      } catch (error) {
            console.log(error);
      }
});



app.post('/undodelete', async (req, res) => {
      try {
            var token = await req.cookies.clubdata;
            var decoded = await jwt.verify(token, 'amitkumar');
            var getname = decoded.email;
            const club = await Clubs.updateOne({
                  email: getname,
                  'events._id': req.body.eventid
            }, {
                  '$set': {
                        'events.$.isDeleted': false
                  }
            });
            res.send("DELETED");

      } catch (error) {
            console.log(error);
      }
});

app.post('/delete', async (req, res) => {
      try {
            var token = await req.cookies.clubdata;
            var decoded = await jwt.verify(token, 'amitkumar');
            var getname = decoded.email;
            const club = await Clubs.updateOne({
                  email: getname,
                  'events._id': req.body.eventid
            }, {
                  '$set': {
                        'events.$.isDeleted': true
                  }
            });
            res.send("DELETED");

      } catch (error) {
            console.log(error);
      }
});

app.get('/list', async (req, res) => {
      try {
            var token = await req.cookies.clubdata;
            var decoded = await jwt.verify(token, 'amitkumar');
            var getname = decoded.email;
            var club = await Clubs.findOne({
                  email: getname
            });
            var events = [];
            club.events.forEach(element => {
                  if (element.isDeleted == false) {
                        events.push(element);
                  }
            });
            events.sort(dynamicSort("startdate"));
            res.send(events);
      } catch (error) {
            console.log(error);
      }
});

app.post('/manageareaandpos', async (req, res) => {
      try {
            if (req.body.placename != "") {
                  const location = new Locations({
                        name: req.body.placename,
                        height: req.body.height,
                        width: req.body.width,
                        top: req.body.top,
                        left: req.body.left,
                        color: req.body.color,
                        type: req.body.type
                  });
                  location.save();
                  res.render('clubs/events/manageareaandpos');
            } else {
                  res.render('clubs/events/manageareaandpos');
            }
      } catch (error) {

      }
});


module.exports = app;