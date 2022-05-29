const express = require("express");
const res = require("express/lib/response");
const fs = require('fs');
const async = require("hbs/lib/async");
const path = require('path');
const fileUpload = require('express-fileupload');
const {
      send
} = require("process");

const Locations = require('../../models/Locations');
const Clubs = require('../../models/Clubs');

const app = express()
app.use(fileUpload());

app.get('/', (req, res) => {
      res.render('maps/index');
});



app.get('/events/ongoing', async (req, res) => {
      try {
            const clubs = await Clubs.find();
            var ongoingevents = [];
            clubs.forEach(club => {
                  club.events.forEach(event => {
                        if (event.isDeleted == false) {
                              var today = new Date();
                              var day = today.getDate().toString();
                              var month = (today.getMonth()+1).toString();
                              var year = today.getFullYear().toString();
                              if (parseInt(day) < 10) {
                                    day = '0' + day;
                              }
                              if (parseInt(month) < 10) {
                                    month = '0' + month;
                              }
                              var datetoday = year + "-" + month + "-" + day;
                              if (datetoday <= event.enddate ) {
                                    if (datetoday >= event.startdate) {
                                          ongoingevents.push(event);
                                    }
                              }
                        }
                  });
            });
            // console.log(events);
            res.send(ongoingevents);
      } catch (error) {
            console.log(error);
      }
});

app.get('/managemaps', (req, res) => {
      res.render('maps/managemaps');
});
app.post('/managemaps', async (req, res) => {
      try {
            console.log(req.files.map);
            var themap = req.files.map;
            console.log(req.body);
            var location = await Locations.findOne({
                  _id: req.body.locid
            });
            uploadPath = path.join(__dirname, '..', '/public/map/' + location._id + '.jpg');
            await themap.mv(uploadPath);
            res.render('maps/managemaps');
      } catch (error) {
            console.log(error);
      }
});

app.get('/location/id', async (req, res) => {
      try {
            var location = await Locations.findOne({
                  _id: req.query.id
            });
            res.send(location);
      } catch (error) {

      }
});

app.get('/location/names', async (req, res) => {
      try {
            const locations = await Locations.find({
                  name: {
                        $regex: req.query.location,
                        $options: 'i'
                  }
            });
            res.send(locations);
      } catch (error) {
            console.log(error);
      }
});

module.exports = app;