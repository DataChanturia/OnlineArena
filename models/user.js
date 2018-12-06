var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

//SCHEMA SETUP
var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    avatar: String,
    email: String,
    firstName: String,
    lastName: String,
    birthYear: String,
    gender: String,
    achievements: [{
        challengeId: String,
        challengeName: String,
        score: Number,
        pointsReceived: Number,
        award: String
    }]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
