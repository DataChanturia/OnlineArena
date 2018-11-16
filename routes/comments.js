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
                    // add username & id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
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

// Comments EDIT route
router.get("/:comment_id/edit", function(req, res) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if (err) {
            res.redirect("back");
            console.log(err);
        }
        else {
            res.render("comments/edit", { challenge_id: req.params.id, comment: foundComment });
        }
    })
});

// Comments UPDATE route
router.put("/:comment_id", function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if (err) {
            res.redirect("back");
            console.log(err);
        }
        else {
            res.redirect("/challenges/" + req.params.id);
        }
    });
});

// Comments DESTROY route
router.delete("/:comment_id", function(req, res) {
    // find comment by id and remove
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if (err) {
            console.log(err);
            res.redirect("back");
        }
        else {
            res.redirect("/challenges/" + req.params.id);
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
