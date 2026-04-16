const mongoose=require("mongoose"); // mongoose instance

const sectionSchema = new mongoose.Schema({
    sectionName:{
        type:String   
    },
    subSection:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"SubSection",
            require:true
        }
    ]
});

module.exports=mongoose.model("Section",sectionSchema);