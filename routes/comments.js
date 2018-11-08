var express = require("express");
var router = express.Router({ mergeParams: true });

var Challenge = require("../models/challenge"),
    Comment = require("../models/comment");

router.get("/new", isLoggedIn, function(req, res) {
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

router.post("/", isLoggedIn, function(req, res) {
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

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

module.exports = router;
