var express = require("express"),
    passport = require("passport");

var router = express.Router();

var middleware = require("../middleware");
var User = require("../models/user"),
    Challenge = require("../models/challenge");

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

// router.get("/", function(req, res) {
//     res.render("landing");
// });
router.get("/", function(req, res) {
    res.redirect("/challenges");
});

// ================
// AUTH ROUTES  ===
// ================

// show register form
router.get("/register", function(req, res) {
    res.render("users/register");
});

// handle sign up logic
router.post("/register", upload.single('avatar'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        var newUser = new User({
            username: req.body.username,
            avatar: result.secure_url,
            avatarId: result.public_id,
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            gender: req.body.gender,
            birthYear: (parseInt((new Date()).getFullYear(), 10) - parseInt(req.body.age, 10)).toString()
        });
        User.register(newUser, req.body.password, function(err, user) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("/register");
            }
            else {
                passport.authenticate("local")(req, res, function() {
                    req.flash("success", "Welcome to OnlineArena " + user.username);
                    res.redirect("/challenges");
                });
            }
        });
    });
});

// show login form
router.get("/login", function(req, res) {
    res.render("users/login", { referer: req.headers.referer });
});

// handle login logic
router.post("/login", passport.authenticate("local", { failureRedirect: "/login" }), function(req, res) {
    if (req.body.referer.includes("/login")) {
        return res.redirect("/challenges");
    }
    else {
        res.redirect(req.body.referer);
    }
});

// logout route
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged you out");
    res.redirect("/challenges");
});

// ================
// USER ROUTES  ===
// ================

// USER - SHOW route
router.get('/users/:id', function(req, res) {
    User.findById(req.params.id, function(err, foundUser) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Challenge.find().where('author.id').equals(foundUser._id).exec(function(err, foundChallenges) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            Challenge.find({ _id: { $in: foundUser.following } }, function(err, followedChallenges) {
                if (err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
                res.render("users/show", { user: foundUser, challenges: foundChallenges, followedChallenges: followedChallenges });
            });
        });
    });
});

// EDIT route -> edit user profile
router.get("/users/:id/edit", middleware.isLoggedIn, function(req, res) {
    User.findById(req.user._id, function(err, foundUser) {
        if (err || !foundUser) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        else {
            res.render("users/edit", { user: foundUser });

        }
    });
});

// user UPDATE route
router.put("/users/:id", middleware.isLoggedIn, upload.single("user[avatar]"), function(req, res) {
    User.findById(req.user._id, async function(err, foundUser) {
        if (err) {
            req.flash('error', err.message);
            res.redirect('back');
        }
        else {
            var avatarId, avatar;
            if (req.file) {
                try {
                    await cloudinary.v2.uploader.destroy(foundUser.avatarId);
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    avatarId = result.public_id;
                    avatar = result.secure_url;
                }
                catch (err) {
                    req.flash('error', err.message);
                    return res.redirect('back');
                }
            }
            foundUser.firstName = req.body.user.firstName;
            foundUser.lastName = req.body.user.lastName;
            foundUser.birthYear = req.body.user.birthYear;
            foundUser.interests = req.body.user.interests;
            if (avatarId) {
                foundUser.avatar = avatar;
                foundUser.avatarId = avatarId;
            }
            foundUser.save(function() {});

            req.flash("success", "Profile successfully updated");
            return res.redirect("/users/" + req.user._id);
        }
    });
});


module.exports = router;
