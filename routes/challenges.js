var express = require("express");
var router = express.Router();

var Challenge = require("../models/challenge");

// INDEX route -> shows all challenges
router.get("/", function(req, res) {
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
router.post("/", function(req, res) {
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
router.get("/new", function(req, res) {
    res.render("challenges/new");
});

// SHOW route -> shows more info about challenge
router.get("/:id", function(req, res) {
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

module.exports = router;
