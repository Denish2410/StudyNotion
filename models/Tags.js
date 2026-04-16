const mongoose=require("mongoose");

const tagsSchema=new mongoose.Schema({
    name:{
        type:String,
        require:true,
        trim:true
    },
    description:{
        type:String,
        require:true,
        trim:true
    },
    courses:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course"
        }
    ]
});

module.exports=mongoose.model("Tag",tagsSchema);