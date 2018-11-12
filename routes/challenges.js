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
router.post("/", isLoggedIn, function(req, res) {
    // get data from form + add to array
    var name = req.body.name;
    var coverImage = req.body.coverImage;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newChallenge = { name: name, coverImage: coverImage, description: desc, author: author };
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
router.get("/new", isLoggedIn, function(req, res) {
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

// EDIT route -> edit challenge
router.get("/:id/edit", function(req, res) {
    Challenge.findById(req.params.id, function(err, foundChallenge) {
        if (err) {
            console.log(err);
            res.redirect("/challenges")
        }
        else {
            res.render("challenges/edit", { challenge: foundChallenge });
        }
    });
});

// UPDATE route -> update challenge
router.put("/:id", function(req, res) {
    Challenge.findByIdAndUpdate(req.params.id, req.body.challenge, function(err, updatedChallenge) {
        if (err) {
            console.log(err);
            res.redirect("/challenges");
        }
        else {
            res.redirect("/challenges/" + req.params.id);
        }
    });
});

// DESTROY route -> deletes challenge
router.delete("/:id", function(req, res) {
    Challenge.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            console.log(err);
            res.redirect("/challenges");
        }
        else {
            res.redirect("/challenges");
        }
    });
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

module.exports = router;
