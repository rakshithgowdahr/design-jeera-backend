const router = require('express').Router();
const multer = require("multer");
const Template = require("../models/Template")
const fs = require("fs")
const sharp = require('sharp');
const stream = require('stream');
const Init = require('../models/Init');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync("./images/templates")) {
            fs.mkdirSync("./images/templates")
        }
        if (!fs.existsSync("./images/templatesSm")) {
            fs.mkdirSync("./images/templatesSm")
        }
        if (!fs.existsSync("./images/templatesMd")) {
            fs.mkdirSync("./images/templatesMd")
        }
        cb(null, "./images/templates")
    },
    filename: async (req, file, cb) => {
        // Check if the name already exists
        const isNameDuplicate = await checkTemplateName(req.body.name);
        if (isNameDuplicate == false) {
            cb(new Error("Already Exists"))
        } else {
            console.log(req.body.dimentions);
            // create template 
            await Template.create({
                name: req.body.name,
                platform: req.body.platform,
                size: req.body.dimentions,
                json: req.body.json,
                category: req.body.category,
                status: req.body.status,
                plan: req.body.plan,
            })
            // Resizing to sm for 
            cb(null, req.body.name.replace(/\s+/g, '') + ".png")
        }
    }
})
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
})
router.post("/templates/add", upload.single("image"), async (req, res) => {
    // Saving the smaller version after upload in the middle ware at top
    sharp(req.file.path)
        .resize(80, 80)
        .toFile('./images/templatesSm/' + req.body.name.replace(/\s+/g, '') + '.webp', (err, info) => {
        });
    sharp(req.file.path)
        .resize({
            fit: sharp.fit.cover,
            width: 350,
            height: 250
        })
        .toFile('./images/templatesMd/' + req.body.name.replace(/\s+/g, '') + '.webp', (err, info) => {
        });
    let templatesField = await Init.findOneAndUpdate({ inited: true },
        {
            $inc: {
                templatesNumber: 1
            }
        }
    );
    res.json({ status: true })
})
// paginated
router.post("/templates", async (req, res) => {
    const { page = 1, limit = 10 } = req.body.data
    const templates = await Template.find().limit(limit * 1).skip((page - 1) * limit);
    console.log(templates);
    res.json(templates);
})
router.post("/templates/:status", async (req, res) => {
    try {
        if (req.params.status == "All Templates") {
            const { page = 1, limit = 10 } = req.body.data
            const templates = await Template.find().limit(limit * 1).skip((page - 1) * limit);
            res.json(templates);
        }
        const { page = 1, limit = 10 } = req.body.data
        const templates = await Template.find({ status: req.params.status }).limit(limit * 1).skip((page - 1) * limit);
        res.json(templates);
    } catch (error) {
    }
})
// paginated
router.post("/templates/get/dashboard", async (req, res) => {
    const { page = 1, limit = 10 } = req.body.data
    const templates = await Template.find({}, { name: 1, plan: 1 }).limit(limit * 1).skip((page - 1) * limit);
    res.json(templates);
})
// paginated
router.post("/templates/get/published", async (req, res) => {
    try {
        const templates = await Template.find({ status: "Published" }, { name: 1, plan: 1, platform: 1 });
        res.json(templates);
    } catch (error) {
    }
})
// paginated
// paginated
router.post("/templates/get/platform/:platform", async (req, res) => {
    const { page = 1, limit = 10, platform = "" } = req.body.data
    var templates = []
    if (req.params.platform == "all") {
        templates = await Template.find({}, { name: 1, plan: 1 }).limit(limit * 1).skip((page - 1) * limit);
        res.json(templates);
    } else {
        templates = await Template.find({
            platform: req.params.platform.replace("_", " ")
        }, { name: 1, plan: 1 }).limit(limit * 1).skip((page - 1) * limit);
        res.json(templates);
    }
})
// Template return for the editor
router.post("/templates/return/editor", async (req, res) => {
    if (req.user) {
        try {
            const template = await Template.findOne({ name: req.body.data.name }) || {};
            if (template.plan == 'Premium') {
                if (req.user.plan == 'Premium') {
                    res.send(template)
                } else {
                    res.json({ status: false })
                }
            } else {
                res.send(template)
            }
        } catch (error) {
            console.log(error);
            res.send("failed")
        }
    }
})
// return 10 templates to show in dashboard, only name,plan
router.post("/template/download", async (req, res) => {
    try {
        let templatesField = await Init.findOneAndUpdate({ inited: true },
            {
                $inc: {
                    downloadsNumber: 1
                }
            }
        );
        res.json({ status: true });
    } catch (error) {
    }
})
//remove template from db and it considering images
router.post("/template/remove", async (req, res) => {
    const name = req.body.data.name;
    try {
        fs.unlink('./images/templatesSm/' + name.replace(/\s/g, '') + ".webp", (err, result) => {
            if (err) console.log(err);
        })
        fs.unlink('./images/templatesMd/' + name.replace(/\s/g, '') + ".webp", (err, result) => {
            if (err) console.log(err);
        })
        fs.unlink('./images/templates/' + name.replace(/\s/g, '') + ".png", (err, result) => {
            if (err) console.log(err);
        })
        fs.unlink('./images/templates/' + name.replace(/\s/g, '') + ".jpg", (err, result) => {
            if (err) console.log(err);
        })
        await Template.findOneAndDelete({ name: name })
        let numberOfTemplatesObject = await Init.findOne({ inited: true });
        if (numberOfTemplatesObject.templatesNumber > 0) {
            let templatesField = await Init.findOneAndUpdate({ inited: true },
                {
                    $inc: {
                        templatesNumber: -1
                    }
                }
            );
        }
    } catch (error) {
    }
    res.send("Deleted")
})
// get Template image small
router.get("/templates/images/sm/:name", async (req, res) => {
    res.sendFile('./images/templatesSm/' + req.params.name + ".webp", { root: "./" })
})
router.get("/templates/images/md/:name", async (req, res) => {
    res.sendFile('./images/templatesMd/' + req.params.name + ".webp", { root: "./" })
})
// Utils check if name of template is unique
async function checkTemplateName(name) {
    const template = await Template.findOne({ name: name })
    if (template == null) {
        console.log("not found");
        return true
    } else {
        console.log(" found");
        return false
    }
}
module.exports = router;
