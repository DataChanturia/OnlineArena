
var express = require("express");
var app = express();

app.set("view engine", "ejs")


app.get("/", function(req, res){
    res.render("landing");
});

app.get("/challenges", function(req, res){
    var challenges = [
        {name: "Beauty Challenge", coverImage: "https://marketplace.canva.com/MACQTpJkr5Q/1/0/thumbnail_large/canva-turquoise-pink-circles-beauty-parlor-cover-MACQTpJkr5Q.jpg"},
        {name: "Logo Challenge", coverImage: "https://cdn1.logocore.com/wp-content/uploads/2018/07/06171225/ckwdesigner-thirty-day-logo-challenge-2200x2200.jpg"},
        {name: "Presidentz", coverImage: "https://mediaplanet.azureedge.net/images/318/53018/social-2016-trump-hil.jpg"}];
        
    res.render("challenges", {challenges: challenges});
});


app.listen(process.env.PORT, process.env.IP, function() {
    console.log("OnlineArena Server Started!");
});