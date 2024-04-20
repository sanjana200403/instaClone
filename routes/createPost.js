const express = require('express')
const  mongoose  = require('mongoose')
const requireLogin = require('../middleware/requireLogin')
const router = express.Router()
const POST = mongoose.model("POST")

// ======= ROUTE FOR FETCHING ALL POSTS ==========
router.get("/allposts",requireLogin,(req,res)=>{
    console.log(req.query.limit,"limit")
    console.log(req.query.skip,"skip")
    let limit = req.query.limit
    let skip =  req.query.skip
    POST.find()
    .populate("postedBy","_id name Photo")
    .populate("comments.postedBy","_id name Photo")
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .sort("-createdAt")
    .then((posts)=>res.json(posts))
    .catch((err)=>console.log(err))
})


// ==== ROUTE FOR CREATING POST ========
router.post("/createPost",requireLogin,(req,res)=>{
    const {pic,body} = req.body
    console.log(pic,body)
    if(!pic){
        return res.status(422).json({error:"Please add pic"})
    }
    if(!body){
        return res.status(422).json({error:"Please add all fields"})
    }
    console.log(req.user,"posteBy")
  
    
// ==== saving the post in the mongodb=======
    const post = new POST({
      
        body,
        photo:pic,
        postedBy:req.user
    })
    post.save().then((result)=>{
        console.log(result,"POST DATA!!")
        return res.json({post:result})
    }).catch((err)=>{
        console.log(err)
    })
 
})
// ======== ROUTE FOR MYPOST API =====
router.get('/myposts',requireLogin,(req,res)=>{
    console.log(req.user,"ALL POST AUTHORIZATION DATA")
  POST.find({postedBy:req.user._id})
  .populate("postedBy","_id name Photo")
  .populate("comments.postedBy","_id name Photo")
  .sort("-createdAt")
  .then((myposts)=>{
    return res.json(myposts)
  }).catch((err)=>{
    console.log(err ,"error in myposts")
    return res.status(422).json({error:err})
  })

})
// ======== Route for likeing post =======
router.put("/like", requireLogin, async (req, res) => {
    try {
        // update the like field in the database
        const result = await POST.findByIdAndUpdate(req.body.postId, {
            $push: {
                likes: req.user._id
            }
        }, { new: true }).populate("postedBy","_id name Photo");
        console.log("LIKED POST DATA",result)

        return res.json(result);
    } catch (err) {
        return res.status(422).json({ "error": err });
    }
});
// ==========API FOR UNLIKING POST========

router.put("/unlike", requireLogin, async (req, res) => {
    try {
        // update the like field in the database
        const result = await POST.findByIdAndUpdate(req.body.postId, {
            $pull: {
                likes: req.user._id
            }
        }, { new: true }).populate("postedBy","_id name Photo");
        console.log("UNLIKE POST DATA!!",result)
        return res.json(result);
    } catch (err) {
        return res.status(422).json({ "error": err });
    }
});

// ====== Route for comment ===========
router.put("/comment",requireLogin,async(req,res)=>{
    const comment ={
        comment:req.body.text,
        postedBy:req.user._id
    }
   
    try {
        // update the comment field in the database
        const result = await POST.findByIdAndUpdate(req.body.postId, {
            $push: {
                comments : comment
            }
        }, { new: true }).populate("comments.postedBy","_id name").populate("postedBy","_id name Photo")
        ;
         console.log("COMMENT SUCESS",result)
        return res.json(result);
    } catch (err) {
        return res.status(422).json({ error: err });
    }
})

// =========API FOR DELETE POST ======
router.delete('/deletePost/:postId', requireLogin, async (req, res) => {
    console.log(req.params.postId, " DELETEPOST id");

    try {
        const post = await POST.findOne({ _id: req.params.postId }).populate("postedBy", "_id name Photo");
        console.log("DELETE POST DATA", post);

        if (!post) {
            return res.status(422).json({ error: "Cannot find post to delete" });
        }

        console.log("ids", post.postedBy._id.toString(), req.user._id.toString());
        if (post.postedBy._id.toString() === req.user._id.toString()) {
            console.log("matched", post.postedBy._id.toString(), req.user._id.toString());

            await post.deleteOne();
            return res.json({ message: "Successfully deleted" });
        } else {
            return res.status(401).json({ error: "You are not authorized to delete this post" });
        }
    } catch (err) {
        console.log("ERROR IN DELETING POST", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
//=========== to show my following post ========
router.get("/myfollowingpost",requireLogin,(req,res)=>{
    POST.find({
        postedBy:{
            $in:req.user.following
        }
    }).populate("postedBy","_id name Photo")
    .populate("comments.postedBy","_id name Photo")
    .then((posts=>{
        console.log("MY FOLLOWING USER DATA",posts)
       return res.json(posts)
    })).catch((err)=>{
        console.log("ERROR IN MY FOLLOWING DATA",err)
        return res.status(422).json({
           "error":err
        })

    })

})

module.exports = router


