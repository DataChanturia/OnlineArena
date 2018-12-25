var express = require("express");
var router = express.Router();

var middleware = require("../middleware");

var Challenge = require("../models/challenge"),
    User = require("../models/user");

// == FILE UPLOAD SETUP -- START ==
var multer = require('multer');
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function(req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter });

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'dss6ilpjl',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
// == FILE UPLOAD SETUP -- END ==

// INDEX route -> shows all challenges
router.get("/", function(req, res) {
    // eval(require("locus"));
    var message = '';
    if (req.query.search) {
        const regex = new RegExp(req.query.search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
        var ended;
        if (req.query.search.includes("ended")) {
            ended = "true";
        }
        else if (req.query.search.includes("active")) {
            ended = "false";
        }
        var searchObj = [{ name: regex }, { ended: ended }, { tags: regex }];

        Challenge.find({ $or: searchObj }, function(err, allChallenges) {
            if (err) {
                req.flash("error", err.message);
                res.redirect("back");
            }
            else {
                if (allChallenges.length == 0) {
                    message = "No challenges found, please try again";
                }
                res.render("challenges/index", { challenges: allChallenges, message: message });
            }
        });
    }
    else {
        Challenge.find({}, function(err, allChallenges) {
            if (err) {
                req.flash("error", err.message);
                res.redirect("back");
            }
            else {
                res.render("challenges/index", { challenges: allChallenges, message: message });
            }
        });
    }
});

// CREATE route -> creates new challenge
router.post("/", middleware.isLoggedIn, upload.single('challenge[coverImage]'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        // add cloudinary url for the image to the challenge object under image property
        req.body.challenge.coverImage = result.secure_url;
        req.body.challenge.imageId = result.public_id;
        // add author to challenge
        req.body.challenge.author = {
            id: req.user._id,
            username: req.user.username
        };
        req.body.challenge.restrictions = {
            gender: req.body.gender,
            minAge: req.body.minAge,
            maxAge: req.body.maxAge,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            minParticipants: req.body.minParticipants
        };
        req.body.challenge.voteRestrictions = {
            gender: req.body.vgender
        };
        req.body.createDate = Date.now();
        Challenge.create(req.body.challenge, function(err, challenge) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            res.redirect('/challenges/' + challenge.id);
        });
    });
});

// NEW route -> shows form to create new challenge
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("challenges/new");
});

// SHOW route -> shows more info about challenge
router.get("/:id", function(req, res) {
    Challenge.findById(req.params.id).populate("comments").populate("participants.user").exec(function(err, foundChallenge) {
        if (err || !foundChallenge) {
            req.flash("error", "error finding challenge");
            return res.redirect("back");
        }
        else {
            // render show template with that challenge
            if (foundChallenge.ended == "true") {
                res.render("challenges/showStats", { challenge: foundChallenge });
            }
            else {
                res.render("challenges/show", { challenge: foundChallenge });
            }
        }
    });
});

// EDIT route -> edit challenge
router.get("/:id/edit", middleware.checkChallengeOwnership, function(req, res) {
    Challenge.findById(req.params.id, function(err, foundChallenge) {
        if (err || !foundChallenge || foundChallenge.ended == "true") {
            req.flash("error", "not allowed");
            return res.redirect("back");
        }
        else {
            res.render("challenges/edit", { challenge: foundChallenge });
        }
    });
});

// UPDATE route -> update challenge
router.put("/:id", middleware.checkChallengeOwnership, upload.single("challenge[coverImage]"), function(req, res) {
    Challenge.findById(req.params.id, async function(err, foundChallenge) {
        if (err) {
            req.flash('error', err.message);
            res.redirect('back');
        }
        else {
            var imageId, coverImage;
            if (req.file) {
                try {
                    await cloudinary.v2.uploader.destroy(foundChallenge.imageId);
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    imageId = result.public_id;
                    coverImage = result.secure_url;
                }
                catch (err) {
                    req.flash('error', err.message);
                    return res.redirect('back');
                }
            }
            foundChallenge.name = req.body.challenge.name;
            foundChallenge.description = req.body.challenge.description;
            foundChallenge.tags = req.body.challenge.tags;
            if (imageId) {
                foundChallenge.imageId = imageId;
                foundChallenge.coverImage = coverImage;
            }
            foundChallenge.save(function() {});

            req.flash("success", "Successfully Updated");
            res.redirect("/challenges/" + foundChallenge._id);
        }
    });
});

// DESTROY route -> deletes challenge
router.delete("/:id", middleware.checkChallengeOwnership, function(req, res) {
    Challenge.findById(req.params.id, async function(err, challenge) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect("back");
        }
        try {
            await cloudinary.v2.uploader.destroy(challenge.imageId);
            challenge.remove();
            req.flash('success', 'Challenge successfully deleted');
            res.redirect('/challenges');
        }
        catch (err) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect("back");
            }
        }
    });
});

