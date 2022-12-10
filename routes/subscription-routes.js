const Subscription = require('../models/Subscription');
const router = require('express').Router();
router.post("/get", async (req, res) => {
  try {
    if (req.user.role = "admin") {
      const { page = 1, limit = 10 } = req.body.data
      const subscriptions = await Subscription.find({}).limit(limit * 1).skip((page - 1) * limit);
      res.json(subscriptions);
    } else {
      res.json({ status: "failed" })
    }
  } catch (error) {
  }
})
module.exports = router;
