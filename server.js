var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoscraper";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

app.get("/scrape", function (req, res) {
    scrapeNow();
    res.send("Scrape Starting");
});

var scrapeNow = function () {
    axios.get("https://www.npr.org/sections/news/").then(function (response) {
        var $ = cheerio.load(response.data);

        $("article").each(function (i, element) {
            var result = {};

            result.title = $(element)
                .find("h2")
                .children("a")
                .text();
            result.link = $(element)
                .find("h2")
                .children("a")
                .attr("href");
            result.teaser = $(element)
                .find(".teaser")
                .text();
            result.photo = $(element)
                .find("img")
                .attr("src");

            console.log("Creating Article", result);
            if (!result.title || !result.link) {
                console.log("Skipping Article");
                return;
            }

            var filter = { link: result.link }
            var options = { upsert: true }
            db.Article.findOneAndUpdate(filter, result, options)

                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    console.log(err);
                });
        });
    });
};

app.get("/articles", function (req, res) {
    db.Article.find({})
        .then(function (dbArticles) {
            res.json(dbArticles);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.get("/articles/:id", function (req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.post("/articles/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.get("/articles/delete", function (req, res) {
    db.Article.deleteMany({})
        .then(function (dbNews) {
            res.json(dbNews);
        })
        .catch(function (err) {
            res.json(err);
        })
    console.log("Deleting")
});

app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
    scrapeNow();
});






