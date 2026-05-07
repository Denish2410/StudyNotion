const Category=require("../models/Tags");

// handler fxn for create Tag
exports.createCategory=async (req,res)=>{
    try{
        // fetch data from body
        const {name, description}=req.body;
        // validation
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All Fields Are Required"
            })
        }
        // create tag and save in DB
        const categoryDetails = await Category.create({name:name, description:description});
        console.log("CategoryDetails : ",categoryDetails);
        return res.status(200).json({
            success:true,
            message:"Category Created Successfully",
            categoryDetails
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
        })
    }
}

// get all tags
exports.showAllCategories=async (req,res)=>{
    try{
        const allCategories=await Category.find({}, {name:true,description:true});
        return res.status(200).json({
            success:true,
            message:"Categories Fetched Successfully",
            allCategories
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
        })
    }
}

// category page details
exports.categoryPageDetails=async (req,res)=>{
    try{
        // get category Id
        const {categoryId}=req.body;
        // get course for sepcified categoryId
        const selectedCategory=await Category.findById(categoryId)
        .populate("courses")
        .exec();

        // validation
        if(!selectedCategory){
            return res.status(404).json({
                success:false,
                message:"Category not found"
            })
        }
        // get course for diff categories
        const differentCategories=await Category.find({
            _id:{$ne:categoryId},
        })
        .populate("courses")
        .exec();
        // get top selling courses
        const topSellingCourses=await Course.find({
            studentsEnrolled:{$gt:50},
        })
        .sort({studentsEnrolled:-1})
        .limit(10)
        .populate("instructor");
        // return response
        return res.status(200).json({
            success:true,
            data:{
                selectedCategory,
                differentCategories,
                topSellingCourses
            }
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}