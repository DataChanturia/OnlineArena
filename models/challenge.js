var mongoose = require("mongoose");

//SCHEMA SETUP
var challengeSchema = new mongoose.Schema({
    name: String,
    coverImage: String,
    description: String,
    duration: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }]
});

module.exports = mongoose.model("Challenge", challengeSchema);
