const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const initSchema = new Schema({
    websiteTitle: String,
    websiteDescription: String,
    websiteKeywords: String,
    subscription:Boolean,
    monthly:Number,
    yearly:Number,
    paypalKey:String,
    stripeKey:String,
    usersNumber:Number,
    templatesNumber:Number,
    imagesNumber:Number,
    downloadsNumber:Number,
    inited:Boolean,
    trackingCode:String
})



const Init = mongoose.model('init', initSchema);
module.exports = Init;