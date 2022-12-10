const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const LocalStrategy = require("passport-local");
const bcrypt = require('bcryptjs');
const keys = require('./keys');
const User = require("../models/User");
// Once the done called when a user succefully login/register it comes to here
passport.serializeUser((user, done) => {
    done(null, user.id)
})
passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user)
    })
})
/// Local auth
passport.use(new LocalStrategy(
    function (username, password, done) {
        User.findOne({ email: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            bcrypt.compare(password, user.password, (err, result) => {
                // if(err) throw err;
                if (result == true) {
                    // console.log("pass match");
                    done(null, user);
                } else {
                    // console.log("pass doesntmatch");
                    done(null, false);
                }
            })
            // return done(null, user);
        });
    }
));
/// Google auth
passport.use(
    new GoogleStrategy({
        // options for the strategy
        callbackURL: keys.websiteUrl,
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret
    }, (accessToken, refreshToken, profile, done) => {
        // passport callback func
        // Her we check if user exist and create one if not
        // console.log("passport callback function fired");
        // check if user exists
        User.findOne({ email: profile.emails[0].value }).then((currentUser) => {
            // if exists
            if (currentUser) {
                // console.log("user is "+currentUser);
                return done(null, currentUser)
            } else {
                // Creat a new user if it doesnt exists
                new User({
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id
                }).save().then((newUser) => {
                    // console.log("new user created" + newUser)
                    return done(null, newUser)
                })
            }
        })
    })
)
