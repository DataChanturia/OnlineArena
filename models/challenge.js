var mongoose = require("mongoose");

//SCHEMA SETUP
var challengeSchema = new mongoose.Schema({
    name: String,
    coverImage: String,
    description: String,
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }]
});

module.exports = mongoose.model("Challenge", challengeSchema);
