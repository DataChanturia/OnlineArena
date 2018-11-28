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
    Challenge.find({}, function(err, allChallenges) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("challenges/index", { challenges: allChallenges });
        }
    });
});

// CREATE route -> creates new challenge
router.post("/", middleware.isLoggedIn, upload.single('coverImage'), function(req, res) {
    cloudinary.uploader.upload(req.file.path, function(result) {
        // add cloudinary url for the image to the campground object under image property
        req.body.challenge.coverImage = result.secure_url;
        // add author to challenge
        req.body.challenge.author = {
            id: req.user._id,
            username: req.user.username
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
router.get("/:id/edit", middleware.checkChallengeOwnership, function(req, res) {
    Challenge.findById(req.params.id, function(err, foundChallenge) {
        if (err || !foundChallenge) {
            console.log(err);
        }
        else {
            res.render("challenges/edit", { challenge: foundChallenge });

        }
    });
});

// UPDATE route -> update challenge
router.put("/:id", middleware.checkChallengeOwnership, function(req, res) {
    Challenge.findByIdAndUpdate(req.params.id, req.body.challenge, function(err, updatedChallenge) {
        if (err) {
            console.log(err || !updatedChallenge);
            res.redirect("/challenges");
        }
        else {
            res.redirect("/challenges/" + req.params.id);
        }
    });
});

// DESTROY route -> deletes challenge
router.delete("/:id", middleware.checkChallengeOwnership, function(req, res) {
    Challenge.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            console.log(err);
            res.redirect("/challenges");
        }
        else {
            res.redirect("/challenges");
        }
    });
});

module.exports = router;
