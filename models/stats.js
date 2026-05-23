const mongoose = require("mongoose");

const statsSchema = new mongoose.Schema({

delivered:{
type:Number,
default:1250
},

active:{
type:Number,
default:320
},

countries:{
type:Number,
default:45
},

clients:{
type:Number,
default:980
}

});

module.exports =
mongoose.model("Stats", statsSchema);