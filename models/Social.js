const { StreamingQuerystring } = require('formidable');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const socialSchema = new Schema({
    name:String,
    facebook: String,
    instagram: String,
    twitter: String,
    youtube:String,
    linkedin:String
})



const Social = mongoose.model('social', socialSchema);
module.exports = Social;