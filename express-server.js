// *******************************************
// DATABASE SETUP ****************************
// *******************************************
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/test';
let quotes;
let topquote;

// *******************************************
// EXPRESS SETUP  ****************************
// *******************************************

const express = require('express');
const app = express();
const router = express.Router();
const path = require('path');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.set('json spaces', 2);

// *******************************************
// FRONT PAGE APPLICATION AND GREETING *******
// *******************************************

// index with helpful message
app.get('/', function(request, reply) {
  reply.send('Hello world from express');
});

// *******************************************
// REST API ROUTES ***************************
// *******************************************

app.use('/api', router);

// QUOTE LIST
router.route('/quotes')
  .get(function(request, reply) {
    quotes.find().sort({index:-1}).limit(10).toArray(function(err, results) {
      reply.send(results);
    });
  })
  .post(function(request, reply) {
    if(!request.body.hasOwnProperty('content')) {
      return reply.status(400).send('Error 400: Post syntax incorrect.');
    }
    topquote += 1;

    // Create the new quote object from the POST body
    const quoteBody = {
      "content" : request.body.content,
      "index" : topquote
    }

    // Add author to quoteBody if present
    if (request.body.hasOwnProperty('author')) {
      quoteBody["author"] = request.body.author;
    }

    // Store the new quote object in the database.
    quotes.save(quoteBody, function(err, result) {
      if(!err && result){
        return reply.status(201).send({"index":topquote});
      } else {
        return reply.status(500).send({"Error" : "The quote could not be saved to the database."})
      }
    })
  });

// RANDOM QUOTE FROM THE DATABASE
router.route('/quotes/random')
  .get(function(request, reply) {
    const randomIndex = Math.floor(Math.random() * topquote);
    quotes.findOne({"index" : randomIndex}, function(err, results) {
      reply.send(results);
    });
  });

// SINGLE QUOTE
router.route('/quotes/:index')
  .get(function(request, reply) {
    const index = parseInt(request.params.index);
    quotes.findOne({index:index}, function(err, results){
      reply.send(results);
    })
  })
  .put(function(request, reply) {
    const index = parseInt(request.params.index);
    const query = {"index" : index};

    if(!(request.body.hasOwnProperty('content') || request.body.hasOwnProperty('author'))) {
      return reply.status(400).send('Error 400: Put syntax incorrect.');
    }

    // Create the new quote object from the POST body
    const quoteBody = {
      "content" : request.body.content,
      "index" : index
    }

    // Add author to quoteBody if present
    if (request.body.hasOwnProperty('author')) {
      quoteBody["author"] = request.body.author;
    }

    quotes.findOneAndUpdate(query, quoteBody, {upsert:true}, function(err, results) {
      return reply.status(201).send({"index":index});
    })
  })
  .delete(function(request, reply) {
    const index = parseInt(request.params.index);

    quotes.findOneAndDelete({index}, function(err, results){
      return reply.status(204).send();
    })
  })


// ********************************************
// SERVERS ************************************
// ********************************************

MongoClient.connect(url, function(err, database)  {
    if (err) return console.log(err);
    console.log("Connected successfully to database server");
    quotes = database.collection('quotes');

    // Find the largest index for creating new quotes
    quotes.find().sort({"index": -1}).limit(1).toArray((err, quote) => {
      topquote = quote[0]["index"]
    });

    app.listen(8080, "0.0.0.0", function() {
      console.log('Express is listening to http://0.0.0.0:8080');
    })
})
