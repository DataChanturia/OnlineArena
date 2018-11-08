//======================================== variable section
var express = require("express");
var app = express();

var mongoose = require("mongoose");
var bodyParser = require("body-parser");

var passport = require("passport"),
    LocalStrategy = require("passport-local");

//======================================== DB section
var Challenge = require("./models/challenge"),
    Comment = require("./models/comment"),
    User = require("./models/user");

var seedDB = require("./seeds");
seedDB();

//======================================== passport configuration section
app.use(require("express-session")({
    secret: "What the heck is express-session?",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
// .authenticate() -> we have with passportLocalMongoose 
passport.use(new LocalStrategy(User.authenticate()));
// same for .serializeUser()/.deserializeUser() -> method
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//======================================== setup section
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect("mongodb://localhost/online_arena", { useNewUrlParser: true });
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

//======================================== routing section
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
// COMMENT ROUTES  ===
// ===================

app.get("/challenges/:id/comments/new", isLoggedIn, function(req, res) {
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

app.post("/challenges/:id/comments", isLoggedIn, function(req, res) {
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

// ================
// AUTH ROUTES  ===
// ================

// show register form
app.get("/register", function(req, res) {
    res.render("register");
});

// handle sign up logic
app.post("/register", function(req, res) {
    var newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/challenges");
            });
        }
    });
});

// show login form
app.get("/login", function(req, res) {
    res.render("login");
});

// handle login logic
app.post("/login", passport.authenticate("local", {
    successRedirect: "/challenges",
    failureRedirect: "/login"
}), function(req, res) {
    //nothing in callback
});

// logout route
app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/challenges");
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

//======================================== run section
// SERVER START LISTENING TO IP/PORT
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("OnlineArena Server Started!");
});
