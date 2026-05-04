const profile=require("../models/Profile");
const User=require("../models/User");

exports.updateProfile=async(req,res)=>{
    try {
        // data fetch
        const {dateOfBirth="",gender,about="",contactNumber}=req.body;
        const id=req.user.id;
        // validation
        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success:false,
                message:"All Fields Are Required"
            })
        }
        // find user details
        const userDetails=await User.findById(id);
        const profileId=userDetails.additionalDetails;
        const profileDetails=await profile.findById(profileId);
        if(!userDetails){
            return res.status(400).json({
                success:false,
                message:"User Details Not Found"
            })
        }
        
        // update profile
        profileDetails.contactNumber=contactNumber;
        profileDetails.gender=gender;
        profileDetails.dateOfBirth=dateOfBirth;
        profileDetails.about=about;  
        await profileDetails.save();

        // return response
        return res.status(200).json({
            success:true,
            message:"Profile Updated Successfully",
            profileDetails

        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Unable to update profile",
            error:error.message
        })
    }
}

// TODO : how can we schedule deletion of account
// TODO : cron job 
exports.deleteAccount=async(req,res)=>{
    try {
        // get ID
        const id=req.user.id;    
        // validation
        const userDetails=await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"User Details Not Found"
            })
        }
        // delete profile
        await profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        // TODO : unenroll user from all enrolled courses
        
        // delete user
        await User.findByIdAndDelete({_id:id});
        // return  response
        return res.status(200).json({
            success:true,
            message:"Account Deleted Successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Unable to delete account",
            error:error.message
        })        
    }
}

exports.getAllUserDetails=async(req,res)=>{
    try {
        // get ID
        const id=req.user.id;    
        // validation
        const userDetails=await User.findById(id).populate("additionalDetails").exec();
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"User Details Not Found"
            })
        }
        // return response
        return res.status(200).json({
            success:true,
            message:"User Details Fetched Successfully",
            userDetails
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })        
    }
}