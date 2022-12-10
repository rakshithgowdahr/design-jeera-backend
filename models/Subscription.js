const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const subscriptionSchema = new Schema({
    email: String,
    duration:String,
    created_at:Date,
    expiration_date:Date
})


const Subscription = mongoose.model('subscription', subscriptionSchema);
module.exports = Subscription;