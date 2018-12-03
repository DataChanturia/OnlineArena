var express = require("express"),
    passport = require("passport");

var router = express.Router();

var middleware = require("../middleware");
var User = require("../models/user"),
    Challenge = require("../models/challenge");

router.get("/", function(req, res) {
    res.render("landing");
});

// ================
// AUTH ROUTES  ===
// ================

// show register form
router.get("/register", function(req, res) {
    res.render("users/register");
});

// handle sign up logic
router.post("/register", function(req, res) {
    var newUser = new User({
        username: req.body.username,
        avatar: req.body.avatar,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: req.body.gender,
        birthYear: (parseInt((new Date()).getFullYear(), 10) - parseInt(req.body.age, 10)).toString()
    });
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
    res.render("users/login", { referer: req.headers.referer });
});

// handle login logic
router.post("/login", passport.authenticate("local", { failureRedirect: "/login" }), function(req, res) {
    if (req.body.referer.includes("/login")) {
        return res.redirect("/challenges");
    }
    else {
        res.redirect(req.body.referer);
    }
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

// EDIT route -> edit user profile
router.get("/users/:id/edit", middleware.isLoggedIn, function(req, res) {
    User.findById(req.user._id, function(err, foundUser) {
        if (err || !foundUser) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        else {
            res.render("users/edit", { user: foundUser });

        }
    });
});

// user UPDATE route
router.put("/users/:id", middleware.isLoggedIn, function(req, res) {
    // eval(require("locus"));
    User.findByIdAndUpdate(req.user._id, req.body.user, function(err, updatedUser) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        else {
            res.redirect("/users/" + req.user._id);
        }
    });
});


module.exports = router;
