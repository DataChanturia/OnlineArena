var middlewareObj = {};

var Challenge = require("../models/challenge"),
    Comment = require("../models/comment"),
    User = require("../models/user");

var functions = require("../functions");

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
        res.redirect("/login");
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
        res.redirect("/login");
    }
};

middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please login first");
    res.redirect("/login");
};

middlewareObj.checkParticipationStatus = function(req, res, next) {
    if (req.isAuthenticated()) {
        Challenge.findById(req.params.id, function(err, foundChallenge) {
            if (err) {
                console.log(err || !foundChallenge);
                res.redirect("back");
            }
            else {
                if (foundChallenge.endDate.getTime() < (new Date()).getTime() ||
                    (foundChallenge.startDate.getTime() < (new Date()).getTime() && foundChallenge.type == "preregister")) {
                    req.flash("error", "Registration to challenge ended, can not register");
                    res.redirect("back");
                }
                else {
                    if (foundChallenge.participants.length == 0 || !functions.findIndexInData(foundChallenge.participants, "user", req.user.id)) {
                        User.findById(req.user.id, function(err, foundUser) {
                            if (err) {
                                console.log(err || !foundChallenge);
                                res.redirect("back");
                            }
                            else {
                                var thisYear = (new Date()).getFullYear();
                                if (thisYear - foundUser.birthYear >= foundChallenge.restrictions.minAge &&
                                    thisYear - foundUser.birthYear <= foundChallenge.restrictions.maxAge &&
                                    foundUser.firstName != foundChallenge.restrictions.firstName &&
                                    foundUser.lastName != foundChallenge.restrictions.lastName &&
                                    (foundChallenge.restrictions.gender == "both" || foundUser.gender == foundChallenge.restrictions.gender)) {
                                    next();
                                }
                                else {
                                    req.flash("error", "Restrictions do not allow you to participate");
                                    res.redirect("back");
                                }
                            }
                        });
                    }
                    else {
                        req.flash("error", "Not allowed");
                        res.redirect("back");
                    }
                }
            }
        });
    }
    else {
        req.flash("error", "You need to be logged in");
        res.redirect("/login");
    }
};

middlewareObj.checkVoteStatus = function(req, res, next) {
    if (req.isAuthenticated()) {
        Challenge.findById(req.params.id, function(err, foundChallenge) {
            if (err) {
                console.log(err || !foundChallenge);
                res.redirect("back");
            }
            else {
                if (foundChallenge.startDate.getTime() > (new Date()).getTime() ||
                    foundChallenge.endDate.getTime() < (new Date()).getTime()) {
                    req.flash("error", "Challenge is not in active mode, you can not vote");
                    return res.redirect("back");
                }
                else {
                    if (foundChallenge.participants.length >= foundChallenge.restrictions.minParticipants) {
                        next();
                    }
                    else {
                        req.flash("error", "Not allowed");
                        return res.redirect("back");
                    }
                }
            }
        });
    }
    else {
        req.flash("error", "You need to be logged in");
        res.redirect("/login");
    }
};

module.exports = middlewareObj;
