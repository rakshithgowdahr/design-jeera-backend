const router = require('express').Router();
const passport = require('passport');
const Category = require("../models/Category")
router.post("/categories/add", (req, res) => {
   if (req.user.role == "admin") {
      Category.create({
         name: req.body.data.categoryName,
         date: Date.now()
      })
      res.json({ status: true })
   }
})
router.post("/categories/remove", async (req, res) => {
   if (req.user.role == "admin") {
      await Category.remove({ "name": req.body.data.name });
      const cats = await Category.find().limit(3);
      res.json(cats)
   }
})
// paginated
router.post("/categories", async (req, res) => {
   const { page = 1, limit = 10 } = req.body.data
   const cats = await Category.find().limit(limit * 1).skip((page - 1) * limit);
   res.json(cats);
})
// all cats
router.post("/categories/all", async (req, res) => {
   const cats = await Category.find()
   res.json(cats);
})
module.exports = router;
