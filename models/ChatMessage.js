const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({

sessionId:String,

sender:{
type:String,
enum:["user","admin"]
},

message:String,

createdAt:{
type:Date,
default:Date.now
}

});

module.exports =
mongoose.model("ChatMessage", chatSchema);