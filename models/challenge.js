var mongoose = require("mongoose");

//SCHEMA SETUP
var challengeSchema = new mongoose.Schema({
    name: String,
    coverImage: String,
    imageId: String,
    description: String,
    type: String,
    createDate: { type: Date, default: Date.now },
    startDate: Date,
    endDate: Date,
    ended: { type: String, default: "false" },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    participants: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        score: { type: Number, default: 0 },
        image: String,
        imageId: String
    }],
    tags: { type: String, default: "" },
    restrictions: {
        gender: String,
        minAge: Number,
        maxAge: Number,
        firstName: String,
        lastName: String,
        minParticipants: Number
    },
    voteRestrictions: {
        gender: String
    }
});

module.exports = mongoose.model("Challenge", challengeSchema);
