const mongoose=require("mongoose")

const connectdb=async(DATABASE_URL)=>{
    try {
        const DB_OPTIONS ={
            dbName:"splitwise"
        }
        await mongoose.connect(DATABASE_URL,DB_OPTIONS)
        console.log("Connected to Database..")
    } catch (error) {
        console.log(error)
        
    }
}

module.exports=connectdb