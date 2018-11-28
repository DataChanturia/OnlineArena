var express = require("express");
var router = express.Router({ mergeParams: true });

var middleware = require("../middleware");

var Challenge = require("../models/challenge"),
    Comment = require("../models/comment");

router.get("/new", middleware.isLoggedIn, function(req, res) {
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

router.post("/", middleware.isLoggedIn, function(req, res) {
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
                    req.flash("error", "Sorry something went wrong...");
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
                    req.flash("success", "Successfully added comment");
                    res.redirect("/challenges/" + challenge._id);
                }
            });
        }
    });
});

// Comments EDIT route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if (err) {
            res.redirect("back");
            console.log(err);
        }
        else {
            res.render("comments/edit", { challenge_id: req.params.id, comment: foundComment });
        }
    });
});

// Comments UPDATE route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
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
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    // find comment by id and remove
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if (err) {
            console.log(err);
            res.redirect("back");
        }
        else {
            req.flash("success", "Comment deleted");
            res.redirect("/challenges/" + req.params.id);
        }
    });
});

module.exports = router;
