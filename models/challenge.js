var mongoose = require("mongoose");

//SCHEMA SETUP
var challengeSchema = new mongoose.Schema({
    name: String,
    coverImage: String,
    description: String
});

module.exports = mongoose.model("Challenge", challengeSchema);
