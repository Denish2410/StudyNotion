const Course =require("../models/Course");
const User =require("../models/User");
const Tag= require("../models/Tags");
const {uploadImageToCloudinary}=require("../utils/imageUploder");

// handler function for create course
exports.createCourse=async (req,res)=>{
    try{
        // fetch data
        const {courseName,courseDescription,whatWillYouLearn,tag,price}=req.body;
        // get thumbnail
        const thumbnail=req.files.thumbnailImage;

        // validation
        if(!courseName || !courseDescription || !whatWillYouLearn || !tag || !price || !thumbnail){
            return res.status(400).json({
                success:false,
                message:"All feilds are required"
            })
        }

        // check for instrutor
        const userId=req.user.id;
        const instructorDetail=await User.findById(userId);
        if(!instructorDetail || instructorDetail.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message:"Instructor not found"
            })
        }
        // validate tag
        const tagDetail= await Tag.findById(tag);
        if(!tagDetail){
            return res.status(401).json({
                success:false,
                message:"Tag not found"
            })
        }
        
        // upload image to cloudinary
        const thumbnailResponse=await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);
        
        const course=await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetail._id,
            whatWillYouLearn:whatWillYouLearn,
            price,
            tag:tagDetail._id,
            thumbnail:thumbnailResponse.secure_url,
        })

        // add new course to user schema of instructor
        await User.findByIdAndUpdate(
            {_id:instructorDetail._id},
            {
                $push:{
                    courses:course._id,
                }
            },
            {new:true},
        )

        // update tag schema
        await Tag.findByIdAndUpdate(
            {_id:tagDetail._id},
            {
                $push:{
                    courses:course._id,
                }
            },
            {new:true},
        )

        return res.status(200).json({
            success:true,
            data:course,
            message:"Course created successfully"
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// handler get all function

exports.showAllCourses = async (req,res)=>{
    try{
        // fetch all course
        const allCourses = await Course.find({},{
            courseName:true,
            price:true,
            thumbnail:true,
            instructor:true,
            ratingAndReviews:true,
            studentsEnrolled:true
        }
        ).populate("instructor").exec();

        return res.status(200).json({
            success:true,
            data:allCourses,
            message:"All courses fetched successfully"
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
