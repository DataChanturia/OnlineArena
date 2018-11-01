//======================================== variable section
var express = require("express");
var app = express();

var mongoose = require("mongoose");
var bodyParser = require("body-parser");

var Challenge = require("./models/challenge"),
    Comment = require("./models/comment"),
    User = require("./models/user");


//======================================== setup section
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect("mongodb://localhost/online_arena");
app.set("view engine", "ejs");


//======================================== routing section
// ROUTING GOES HERE
app.get("/", function(req, res) {
    res.render("landing");
});

// INDEX route -> shows all challenges
app.get("/challenges", function(req, res) {
    Challenge.find({}, function(err, allChallenges) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("index", { challenges: allChallenges });
        }
    });
});

// CREATE route -> creates new challenge
app.post("/challenges", function(req, res) {
    // get data from form + add to array
    var name = req.body.name;
    var coverImage = req.body.coverImage;
    var desc = req.body.description;
    var newChallenge = { name: name, coverImage: coverImage, description: desc };
    Challenge.create(newChallenge, function(err, newlyCreated) {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect("/challenges");
        }
    });
});

// NEW route -> shows form to create new challenge
app.get("/challenges/new", function(req, res) {
    res.render("new");
});

// SHOW route -> shows more info about challenge
app.get("/challenges/:id", function(req, res) {
    Challenge.findById(req.params.id, function(err, foundChallenge) {
        if (err) {
            console.log(err);
        }
        else {
            // render show template with that challenge
            res.render("show", { challenge: foundChallenge });
        }
    });
});

//======================================== run section
// SERVER START LISTENING TO IP/PORT
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("OnlineArena Server Started!");
});
