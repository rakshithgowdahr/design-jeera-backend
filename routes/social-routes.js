const router = require('express').Router();
const Social = require("../models/Social")
router.post("/add", async (req, res) => {
    if (req.user.role == "admin") {
        try {
            const page = await Social.findOne({ name: "social" })
            if (page == null) {
                // Not found we can add page
                await Social.create({
                    name: "social",
                    facebook: req.body.data.facebook,
                    instagram: req.body.data.instagram,
                    twitter: req.body.data.twitter,
                    youtube: req.body.data.youtube,
                    linkedin: req.body.data.linkedin,
                })
                res.json({ status: true })
            } else {
                // Page already exists
                const page = await Social.findOneAndUpdate({ name: "social" },
                    {
                        facebook: req.body.data.facebook,
                        instagram: req.body.data.instagram,
                        twitter: req.body.data.twitter,
                        youtube: req.body.data.youtube,
                        linkedin: req.body.data.linkedin,
                    }
                )
                res.json({ status: true })
            }
        } catch (error) {
            console.log(error);
            res.json({ status: false })
        }
    }
})
router.post("/get", async (req, res) => {
    try {
        const social = await Social.find({})
        res.send(social)
    } catch (error) {
        console.log(error);
        res.json({ status: false })
    }
})
module.exports = router;
