const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const userSchema = new Schema({
    username: String,
    firstname:String,
    lastname:String,
    plan:String,
    subcrtiptionStarts:Date,
    subcrtiptionEnds:Date,
    creadtedAt:Date,
    googleId: String,
    email:String,
    password:String,
    role:String

})


const User = mongoose.model('user', userSchema);
module.exports = User;