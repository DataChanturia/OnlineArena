var mongoose = require("mongoose");

//SCHEMA SETUP
var challengeSchema = new mongoose.Schema({
    name: String,
    coverImage: String,
    imageId: String,
    description: String,
    duration: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    tags: [],
    requirements: {
        gender: String,
        age: String,
        firstName: String,
        lastName: String
    }
});

module.exports = mongoose.model("Challenge", challengeSchema);
