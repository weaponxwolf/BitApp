require('./conn/mongo');
const express = require('express');
const app = express();
const port = 3000;
const hbs = require('hbs');
const bodyParser = require('body-parser');
const jwt=require('jsonwebtoken');


const HomeRoute=require('./routes/Home');
const FilesRoute=require('./routes/Files');
const Users = require('./models/Users');

app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({
      extended: true
}));
app.use(express.static('public'));
hbs.registerPartials(__dirname + '/views/partials');

app.use('/',HomeRoute);
app.use('/files',FilesRoute);

app.get('/', (req, res) => {
      res.render('index');
});

app.get('/login', (req, res) => {
      res.render('login');
});

app.post('/login', async (req, res) => {
      try {
            const User = await Users.findOne({
                  email: req.body.email,
                  password: req.body.password
            });
            if (User) {
                  var token = await jwt.sign({
                        email: User.email
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

app.listen(port, () => {
      console.log(`Example app listening on port ${port}`)
});