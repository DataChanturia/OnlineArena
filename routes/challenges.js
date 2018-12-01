var express = require("express");
var router = express.Router();

var middleware = require("../middleware");

var Challenge = require("../models/challenge");

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
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Challenge.find({ $and: [{ name: regex }, { comments: regex }] }, function(err, allChallenges) {
            if (err) {
                console.log(err);
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
                console.log(err);
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
    Challenge.findById(req.params.id).populate("comments").exec(function(err, foundChallenge) {
        if (err || !foundChallenge) {
            console.log(err);
        }
        else {
            console.log(foundChallenge);
            // render show template with that challenge
            res.render("challenges/show", { challenge: foundChallenge });
        }
    });
});

// EDIT route -> edit challenge
// router.get("/:id/edit", middleware.checkChallengeOwnership, function(req, res) {
//     Challenge.findById(req.params.id, function(err, foundChallenge) {
//         if (err || !foundChallenge) {
//             console.log(err);
//         }
//         else {
//             res.render("challenges/edit", { challenge: foundChallenge });

//         }
//     });
// });

// UPDATE route -> update challenge
// router.put("/:id", middleware.checkChallengeOwnership, upload.single("challenge[coverImage]"), function(req, res) {
//     Challenge.findById(req.params.id, async function(err, foundChallenge) {
//         if (err) {
//             req.flash('error', err.message);
//             res.redirect('back');
//         }
//         else {
//             var imageId, coverImage;
//             if (req.file) {
//                 try {
//                     await cloudinary.v2.uploader.destroy(foundChallenge.imageId);
//                     var result = await cloudinary.v2.uploader.upload(req.file.path);
//                     imageId = result.public_id;
//                     coverImage = result.secure_url;
//                 }
//                 catch (err) {
//                     req.flash('error', err.message);
//                     return res.redirect('back');
//                 }
//             }
//             foundChallenge.name = req.body.challenge.name;
//             foundChallenge.duration = req.body.challenge.duration;
//             foundChallenge.description = req.body.challenge.description;
//             if (imageId) {
//                 foundChallenge.imageId = imageId;
//                 foundChallenge.coverImage = coverImage;
//             }
//             foundChallenge.save(function() {});

//             req.flash("success", "Successfully Updated");
//             res.redirect("/challenges/" + foundChallenge._id);
//         }
//     });
// });

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

function escapeRegex(text) {
    return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

module.exports = router;