// PARTICIPATE route - > redirect user to registration
router.get("/:id/participate", middleware.checkParticipationStatus, function(req, res) {
    Challenge.findById(req.params.id, function(err, foundChallenge) {
        if (err || !foundChallenge) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        return res.render('challenges/participate', { challenge: foundChallenge });
    });
});

// REGISTER route -> register user to challenge
router.post("/:id/participate/:userId", middleware.checkParticipationStatus, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        Challenge.findById(req.params.id, function(err, foundChallenge) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            else {
                foundChallenge.participants.push({ user: req.user.id, score: 0, image: result.secure_url, imageId: result.public_id });
                foundChallenge.save();
                req.flash('success', "You have successfully registered to challenge. Good luck!");
                res.redirect("/challenges/" + req.params.id);
            }
        });
    });
});

// VOTE route - > start voting
router.get("/:id/vote", middleware.checkVoteStatus, function(req, res) {
    Challenge.findById(req.params.id, function(err, foundChallenge) {
        if (err || !foundChallenge) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        var randNum1 = Math.floor(Math.random() * foundChallenge.participants.length);
        var randNum2 = Math.floor(Math.random() * foundChallenge.participants.length);
        while (foundChallenge.participants.length > 1 && randNum2 == randNum1) {
            randNum2 = Math.floor(Math.random() * foundChallenge.participants.length);
        }
        var chosen = Math.floor(Math.random() * 2);
        if (chosen == 0) {
            chosen = randNum1;
        }
        else {
            chosen = randNum2;
        }

        var tempParticipant = foundChallenge.participants[chosen];
        tempParticipant.score += 1;
        foundChallenge.participants[chosen] = tempParticipant;
        foundChallenge.save();

        return res.render('challenges/vote', { challenge: foundChallenge, randNum1: randNum1, randNum2: randNum2, chosen: chosen });
    });
});

// VOTE route -> add user's vote to data
router.post("/:id/vote/", middleware.checkVoteStatus, function(req, res) {
    Challenge.findById(req.params.id, function(err, foundChallenge) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        else {
            var prevParticipant = foundChallenge.participants[Number(req.body.chosen)];
            prevParticipant.score -= 1;
            foundChallenge.participants[Number(req.body.chosen)] = prevParticipant;

            var tempParticipant = foundChallenge.participants[Number(req.body.input)];
            tempParticipant.score += 1;
            foundChallenge.participants[Number(req.body.input)] = tempParticipant;

            foundChallenge.save();
            res.redirect("/challenges/" + foundChallenge._id + "/vote");
        }
    });
});

// SHOW ended challenge route -> shows info about ended challenge
router.get("/:id/showStats", function(req, res) {
    Challenge.findById(req.params.id).populate("participants.user").populate("comments").exec(function(err, foundChallenge) {
        if (err || !foundChallenge) {
            req.flash("error", "vote error encountered");
            return res.redirect("back");
        }
        else if (foundChallenge.ended == 'true') {
            return res.redirect("/challenges/" + req.params.id);
        }
        else {
            foundChallenge.ended = 'true';
            foundChallenge.save();
            const sortedWinners = foundChallenge.participants.sort(function(part1, part2) { return Number(part1.score) - Number(part2.score) });
            for (var i = sortedWinners.length - 1; i >= sortedWinners.length * 0.8 - 1; i--) {
                var placeText = '';
                var placePoints = 1;
                if (i == sortedWinners.length - 1) {
                    placeText = "1st place";
                    placePoints = 10 * foundChallenge.participants.length;
                }
                else if (i == sortedWinners.length - 2) {
                    placeText = "2nd place";
                    placePoints = 9 * foundChallenge.participants.length;
                }
                else if (i == sortedWinners.length - 3) {
                    placeText = "3rd place";
                    placePoints = 8 * foundChallenge.participants.length;
                }
                else if (i < sortedWinners.length - 3 && i > sortedWinners.length * 0.9) {
                    placeText = "Silver medal";
                    placePoints = 3 * foundChallenge.participants.length;
                }
                else {
                    placeText = "Bronze medal";
                    placePoints = 2 * foundChallenge.participants.length;
                }
                if (err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
                else {
                    var achievement = {};
                    achievement.challengeId = foundChallenge._id;
                    achievement.challengeName = foundChallenge.name;
                    achievement.pointsReceived = Number(placePoints);
                    achievement.award = placeText;
                    if (sortedWinners[i]) {
                        achievement.score = Number(sortedWinners[i].score);
                        sortedWinners[i].user.achievements.push(achievement);
                        sortedWinners[i].user.save();
                    }
                }
            }
            res.render("challenges/showStats", { challenge: foundChallenge });
        }
    });
});


//Follow/Unfollow challenge
router.get("/:id/follow", middleware.isLoggedIn, function(req, res) {
    User.findById(req.user._id, function(err, foundUser) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        else {
            const index = foundUser.following.indexOf(req.params.id);
            if (index < 0) {
                foundUser.following.push(req.params.id);
                foundUser.save();
            }
            else {
                foundUser.following.splice(index, 1);
                foundUser.save();
            }
            res.redirect("/challenges/" + req.params.id);
        }
    });
});

module.exports = router;
