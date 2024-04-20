const express = require('express')
const  mongoose  = require('mongoose')
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const {  Jwt_secret } = require('../Keys')
const requireLogin = require('../middleware/requireLogin')
const { route } = require('./createPost')
const POST = mongoose.model("POST")
const USER = mongoose.model("USER")


// ====== get particular user data=====
router.get('/user/:id', async (req, res) => {
    try {
        const user = await USER.findOne({_id: req.params.id}).select("-password");
        console.log("GET PARTICULAR USER DATA", user);
        if(!user){
            return res.status(422).json({error:"User not found"})
        }
        
        const posts = await POST.find({postedBy: req.params.id}).populate("postedBy", "_id name Photo").sort("-createdAt")
        .populate("comments.postedBy","_id name Photo");
        console.log("PARTICULAR ID RESPONSE",{user,posts})
        
        return res.json({user, posts});
    } catch (err) {
        // Handle errors
        console.error(err);
        return res.status(500).json({error: "Internal Server Error"});
    }
});
// ============API FOR FOLLOW  USER =====
router.put("/follow", requireLogin, async (req, res) => {
    try {
        console.log(req.body.followId)
        // Update followId's followers
        const updatedFollowedUser = await USER.findByIdAndUpdate(
            req.body.followId,
            { $push: { followers: req.user._id }},
            { new: true }
        );

        // Update req.user's following
        const updatedCurrentUser = await USER.findByIdAndUpdate(
            req.user._id,
            { $push: { following: req.body.followId }},
            { new: true }
        );

        res.json(updatedCurrentUser);
    } catch (err) {
        console.error("ERROR IN FOLLOW AND FOLLOWING", err);
        res.status(422).json({ error: err.message });
    }
});
// ============API FOR UNFOLLOW  USER =====
router.put("/unfollow", requireLogin, async (req, res) => {
    try {
        console.log(req.body.followId)
        // Update followId's followers
        const updatedFollowedUser = await USER.findByIdAndUpdate(
            req.body.followId,
            { $pull: { followers: req.user._id }},
            { new: true }
        );

        // Update req.user's following
        const updatedCurrentUser = await USER.findByIdAndUpdate(
            req.user._id,
            { $pull: { following: req.body.followId }},
            { new: true }
        );

        res.json(updatedCurrentUser);
    } catch (err) {
        console.error("ERROR IN FOLLOW AND FOLLOWING", err);
        res.status(422).json({ error: err.message });
    }
});
// ===== API FOR UPLOAD PROFILE PIC ====
router.put("/uploadProfilePic",requireLogin,async(req,res)=>{
    console.log(req.body.pic ,"userpic")
    try{
    const user = await  USER.findByIdAndUpdate(req.user._id,{
        $set:{Photo:req.body.pic}
    },{
        new:true
    })
    console.log("POST PIC DATA!!",user)
    return res.json({user})
}catch(err){
    return res.status(422).json({error:err})
}

})



module.exports = router