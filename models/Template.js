const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const templateSchema = new Schema({
    name: String, // This will be assinged to its image
    platform:String,
    size:String,
    json:String,
    category:String,
    status:String, // Onhold,publiched,draft,archived
    plan:String

})


const Template = mongoose.model('template', templateSchema);
module.exports = Template;