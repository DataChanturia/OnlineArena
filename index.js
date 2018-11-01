//======================================== variable section
var express = require("express");
var app = express();

var mongoose = require("mongoose");
var bodyParser = require("body-parser");

//======================================== DB section
var Challenge = require("./models/challenge"),
    Comment = require("./models/comment");
// User = require("./models/user");

var seedDB = require("./seeds");
seedDB();

//======================================== setup section
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect("mongodb://localhost/online_arena");
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"))

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
            res.render("challenges/index", { challenges: allChallenges });
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
    res.render("challenges/new");
});

// SHOW route -> shows more info about challenge
app.get("/challenges/:id", function(req, res) {
    Challenge.findById(req.params.id).populate("comments").exec(function(err, foundChallenge) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(foundChallenge);
            // render show template with that challenge
            res.render("challenges/show", { challenge: foundChallenge });
        }
    });
});

// ===================
// == COMMENT ROUTES =
// ===================
app.get("/challenges/:id/comments/new", function(req, res) {
    // find challenge by ID
    Challenge.findById(req.params.id, function(err, challenge) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("comments/new", { challenge: challenge });
        }
    });
});

app.post("/challenges/:id/comments", function(req, res) {
    // lookup challenge using ID
    Challenge.findById(req.params.id, function(err, challenge) {
        if (err) {
            console.log(err);
            res.redirect("/challenges");
        }
        else {
            // create new comment
            // connect new comment to challenge
            Comment.create(req.body.comment, function(err, comment) {
                if (err) {
                    console.log(err);
                }
                else {
                    challenge.comments.push(comment);
                    challenge.save();
                    // redirect to challenge show page
                    res.redirect("/challenges/" + challenge._id);
                }
            });
            res.render
        }
    });
});

//======================================== run section
// SERVER START LISTENING TO IP/PORT
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("OnlineArena Server Started!");
});
