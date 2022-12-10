const Message = require('../models/Message');
const router = require('express').Router();
router.post("/send", async (req, res) => {
    var name = req.body.data.name;
    var email = req.body.data.email;
    var message = req.body.data.message;
    try {
        await Message.create(
            {
                name: name,
                email: email,
                message: message,
                date: Date.now()
            }
        )
        res.send('Message sent!')
    } catch (error) {
    }
})
router.post("/get", async (req, res) => {
    if (req.user.role == "admin") {
        try {
            const { page = 1, limit = 10 } = req.body.data
            const messages = await Message.find().limit(limit * 1).skip((page - 1) * limit);
            res.json(messages);
        } catch (error) {
            console.log(error);
        }
    } else {
        res.send('Not Authorized !')
    }
})
module.exports = router;
