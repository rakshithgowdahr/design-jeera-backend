const passport = require('passport');
const router = require('express').Router();
const User = require("../models/User")
const bcrypt = require('bcryptjs');
const Subscription = require('../models/Subscription');
const Init = require('../models/Init');
const keys = require('../services/keys');
router.post("/register", (req, res) => {
  var email = req.body.data.email;
  var password = req.body.data.password;
  ("email is " + email);
  User.findOne({ email: email }, async (err, doc) => {
    if (err) throw err;
    if (doc) res.json({ status: "exists" });
    if (!doc) {
      const hashedPassword = await bcrypt.hash(password, 10)
      const newUser = new User({
        email: email,
        firstname: "Welcome",
        lastname: "Back",
        plan: "Free",
        subcrtiptionStarts: null,
        subcrtiptionEnds: null,
        createdAt: Date.now(),
        password: hashedPassword,
        role: "user"
      });
      await newUser.save()
      let usersField = await Init.findOneAndUpdate({ inited: true },
        {
          $inc: {
            usersNumber: 1
          }
        }
      );
      res.json({ status: true })
    }
  })
})
router.post("/login", passport.authenticate('local', { session: true }), (req, res, next) => {
  if (req.user) {
    res.json({ status: "true" })
  } else {
    res.json({ status: "false" })
  }
})
// get all users 
router.post("/users/get/:filter", async (req, res) => {
  try {
    if (req.user.role = "admin") {
      const { page = 1, limit = 10 } = req.body.data
      const templates = await User.find(req.params.filter !== "all" ? { plan: req.params.filter } : {}).limit(limit * 1).skip((page - 1) * limit);
      res.json(templates);
    } else {
      res.json({ status: "failed" })
    }
  } catch (error) {
  }
})
router.post("/subscription", async (req, res) => {
  if (req.user) {
    try {
      const { amount, plan, duration } = req.body.data
        (duration);
      var date = new Date(); // Now
      date.setDate(date.getDate() + (duration == "Monthly" ? 31 : 365)); // Set now + 30 days as the new date
      let user = await User.findOneAndUpdate({ email: req.user.email }, { plan: "Premium", subcrtiptionEnds: date })
      // Adding the subsctiption to subscriptions table
      const newSubscription = new Subscription({
        email: req.user.email,
        duration: duration,
        created_at: Date.now(),
        expiration_date: date
      });
      await newSubscription.save()
    } catch (error) {
    }
  }
})
router.post("/edit/user", async (req, res, next) => {
  ("Im in");
  try {
    if (req.user) {
      const userToEdit = await User.findOneAndUpdate({ email: req.user.email }, { firstname: req.body.data.firstname, lastname: req.body.data.lastname })
      res.json({ status: "true" })
    } else {
      res.json({ status: "false" })
    }
  } catch (error) {
    (error);
  }
})
router.post("/edit/user/admin", async (req, res, next) => {
  try {
    if (req.user.role == "admin") {
      const userToEdit = await User.findOneAndUpdate({ email: req.user.email }, { plan: req.body.data.plan, subcrtiptionEnds: req.body.data.subcrtiptionEnds, role: req.body.data.role })
      res.json({ status: "true" })
    } else {
      res.json({ status: "false" })
    }
  } catch (error) {
    (error);
  }
})
router.post("/remove/user", async (req, res, next) => {
  ("Im in");
  try {
    if (req.user) {
      const userToDelete = await User.findOneAndDelete({ email: req.user.email })
      res.json({ status: "true" })
    } else {
      res.json({ status: "false" })
    }
  } catch (error) {
    (error);
  }
})
///////////////////////
// check if user logged in  
router.post("/check", async (req, res) => {
  if (req.user) {
    var subscriptionEnds = new Date(req.user.subcrtiptionEnds)
    var now = new Date()
    if (req.user.plan == "Premium") {
      if (subscriptionEnds < now) {
        ("This account membership is expired");
        var findUser = await User.findOneAndUpdate({ email: req.user.email }, { plan: "Free" })
      } else {
        ("Premium Still running");
      }
    }
    res.json({
      status: "logged in", user: {
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        email: req.user.email,
        plan: req.user.plan,
        subcrtiptionStarts: req.user.subcrtiptionStarts,
        subcrtiptionEnds: req.user.subcrtiptionEnds,
        creadtedAt: req.user.creadtedAt,
        role: req.user.role
      }
    })
  } else {
    res.json({ status: "" })
  }
})
// Logout 
router.post("/logout", (req, res) => {
  req.logout();
  res.json({ status: "logged out" })
})
//Handle auth with passport here
router.get("/google", passport.authenticate("google", { scope: ['email'] }))
// Google redirect 
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  //  res.send(req.user)
  res.redirect(keys.url + "/members")
})
module.exports = router;