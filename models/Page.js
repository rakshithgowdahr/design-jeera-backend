const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const pageSchema = new Schema({
   name:String,
   markup:String,
})
const Page = mongoose.model('page', pageSchema);
module.exports = Page;