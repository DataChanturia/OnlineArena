
var express = require("express");
var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var challenges = [
        {name: "Beauty Challenge", coverImage: "https://marketplace.canva.com/MACQTpJkr5Q/1/0/thumbnail_large/canva-turquoise-pink-circles-beauty-parlor-cover-MACQTpJkr5Q.jpg"},
        {name: "Logo Challenge", coverImage: "https://cdn1.logocore.com/wp-content/uploads/2018/07/06171225/ckwdesigner-thirty-day-logo-challenge-2200x2200.jpg"},
        {name: "Presidentz", coverImage: "https://mediaplanet.azureedge.net/images/318/53018/social-2016-trump-hil.jpg"},
        {name: "Beauty Challenge", coverImage: "https://marketplace.canva.com/MACQTpJkr5Q/1/0/thumbnail_large/canva-turquoise-pink-circles-beauty-parlor-cover-MACQTpJkr5Q.jpg"},
        {name: "Logo Challenge", coverImage: "https://cdn1.logocore.com/wp-content/uploads/2018/07/06171225/ckwdesigner-thirty-day-logo-challenge-2200x2200.jpg"},
        {name: "Presidentz", coverImage: "https://mediaplanet.azureedge.net/images/318/53018/social-2016-trump-hil.jpg"}];
        

app.get("/", function(req, res){
    res.render("landing");
});

app.get("/challenges", function(req, res){
    res.render("challenges", {challenges: challenges});
});

app.get("/challenges/new", function(req, res){
    res.render("new");
});

app.post("/challenges", function(req, res){
    // get data from form + add to array
    var name = req.body.name;
    var coverImage = req.body.coverImage;
    var newChallenge = {name: name, coverImage: coverImage};
    challenges.push(newChallenge);
    // redirect to challenges
    res.redirect("/challenges");
});


app.listen(process.env.PORT, process.env.IP, function() {
    console.log("OnlineArena Server Started!");
});