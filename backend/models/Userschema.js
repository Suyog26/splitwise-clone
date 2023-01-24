const mongoose = require("mongoose")
const moment =require("moment")

// Defining Schema

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    tc: {
        type: Boolean,
        required: true
    },
    friends: {
        type: Array
    },
    expensis:{
        type: Array
    }
    // expensis: [
    //     {
    //         name: { type: String },
    //         data:{
    //             desc:{type:String},
    //             amount:{type:String}
    //         },
            
    //     }
    // ],
    // createdAt:{type:Number}
})

// Model
const userModel = mongoose.model("user", userSchema)

module.exports = userModel