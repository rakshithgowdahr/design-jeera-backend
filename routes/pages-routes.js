const router = require('express').Router();
const Page = require("../models/Page")
router.post("/add", async (req, res) => {
    if (req.user.role == "admin") {
        try {
            const page = await Page.findOne({ name: req.body.data.name.replace("_", " ") })
            if (page == null) {
                // Not found we can add page
                await Page.create({
                    name: req.body.data.name.replace("_", ""),
                    markup: req.body.data.markup
                })
                res.json({ status: true })
            } else {
                // Page already exists
                res.json({ status: false })
            }
        } catch (error) {
            console.log(error);
        }
    }
})
router.post("/get", async (req, res) => {
    try {
        const pages = await Page.find({})
        res.send(pages)
    } catch (error) {
        console.log(error);
        res.json({ status: false })
    }
})
router.post("/get/one", async (req, res) => {
    try {
        const page = await Page.find({ name: req.body.data.name })
        res.send(page)
    } catch (error) {
        console.log(error);
        res.json({ status: false })
    }
})
router.post("/remove", async (req, res) => {
    if (req.user.role == "admin") {
        try {
            const pages = await Page.findOneAndDelete({ name: req.body.data.name })
            res.json({ status: true })
        } catch (error) {
            console.log(error);
            res.json({ status: false })
        }
    }
})
module.exports = router;
