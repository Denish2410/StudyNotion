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