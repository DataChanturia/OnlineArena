var mongoose = require("mongoose");
var Challenge = require("./models/challenge"),
    Comment = require("./models/comment");

var data = [{
        name: "Logo Challenge",
        coverImage: "https://i.ytimg.com/vi/hSG5FxpvF5E/maxresdefault.jpg",
        description: "MC vs Cola vs Wendy's and other logos.."
    },
    {
        name: "Beauty Challenge",
        coverImage: "http://www.kilkennycbt.com/wp-content/uploads/2017/10/Full-Time-Beauty-Therapy-Course.jpg",
        description: "Mirror mirror, tell me who is the most beautiful woman in the world.."
    },
    {
        name: "Elections 2018",
        coverImage: "https://wethersfieldct.gov/images/election%202018.png",
        description: "Vote for future son!"
    }
];

function seedDB() {
    // remove all challenges
    Challenge.remove({}, function(err) {
        if (err) {
            console.log(err);
        }
        console.log("removed challenges!");

        // add some challenges
        data.forEach(function(seed) {
            Challenge.create(seed, function(err, challenge) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("added new campground");

                    // add some comments
                    Comment.create({ text: "This challenge looks awesome!", author: "Nemo" }, function(err, comment) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            challenge.comments.push(comment);
                            challenge.save();
                            console.log("created new comment");
                        }
                    });
                }
            });
        });
    });
}

module.exports = seedDB;
