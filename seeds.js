var mongoose = require("mongoose");
var Challenge = require("./models/challenge"),
    Comment = require("./models/comment");

var data = [{
        name: "Logo Challenge",
        coverImage: "https://i.ytimg.com/vi/hSG5FxpvF5E/maxresdefault.jpg",
        description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)."
    },
    {
        name: "Beauty Challenge",
        coverImage: "http://www.kilkennycbt.com/wp-content/uploads/2017/10/Full-Time-Beauty-Therapy-Course.jpg",
        description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)."
    },
    {
        name: "Elections 2018",
        coverImage: "https://wethersfieldct.gov/images/election%202018.png",
        description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)."
    }
];

function seedDB() {
    // remove all challenges
    Challenge.deleteMany({}, function(err) {
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
