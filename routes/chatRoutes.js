const express = require("express");
const router = express.Router();

const ChatMessage =
require("../models/ChatMessage");

/* SEND MESSAGE */

router.post("/", async(req,res)=>{

const msg =
await ChatMessage.create({

sessionId:req.body.sessionId,

sender:"user",

message:req.body.message

});

res.json(msg);

});

/* GET CHAT */

router.get("/:sessionId", async(req,res)=>{

const messages =
await ChatMessage.find({

sessionId:req.params.sessionId

}).sort({createdAt:1});

res.json(messages);

});

/* ADMIN REPLY */

router.post("/:sessionId/reply", async(req,res)=>{

const msg =
await ChatMessage.create({

sessionId:req.params.sessionId,

sender:"admin",

message:req.body.message

});

res.json(msg);

});

module.exports = router;