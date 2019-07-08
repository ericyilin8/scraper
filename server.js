var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 8080;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true } );

mongoose.set('useFindAndModify', false);

// Routes

//attempt at article summary failed
//plan was to grab the first paragraph of an article and use that



//html routes
app.get("/", function(req, res) {
  res.sendFile(path.join(dirname, "index.html"));
 // res.render('index.html');
//  db.Example.findAll({}).then(function(dbExamples) {
   
  //});
});

// Render 404 page for any unmatched routes
app.get("*", function(req, res) {
 // res.render("404");
});


// A GET route for scraping the echoJS website
app.get("/scrape", function (req, res) {
  console.log('hi');
  // First, we grab the body of the html with axios
  axios.get("https://www.foxnews.com/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    //console.log(response.data);
    //console.log(response.data);
    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function (i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

        console.log(result.link);
        /*if(result.link.startsWith("http")){

        }else{
          result.link = "http:" + result.link;
        }*/

        db.Article.exists({ title: result.title }).then(function (response) {
          if (response) {

          } else {
            db.Article.create(result)
              .then(function (dbArticle) {
                // View the added result in the console
                console.log(dbArticle);
              })
              .catch(function (err) {
                // If an error occurred, log it
                //console.log(err);
              });

          }
          res.send("Scrape Complete");
        }).catch(function (err) {
          //console.log(err);
        })


      /*axios.get(result.link).then(function (response) {

        var $ = cheerio.load(response.data);

        result.summary = $("p").text();




      }).catch(function (error) {

       // console.log(error);
      })*/


    });

    // Send a message to the client
    //res.send("Scrape Complete");
  }).catch(function (error) {


  });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function (dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function (dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function (dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated article -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      db.Article.findOne({ _id: req.params.id }).then(function (article) {

        article.note.push(dbNote._id);
        //console.log(article.note);
        //if stored in variable push returns index..

        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: article.note }, { new: true });
      })
        .then(function (dbArticle) {
          // If we were able to successfully update an Article, send it back to the client
          console.log(dbArticle);
          res.json(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, send it to the client
          res.json(err);
        });

    })

});

app.delete("/deleteNote/:id", function(req,res){

  db.Note.findByIdAndDelete({_id: req.params.id}, function(response){

    res.json(response);

  }).catch(function(err){
    res.json(err);
    })
})

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
