const subSection=require("../models/SubSection");
const Section=require("../models/Section");
const {uploadToCloudinary}=require("../utils/fileUploader");

exports.createSubSection=async(req,res)=>{
    try {
        // data fetch
        const {title,timeDuration,description,sectionID}=req.body;
        // extract file/video
        const video=req.files.videoFile;
        // data validation
        if(!title || !timeDuration || !description || !sectionID || !video){
            return res.status(400).json({
                success:false,
                message:"All Fields Are Required"
            })
        }
        // upload to cloudinary
        const uploadDetails=await uploadToCloudinary(video,process.env.FOLDER_NAME);
        // create sub section
        const subSectionDetails=await subSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoURL:uploadDetails.secure_url,
            sectionID:sectionID
        });
        // update section with sub section ID  
        const updatedSection=await Section.findByIdAndUpdate(
            {_id:sectionID},
            {$push:{subSection:subSectionDetails._id}},
            {new:true}
        )  
        .populate({path:"subSection",model:"SubSection"})
        .exec();
        // return response
        return res.status(200).json({
            success:true,
            message:"SubSection Created Successfully",
            data:updatedSection
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"unable to create sub section",
            error:error.message
        })
    }
}

// Update subsection

// delete subsection