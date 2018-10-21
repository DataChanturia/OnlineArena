
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/online_arena")
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


//SCHEMA SETUP
var challengeSchema = new mongoose.Schema({
    name: String,
    coverImage: String
});

var Challenge = mongoose.model("Challenge", challengeSchema);

app.get("/", function(req, res){
    res.render("landing");
});

app.get("/challenges", function(req, res){
    Challenge.find({}, function(err, allChallenges){
       if(err){
           console.log(err);
       } else {
           res.render("challenges", {challenges: allChallenges});
       }
    });
});

app.get("/challenges/new", function(req, res){
    res.render("new");
});

app.post("/challenges", function(req, res){
    // get data from form + add to array
    var name = req.body.name;
    var coverImage = req.body.coverImage;
    var newChallenge = {name: name, coverImage: coverImage};
    Challenge.create(newChallenge, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            res.redirect("/challenges");
        }
    });
});


app.listen(process.env.PORT, process.env.IP, function() {
    console.log("OnlineArena Server Started!");
});