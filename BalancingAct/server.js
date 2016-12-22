// setup Express
var mongo = require('mongodb');
var express = require('express');
var app = new express();
var sass = require('node-sass-middleware');
var bodyParser = require('body-parser');

app.use(
   sass({
       src: __dirname + '/static',
       dest: __dirname + '/web',
       debug: true,
   })
);


app.use(bodyParser.json());
app.use(express.static('web/'));
app.use('/images', express.static('web/images'));

app.set('port', (process.env.PORT || 5000));

// start the server
var server = app.listen(app.get('port'), function () {
  console.log("Started server on port: " + app.get('port'));
});

module.exports = app;

var commentAPI = require('./api/experienceAPI.js');
