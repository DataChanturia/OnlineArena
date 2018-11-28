//======================================== variable section
var express = require("express");
var app = express();

var mongoose = require("mongoose");
var flash = require("connect-flash");
var bodyParser = require("body-parser");

var passport = require("passport"),
    LocalStrategy = require("passport-local");

var commentRoutes = require("./routes/comments"),
    challengeRoutes = require("./routes/challenges"),
    indexRoutes = require("./routes/index");

var methodOverride = require("method-override");

//======================================== DB section
var User = require("./models/user");

// var seedDB = require("./seeds");
// seedDB();

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
app.use(methodOverride("_method"));
app.use(flash());

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

//======================================== routing section
app.use(indexRoutes);
app.use("/challenges", challengeRoutes);
app.use("/challenges/:id/comments", commentRoutes);


//======================================== run section
// SERVER START LISTENING TO IP/PORT
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("OnlineArena Server Started!");
});
