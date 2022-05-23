const express = require("express");
const res = require("express/lib/response");
const fs = require('fs');
const async = require("hbs/lib/async");
const path = require('path');
const fileUpload = require('express-fileupload');
const { send } = require("process");

const Locations = require('../../models/Locations');

const app = express()
app.use(fileUpload());

app.get('/', (req, res) => {
      res.render('maps/index');
});

app.get('/managemaps', (req, res) => {
      res.render('maps/managemaps');
});
app.post('/managemaps', async (req, res) => {
      try {
            console.log(req.files.map);
            var themap = req.files.map;
            console.log(req.body);
            var location=await Locations.findOne({
                  _id : req.body.locid
            });
            uploadPath=path.join(__dirname,'..','/public/map/'+location._id+'.jpg');
            await themap.mv(uploadPath);
            res.render('maps/managemaps');
      } catch (error) {
            console.log(error);
      }
});

app.get('/location/id',async(req,res)=>{
      try {
            var location=await Locations.findOne({
                  _id : req.query.id
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