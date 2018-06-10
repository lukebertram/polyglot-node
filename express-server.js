// *******************************************
// DATABASE SETUP ****************************
// *******************************************
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/test'
var quotes
var topquote

// *******************************************
// EXPRESS SETUP  ****************************
// *******************************************

var express = require('express');
var app = express();
var router = express.Router();    
var path = require('path');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.set('json spaces', 2);

// *******************************************
// FRONT PAGE APPLICATION AND GREETING *******
// *******************************************

// index with helpful message
app.get('/', function(request, reply) {
  reply.send('Hello world from express');
});

// ********************************************
// SERVERS ************************************
// ********************************************

MongoClient.connect(url, function(err, database)  {
    if (err) return console.log(err)
    console.log("Connected successfully to database server");
    quotes = database.collection('quotes')

    // Find the largest index for creating new quotes
    quotes.find().sort({"index": -1}).limit(1).toArray((err, quote) => {
      topquote = quote[0]["index"]
    })

    app.listen(8080, "0.0.0.0", function() {
      console.log('Express is listening to http://0.0.0.0:8080');
    })
})


