const mongoose = require("mongoose");

const supportSchema = new mongoose.Schema({

ticketId:{
type:String,
required:true,
unique:true
},

name:String,

email:String,

tracking:String,

category:String,

message:String,

status:{
type:String,
default:"Pending"
},

adminReply:{
type:String,
default:""
},

createdAt:{
type:Date,
default:Date.now
}

});

module.exports = mongoose.model("Support", supportSchema);