const dotenv = require("dotenv")
const express = require("express")
const mongoose = require ("mongoose")
const cors=require("cors")
const connectdb=require("./config/dbconnection")
const userroutes =require("./routes/userroutes.js")
const app = express()
dotenv.config()

const PORT =process.env.PORT

const DATABASE_URL=process.env.DATABASE_URL

// database connection 
connectdb(DATABASE_URL)

// JSON
app.use(express.json())
app.use(express.urlencoded({
    extended:true
}))

// cors policy
app.use(cors())
app.use(require("./middleware/cors.js"))

// load routes 
app.use("/api/user",userroutes)

app.get("/",(req,res)=>{
    res.status(200).send("welcome")
})

app.listen(PORT,()=>{
    console.log(`server is listening on http://localhost:${PORT}`)
})