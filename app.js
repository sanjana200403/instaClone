const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const app = express()
const PORT = process.env.port || 5000 || 3000 || 1000 ||2000 ||7000;
const {mongoUrl} = require("./Keys")

require('./models/post')
require('./models/model')
// solve cors origine policy error
app.use(cors())

// ======== Middleware to parse JSON bodies ==========
// express.json() is a middleware function in Express.js that is used to parse incoming request bodies in JSON format. 

app.use(express.json());
// =======middleware for errors===============


//================== routes handler ====================
app.use(require('./routes/auth'))
app.use(require('./routes/createPost'))
app.use(require('./routes/user'))



//================ mongodb connnection===========
mongoose.connect(mongoUrl).then((res)=>{
    console.log("DATABASE CONNECTED!!")
}).catch((error)=>{
    console.log("ERROR IN DATABASE CONNECTION!!",error)
})
mongoose.connection.on("connected",()=>{
    console.log("SUCCESFULLY CONNECTED TO DATABASE!!")

})
mongoose.connection.on("error",()=>{
    console.log("NOT CONNECTED TO DATABASE!!")

})

// =============app listening ============
app.listen(PORT,(req,res)=>{
    console.log("SERVER IS LISTENING AT",PORT)
    
})
