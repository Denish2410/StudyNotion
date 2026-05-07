const RatingAndReviews=require("../models/RatingAndReview");
const Course=require("../models/Course");
const User=require("../models/User");
const { default: mongoose } = require("mongoose");
const { exportAs } = require("tldraw");

exports.createRatingAndReview=async (req,res)=>{
    try{
        // steps
        // 1) get user id
        const userId=req.user.id;
        // 2) fetch data from req.body
        const {rating,review,courseId}=req.body;
        // 3) check if user is enrolled or not
        const courseDetails=await Course.findOne(
            {_id:courseId,
                studentsEnrolled:{$elemMatch:{$eq:userId}}
            }  
        );
        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:"You are not enrolled in this course"
            })
        }
        // 4) check if user has already rated the course or not
        const alreadyReviewed=await RatingAndReviews.findOne({
            user:userId,
            course:courseId
        })
        if(alreadyReviewed){
            return res.status(400).json({
                success:false,
                message:"You have already rated this course"
            })
        }
        // 5) create rating and review
        const ratingReviews=await RatingAndReviews.create({
            rating,
            review,
            course:courseId,
            user:userId
        }) 
        // 6) update course rating and review
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId},
            {
                $push:{
                    ratingAndReviews:ratingReviews._id,
                }
            },
            {new:true}
        );
        console.log("updatedCourseDetails : ",updatedCourseDetails);
        // 7) return response
        return res.status(200).json({
            success:true,
            message:"Rating and review created successfully",
            ratingReviews
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// get avg rating
exports.getAverageRating = async (req,res) => {
    try {
        // get course ID
        const courseId=req.body.courseId;
        // calculate AVG rating
        const result=await RatingAndReviews.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId)
                },
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"}
                }
            }
        ])

        // return rating
        if(result.length>0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating
            })
        }
        return res.status(404).json({
            success:false,
            message:"Avgrate rating is zero.no rating given till found",
            averageRating:0

        })
    }catch (error) {
        console.log("Error : ",error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// get all rating
exports.getAllRating = async (req,res)=>{
    try{
        const allReviews=await RatingAndReviews.find(
            {}
        ).sort({rating:"desc"})
        .populate({
            path:"user",
            select:"firstname lastname email image",
        })
        .populate({
            path:"course",
            select:"courseName",
        })
        .exec();

        return res.status(200).json({
            success:true,
            message:"All reviews fetched successfully",
            data:allReviews
        });

    }catch(error){
        console.log("Error : ",error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


// TODO : paricular course id's rating