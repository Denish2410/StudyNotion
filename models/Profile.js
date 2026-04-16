const mongoose=require("mongoose"); // mongoose instance

const profileSchema = new mongoose.Schema({
    gender:{
        type:String   
    },
    dataOfBirth:{
        type:String
    },
    about:{
        type:String,
        trim:true
    },
    contactNumber:{
        type:String,
        trim:true
    }
})

module.exports=mongoose.model("User",profileSchema);