const express = require("express");
const jwt = require('jsonwebtoken');
const Sheets = require('../../models/Sheets');
const app = express();

app.get('/', (req, res) => {
      res.render('clubs/sheets/index');
});

app.get('/addnew', (req, res) => {
      res.render('clubs/sheets/addnewsheet');
});

app.get('/list', async (req, res) => {
      try {
            var token = await req.cookies.clubdata;
            var decoded = await jwt.verify(token, 'amitkumar');
            var getname = decoded.email;
            const sheets = await Sheets.find({
                  clubname: getname,
                  isDeleted: false
            });
            res.send(sheets);
      } catch (error) {
            console.log(error);
      }
});



app.post('/addnew', async (req, res) => {
      try {
            var token = await req.cookies.clubdata;
            var decoded = await jwt.verify(token, 'amitkumar');
            var getname = decoded.email;
            var sheet = {
                  name: req.body.name,
                  createdby: decoded.memberemail,
                  createdon: Date.now(),
                  clubname: getname,
                  createdbyname: decoded.membername,
                  isDeleted:false,
                  columns: [],
                  allrows: [
                        []
                  ]
            };
            var columns = req.body.column;
            columns.forEach(element => {
                  sheet.columns.push(element);
            });
            const newSheet = new Sheets(sheet);
            newSheet.save();
            res.redirect('/club/sheets');
      } catch (error) {
            console.log(error);
      }
});


app.post('/delete', async (req, res) => {
      try {
            const sheet = await Sheets.updateOne({
                  _id: req.body.sheetid
            }, {
                  isDeleted: true
            });
            res.send("DELETED");
      } catch (error) {
            console.log(error);
      }
});


app.post('/undodelete', async (req, res) => {
      try {
            const sheet = await Sheets.updateOne({
                  _id: req.body.sheetid
            }, {
                  isDeleted: false
            });
            res.send("DELETED");
      } catch (error) {
            console.log(error);
      }
});

app.get('/edit/:id', async (req, res) => {
      try {
            res.render('clubs/sheets/editsheet');
      } catch (error) {
            console.log(error);
      }
});

app.get('/data/:id', async (req, res) => {
      try {
            const sheets = await Sheets.findOne({
                  _id: req.params.id
            });
            res.send(sheets);
      } catch (error) {
            console.log(error);
      }
});

app.post('/save', async (req, res) => {
      try {
            var sheet = await Sheets.updateOne({
                  _id: req.body.sheetid
            }, {
                  columns: req.body.allcols,
                  allrows: req.body.tabledata
            });
            res.send("SAVED");
      } catch (error) {
            console.log(error);
      }
});

module.exports = app;