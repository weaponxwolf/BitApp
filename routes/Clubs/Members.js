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
      res.render('clubs/members/index');
});

app.get('/ranks', (req, res) => {
      res.render('clubs/members/ranks');
});

app.get('/addnew', (req, res) => {
      res.render('clubs/members/addmember');
});

app.post('/addnew', async (req, res) => {
      try {
            var token = await req.cookies['clubdata'];
            var decoded = await jwt.verify(token, 'amitkumar');
            var getname = decoded.email;
            var club = await Clubs.findOne({
                  email: getname
            });
            club.members.push(req.body);
            club.save();
            res.redirect('/club/members');
      } catch (error) {

      }
});

app.get('/ranklist', async (req, res) => {
      try {
            var token = req.cookies.clubdata;
            var decoded = jwt.verify(token, 'amitkumar');
            const clubs = await Clubs.findOne({
                  email: decoded.email
            });
            var s = clubs.members;
            s.sort(dynamicSort("rank"));
            res.send(s);
      } catch (error) {
            console.log(error);
      }
});


app.get('/listbyyear', async (req, res) => {
      try {

            var token = req.cookies.clubdata;
            var decoded = jwt.verify(token, 'amitkumar');
            const club = await Clubs.findOne({
                  email: decoded.email
            });
            var members = [];
            club.members.forEach(element => {
                  if (element.batch === req.query.year) {
                        members.push(element);
                  }
            });
            res.send(members);
      } catch (error) {
            console.log(error);
      }
});

app.post('/updaterank', async (req, res) => {
      try {
            var token = await req.cookies['clubdata'];
            var decoded = await jwt.verify(token, 'amitkumar');
            var getname = decoded.email;
            var email = req.body.rollno.split('-').join('.') + '@bitmesra.ac.in';
            const s = await Clubs.updateOne({
                  email: getname,
                  'members.email': email
            }, {
                  '$set': {
                        'members.$.rank': req.body.rank,
                  }
            });
            res.send("OK");
      } catch (error) {
            console.log(error);
      }
});

app.get('/list', async (req, res) => {
      try {
            var token = req.cookies.clubdata;
            var decoded = jwt.verify(token, 'amitkumar');
            const clubs = await Clubs.findOne({
                  email: decoded.email
            });
            var s = clubs.members;
            s.sort(dynamicSort("rank"));
            res.send(s);
      } catch (error) {
            console.log(error);
      }
});

module.exports = app;