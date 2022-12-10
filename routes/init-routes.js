const router = require('express').Router();
const bcrypt = require("bcryptjs")
const Init = require('../models/Init')
const User = require("../models/User")
router.post("/init", (req, res) => {
  Init.countDocuments(async (err, count) => {
    console.log(count);
    if (count == 0) {
      // Initialising the metadata
      Init.create({
        websiteTitle: req.body.data.websiteTitle,
        websiteDescription: req.body.data.websiteDescription,
        websiteKeywords: req.body.data.websiteKeywords,
        subscription: false,
        monthly: 0,
        yearly: 0,
        stripeKey: '',
        paypalKey: '',
        usersNumber: 0,
        templatesNumber: 0,
        imagesNumber: 0,
        downloadsNumber: 0,
        trackingCode: '',
        inited: true
      })
      // Initialising admin login 
      const hashedPassword = await bcrypt.hash(req.body.data.password, 10)
      User.create({
        email: req.body.data.email,
        password: hashedPassword,
        firstname: "Welcome",
        lastname: "Back",
        plan: "Free",
        subcrtiptionStarts: null,
        subcrtiptionEnds: null,
        creadtedAt: Date.now(),
        role: "admin"
      });
      res.json({ status: "initialised" })
    } else {
      res.json({ status: true })
    }
  })
})
router.post("/getMeta", async (req, res) => {
  try {
    const meta = await Init.find({}, { websiteTitle: 1, websiteDescription: 1, websiteKeywords: 1, subscription: 1, stripeKey: 1, paypalKey: 1, monthly: 1, yearly: 1 })
    res.json(meta)
  } catch (error) {
    res.send("Error trying to get metadata")
  }
})
router.post("/getStats", async (req, res) => {
  if (req.user.role = 'admin')
    try {
      const meta = await Init.find({}, { inited: 1, usersNumber: 1, templatesNumber: 1, imagesNumber: 1, downloadsNumber: 1 })
      res.json(meta)
    } catch (error) {
      res.send("Error trying to get metadata")
    }
})
router.post("/edit/metadata", async (req, res) => {
  if (req.user.role == "admin")
    try {
      const meta = await Init.findOneAndUpdate({ inited: true }, {
        websiteTitle: req.body.data.websiteTitle,
        websiteDescription: req.body.data.websiteDescription,
        websiteKeywords: req.body.data.websiteKeywords
      })
      res.json({ status: true })
    } catch (error) {
      res.json({ status: false })
    }
  res.json(meta)
})
router.post("/analytics/get", async (req, res) => {
  try {
    const meta = await Init.find({}, { trackingCode: 1 })
    res.json(meta)
  } catch (error) {
    res.send("Error trying to get metadata")
  }
})
router.post("/analytics/add", async (req, res) => {
  if (req.user.role == "admin")
    try {
      const meta = await Init.findOneAndUpdate({ inited: true }, {
        trackingCode: req.body.data.analytics,
      })
      res.json({ status: true })
    } catch (error) {
      res.json({ status: false })
    }
  res.json(meta)
})
router.post("/edit/metadata/subscription", async (req, res) => {
  if (req.user.role == "admin")
    try {
      const meta = await Init.findOneAndUpdate({ inited: true }, {
        paypalKey: req.body.data.paypalKey,
        stripeKey: req.body.data.stripeKey,
        subscription: req.body.data.subscription,
        monthly: req.body.data.monthly,
        yearly: req.body.data.yearly
      })
      res.json({ status: true })
    } catch (error) {
      res.json({ status: false })
    }
  res.json(meta)
})
module.exports = router;
