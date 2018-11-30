var express = require("express");
var router = express.Router();
var passport = require("passport");

var User = require("../models/user");
var Challenge = require("../models/challenge")

router.get("/", function(req, res) {
    res.render("landing");
});

// ================
// AUTH ROUTES  ===
// ================

// show register form
router.get("/register", function(req, res) {
    res.render("register");
});

// handle sign up logic
router.post("/register", function(req, res) {
    var newUser = new User({ username: req.body.username, avatar: req.body.avatar, email: req.body.email });
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        else {
            passport.authenticate("local")(req, res, function() {
                req.flash("success", "Welcome to OnlineArena " + user.username);
                res.redirect("/challenges");
            });
        }
    });
});

// show login form
router.get("/login", function(req, res) {
    res.render("login");
});

// handle login logic
router.post("/login", passport.authenticate("local", {
    successRedirect: "/challenges",
    failureRedirect: "/login"
}), function(req, res) {
    //nothing in callback
});

// logout route
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged you out");
    res.redirect("/challenges");
});

// ================
// USER ROUTES  ===
// ================

// USER - SHOW route
router.get('/users/:id', function(req, res) {
    User.findById(req.params.id, function(err, foundUser) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Challenge.find().where('author.id').equals(foundUser._id).exec(function(err, foundChallenges) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            res.render("users/show", { user: foundUser, challenges: foundChallenges });
        });
    });
});

module.exports = router;
