const express = require("express");
const router = express.Router();
const Support = require("../models/support");

/* CREATE SUPPORT TICKET */

router.post("/", async(req,res)=>{

console.log("POST /api/support HIT");
console.log("BODY:", req.body);


try{

console.log("SUPPORT REQUEST BODY:");
console.log(req.body);

const ticketId =
"SUP-" + Math.floor(100000 + Math.random()*900000);

const newTicket = new Support({

ticketId,
name:req.body.name,
email:req.body.email,
tracking:req.body.tracking,
category:req.body.category,
message:req.body.message

});

await newTicket.save();

console.log("SAVED:");
console.log(newTicket);

res.json({
success:true,
message:"Support request submitted",
ticketId
});

}catch(err){

console.log("SAVE ERROR:");
console.log(err);

res.status(500).json({
success:false,
message:"Server error"
});

}

});

/* GET ALL TICKETS */

router.get("/", async(req,res)=>{

try{

const tickets = await Support.find()
.sort({createdAt:-1});

console.log("FOUND TICKETS:");
console.log(tickets);

res.json(tickets);

}catch(err){

console.log("GET ERROR:");
console.log(err);

res.status(500).json({
message:"Error loading tickets"
});

}

});
/* ADMIN REPLY */

router.put("/:id/reply", async(req,res)=>{

try{

const updated = await Support.findByIdAndUpdate(

req.params.id,

{
adminReply:req.body.adminReply
},

{new:true}

);

res.json(updated);

}catch(err){

res.status(500).json({
message:"Reply failed"
});

}

});
/* DELETE TICKET */

router.delete("/:id", async(req,res)=>{

try{

await Support.findByIdAndDelete(
req.params.id
);

res.json({
success:true
});

}catch(err){

res.status(500).json({
message:"Delete failed"
});

}

});
module.exports = router;