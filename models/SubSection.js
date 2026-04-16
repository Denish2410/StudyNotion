const mongoose=require("mongoose"); // mongoose instance

const subSectionSchema = new mongoose.Schema({
    title:{
        type:String   
    },
    timeDuration:{
        type:String
    },
    description:{
        type:String,
        trim:true
    },
    videoUrl:{
        type:String,
        trim:true
    }
})

module.exports=mongoose.model("SubSection",subSectionSchema);