var mongoose = require("mongoose");

//SCHEMA SETUP
var challengeSchema = new mongoose.Schema({
    name: String,
    coverImage: String,
    imageId: String,
    description: String,
    type: String,
    startDate: Date,
    endDate: Date,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    tags: [{ type: String }],
    restrictions: {
        gender: String,
        minAge: String,
        maxAge: String,
        firstName: String,
        lastName: String,
        minParticipants: String
    }
});

module.exports = mongoose.model("Challenge", challengeSchema);
