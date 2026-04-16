const mongoose=require("mongoose");

const ratingAndReviewsSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true
    },
    rating:{
        type:Number,
        require:true
    },
    review:{
        type:String,
        require:true,
        trim:true
    }
});

module.exports=mongoose.Schema("RatingAndReviews",ratingAndReviewsSchema);