/* Showing Mongoose's "Populated" Method (18.3.8)
 * INSTRUCTOR ONLY
 * =============================================== */

// REQUIRED DEPENDENCIES
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
// Notice: Our scraping tools are prepared, too
var request = require('request');
var cheerio = require('cheerio');

// use morgan and bodyparser with our app
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));


// make public a static dir
app.use(express.static('public'));

// Setup for Heroku
var PORT = process.env.PORT || 3000;

// Require handlebars and set view engine so that we can use given front-end
var expressHandlebars = require('express-handlebars');
app.engine('handlebars', expressHandlebars({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');


// Database configuration with mongoose
//mongoose.connect('mongodb://localhost/week18day3mongoose');
mongoose.connect('mongodb://heroku_8k5vjgfw:5npfpg9cg3n5b5guoo2g7724lo@ds053160.mlab.com:53160/heroku_8k5vjgfw');
var db = mongoose.connection;

// show any mongoose errors
db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

// once logged in to the db through mongoose, log a success message
db.once('open', function() {
  console.log('Mongoose connection successful.');
});

// And we bring in our Note and Article models
var Note = require('./models/Note.js');
var Article = require('./models/Article.js');


// Routes
// ======

// Simple index route
app.get('/', function(req, res) {
  //render home.handlebars
  res.render('home');
});

// Changed to a POST request in order to scrape NYT.
app.post('/fetch', function(req, res) {
	// first, we grab the body of the html with request
  request('http://www.nytimes.com/', function(error, response, html) {
  	// then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // now, we grab every h2 within an article tag, and do the following:

    // altered the locator to match that of NYT website. 
    $('.theme-summary').each(function(i, element) {

			// save an empty result object
			var result = {};

			// add the text and href of every link,
			// and save them as properties of the result obj
			// altered this-->element, and changed the locators to match that of NYT.
			result.articleTitle = $(element).find('.story-heading').find('a').text();
			result.articleSummary = $(element).find('.summary').text();

			// using our Article model, create a new entry.
			// Notice the (result):
			// This effectively passes the result object to the entry (and the title and link)
			var entry = new Article (result);

			// now, save that entry to the db
			entry.save(function(err, doc) {
				// log any errors
			  if (err) {
			    console.log(err);
			  }
			  // or log the doc
			  else {
			    console.log(doc);
			  }
			});



    });
  });
  // tell the browser that we finished scraping the text.
  res.send("Scrape Complete");
});

// the scraped articles 
app.get('/check', function(req, res){
	// grab every doc in the Articles array
	Article.find({}, function(err, doc){
		// log any errors
		if (err){
			console.log(err);
		}
		// or send the doc to the browser as a json object
		else {
			res.json(doc);
		}
	});
});

// POST function to save articles.
app.post('/save', function(req, res){

	// create a new note and pass the req.body to the entry.
	var newNote = new Note(req.body);

	// and save the new note the db
	newNote.save(function(err, doc){
		// log any errors
		if(err){
			console.log(err);
		}
		// otherwise
		else {
			//send doc, which is the data of the new note
			res.send(doc);
		}
	});
});

// grabes all saved notes 
app.post('/gather', function(req, res){

	// grab every doc in the Note array 
	Note.find({'id': req.body.id}, function(err, doc){
		// log any errors
		if (err){
			console.log(err);
		}
		// or send the doc to the browser as a json object
		else {
			//console.log(doc)
			res.json(doc);
		}
	});
});


// deletes the notes using its id
app.delete('/delete', function(req, res){

	Note.remove({'id': req.body.id})
	// execute the above query
	.exec(function(err, doc){
		// log any errors
		if (err){
			console.log(err);
		} else {
			// or send the document to the browser
			//console.log(doc)
			res.send(doc);
		}
	});	
});

// listen on port 3000
// added process.env.PORT above to make it ready for Heroku
app.listen(PORT, function() {
  console.log('App running on port 3000!');
});