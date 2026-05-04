const Section=require("../models/Section");
const Course=require("../models/Course");

exports.createSection=async(req,res)=>{
    try {
        // data fetch
        const {sectionName, courseID}=req.body;
        // data validation
        if(!sectionName || !courseID){
            return res.status(400).json({
                success:false,
                message:"All Fields Are Required"
            })
        }
        // create section
        const newSection=await Section.create({sectionName:sectionName});
        // update course with Section ObjectID
        const updatedCourseDetails=await Course.findByIdAndUpdate(courseID, { $push: { courseContent: newSection._id } }, { new: true }).populate({
            path:"courseContent",
            populate:{
                path:"subSection",
            }
        }).exec();
        // return response
        return res.status(200).json({
            success:true,
            message:"Section Created Successfully",
            data:updatedCourseDetails
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"unable to create section",
            error:error.message
        })
    }
}

exports.updateSection=async(req,res)=>{
    try {
        // data fetch
        const {sectionName, sectionID}=req.body;
        // data validation 
        if(!sectionName || !sectionID){
            return res.status(400).json({
                success:false,
                message:"All Fields Are Required"
            })
        }
        // update section
        const updatedSection=await Section.findByIdAndUpdate(sectionID, {sectionName:sectionName}, { new: true });
        // return response
        return res.status(200).json({
            success:true,
            message:"Section Updated Successfully",
            data:updatedSection
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"unable to update section",
            error:error.message
        })
    }
}

exports.deleteSection=async(req,res)=>{
    try {
        // data fetch
        const {sectionID}=req.params;
        // data validation
        if(!sectionID){
            return res.status(400).json({
                success:false,
                message:"All Fields Are Required"
            })
        }
        
        // delete section
        await Section.findByIdAndDelete(sectionID);
        // TODO[Testing]: do we need to delete entry from the course schema?

        // return response
        return res.status(200).json({
            success:true,
            message:"Section Deleted Successfully",
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"unable to delete section",
            error:error.message
        })
    }
}
