const express = require("express");
const router = express.Router();
const Support = require("../models/support");

/* CREATE SUPPORT TICKET */

router.post("/", async(req,res)=>{

try{

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

res.json({
success:true,
message:"Support request submitted",
ticketId
});

}catch(err){

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

res.json(tickets);

}catch(err){

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
adminReply:req.body.adminReply,
status:"Resolved"
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

module.exports = router;