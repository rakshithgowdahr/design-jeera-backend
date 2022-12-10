const router = require('express').Router();
const sharp = require('sharp');
const fs = require("fs")
const multer = require("multer");
const Image = require('../models/Image');
const Init = require('../models/Init');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync("./images/images")) {
            fs.mkdirSync("./images/images")
        }
        if (!fs.existsSync("./images/imagesSm")) {
            fs.mkdirSync("./images/imagesSm")
        }
        if (!fs.existsSync("./images/imagesMd")) {
            fs.mkdirSync("./images/imagesMd")
        }
        cb(null, "./images/images")
    },
    filename: async (req, file, cb) => {
        if (req.user.role == "admin") {
            // Check if the name already exists
            const isNameDuplicate = await checkImageName(req.body.name);
            if (isNameDuplicate == false) {
                cb(new Error("Already Exists"))
            } else {
                // create template 
                await Image.create({
                    name: req.body.name,
                    type: req.body.type
                })
                if (file.mimetype == "image/svg+xml") {
                    cb(null, req.body.name.replace(/\s+/g, '') + ".svg")
                } else {
                    cb(null, req.body.name.replace(/\s+/g, '') + ".png")
                }
            }
        }
    }
})
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/svg+xml") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg .svg format allowed!'));
        }
    }
})
router.post("/add", upload.single("image"), async (req, res) => {
    // Saving the smaller version after upload in the middle ware at top
    sharp(req.file.path)
        .resize(80, 80)
        .toFile('./images/imagesSm/' + req.body.name.replace(/\s+/g, '') + '.webp', (err, info) => {
        });
    sharp(req.file.path)
        .resize(250, 250)
        .toFile('./images/imagesMd/' + req.body.name.replace(/\s+/g, '') + '.webp', (err, info) => {
        });
    let imagesField = await Init.findOneAndUpdate({ inited: true },
        {
            $inc: {
                imagesNumber: 1
            }
        }
    );
    res.json({ status: true })
})
//remove image  
router.post("/remove", async (req, res) => {
    if (req.user.role == "admin") {
        const name = req.body.data.name;
        await Image.findOneAndDelete({ name: name })
        try {
            removeImageByName(name)
            let numberOfImagessObject = await Init.findOne({ inited: true });
            if (numberOfTemplatesObject.imagesNumber > 0) {
                let imagesField = await Init.findOneAndUpdate({ inited: true },
                    {
                        $inc: {
                            imagesNumber: -1
                        }
                    }
                );
            }
        } catch (error) {
        }
    }
    res.json({ status: true })
})
router.post("/get", async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.body.data
        const templates = await Image.find().limit(limit * 1).skip((page - 1) * limit);
        res.json(templates);
    } catch (error) {
        console.log(error);
    }
})
// get Template image small
router.get("/sm/:name", async (req, res) => {
    res.sendFile('./images/imagesSm/' + req.params.name + ".webp", { root: "./" })
})
router.get("/md/:name", async (req, res) => {
    res.sendFile('./images/imagesMd/' + req.params.name + ".webp", { root: "./" })
})
// get Template image small
router.get("/max/:name", async (req, res) => {
    if (fs.existsSync(('./images/images/' + req.params.name.replace(" ", "") + ".png"))) {
        res.sendFile('./images/images/' + req.params.name.replace(" ", "") + ".png", { root: "./" })
    } else if (fs.existsSync(('./images/images/' + req.params.name.replace(" ", "") + ".jpg"))) {
        res.sendFile('./images/images/' + req.params.name.replace(" ", "") + ".jpg", { root: "./" })
    } else {
        res.sendFile('./images/images/' + req.params.name.replace(" ", "") + ".svg", { root: "./" })
    }
})
// Utils check if name of image is unique
async function checkImageName(name) {
    const template = await Image.findOne({ name: name })
    if (template == null) {
        console.log("not found");
        return true
    } else {
        console.log(" found");
        return false
    }
}
// Function to delete images from our file system
async function removeImageByName(name) {
    if (fs.existsSync('./images/images/' + name.replace(" ", "") + ".png")) {
        fs.unlink('./images/images/' + name.replace(" ", "") + ".png", (err, result) => {
            if (err) console.log(err);
        })
    }
    if (fs.existsSync('./images/images/' + name.replace(" ", "") + ".jpg")) {
        fs.unlink('./images/images/' + name.replace(" ", "") + ".jpg", (err, result) => {
            if (err) console.log(err);
        })
    }
    if (fs.existsSync('./images/images/' + name.replace(" ", "") + ".svg")) {
        fs.unlink('./images/images/' + name.replace(" ", "") + ".svg", (err, result) => {
            if (err) console.log(err);
        })
    }
    if (fs.existsSync('./images/imagesSm/' + name.replace(" ", "") + ".webp")) {
        fs.unlink('./images/imagesSm/' + name.replace(" ", "") + ".webp", (err, result) => {
            if (err) console.log(err);
        })
    }
    if (fs.existsSync('./images/imagesMd/' + name.replace(" ", "") + ".webp")) {
        fs.unlink('./images/imagesMd/' + name.replace(" ", "") + ".webp", (err, result) => {
            if (err) console.log(err);
        })
    }
}
module.exports = router;
