var middlewareObj = {};

var Challenge = require("../models/challenge"),
    Comment = require("../models/comment");

middlewareObj.checkChallengeOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {
        Challenge.findById(req.params.id, function(err, foundChallenge) {
            if (err || !foundChallenge) {
                console.log(err);
                req.flash("error", "Sorry something went wrong...");
                res.redirect("back");
            }
            else {
                if (foundChallenge.author.id.equals(req.user._id)) {
                    next();
                }
                else {
                    req.flash("error", "You don't have a permission");
                    res.redirect("back");
                }
            }
        });
    }
    else {
        req.flash("error", "You need to be logged in");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if (err) {
                console.log(err || !foundComment);
                res.redirect("back");
            }
            else {
                if (foundComment.author.id.equals(req.user._id)) {
                    next();
                }
                else {
                    req.flash("error", "You don't have a permission");
                    res.redirect("back");
                }
            }
        });
    }
    else {
        req.flash("error", "You need to be logged in");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please login first");
    res.redirect("/login");
};

module.exports = middlewareObj;
