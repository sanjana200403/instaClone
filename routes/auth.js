const express = require('express')
const  mongoose  = require('mongoose')
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const {  Jwt_secret } = require('../Keys')
const requireLogin = require('../middleware/requireLogin')


//======= REQUIRE MODEL========

const USER = mongoose.model("USER")

// ============== SIGNUP API ==============

router.get("/",(req,res)=>{
    res.send("hello")
})
router.post('/signup',(req,res)=>{
    console.log("REGISTER API HIT!!")
    const {name,userName,email,password} = req.body

   
    if(!name){
        return res.status(422).json({"error":"Pease enter the name"})
    }
    if(!userName){
        return res.status(422).json({"error":"Pease enter the user name"})
    }
    if(!email){
        return res.status(422).json({"error":"Pease enter the email"})
    }
    if(!password){
       return res.status(422).json({"error":"Pease enter the password"})
    }
USER.findOne({$or:[{email:email},{userName:userName}]}).then((savedUser)=>{
    if(savedUser){
        return res.status(422).json({"error":"This Gmail or Username already exist"})
    }
    //========== hashin the password ========
    bcrypt.hash(password,10).then((hashPassword)=>{
     
         // ======saving the user in the database======
    const user = new USER({
        name,
        userName,
        email,
        password:hashPassword
     })
     user.save().then((user) => {
        console.log("USER REGISTER",user)
       return  res.json({"message":"User Registerd Successfully"})
        
     }).catch((err) => {
    
      console.log("ERROR IN SAVING USER!!!",err)
        
     });

    })

})


})
// ===================== SIGNIN API ===============
router.post('/signin',(req,res)=>{
    const {email,password} = req.body
    if(!email){
        return res.status(422).json({"error":"Pease enter the email"})
    }
    if(!password){
       return res.status(422).json({"error":"Pease enter the password"})
    }
    // ===find the user with the email id
    USER.findOne({email:email}).then((savedUser)=>{
        if(!savedUser){
            return res.status(422).json({"error":"No user with this email"})
        }
        console.log(savedUser,"LOGIN USER DETAILS!!")
        bcrypt.compare(password,savedUser.password).then((matchedPassword)=>{
            if(matchedPassword){
                // ===genrating the token===
                console.log(savedUser.id ,"jwt id")
                console.log(savedUser._id ,"jwt id")
               const token = jwt.sign({_id:savedUser.id},Jwt_secret)
               const {_id,name,email,userName,Photo}= savedUser
               console.log({token,user:{_id,name,email,userName,Photo}})

               return res.json({token,user:{_id,name,email,userName,Photo}
})
                
            }else{
                return res.status(422).json({
                    "error":"Invalid Password"
                })

            }
        }).catch((error)=>{
            console.log(error)
        })
          
        


    })


})




module.exports = router