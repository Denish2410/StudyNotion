const User=require("../models/User");
const mailSender=require("../utils/mailSender");
const crypto=require("crypto");
const bcrypt=require("bcrypt");


// resetpassword token
exports.resetPasswordToken = async (req,res) =>{
    try{
        // get email from req.body
        const email=req.body.email;
        // check user's email validation
        const user=await User.findOne({email});
        if(!user){
            return res.json({
                message:false,
                success:"your email is not registered"
            })
        }
        // generate token
        const token=crypto.randomUUID();
        // update user by adding token and expiration time
        const updatedDetails=await User.findOneAndUpdate({email:email},{token:token,resetPasswordExpires:Date.now()+5*60*1000},{new:true});
        // create url
        const url=`https://localhost:3000/update-password/${token}`;
        // send email to user
        await mailSender(email, "Reset Password", url);
        // return response
        return res.status(200).json({
            success:true,
            message:"Reset password link sent successfully"
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            message:false,
            success:"something went wrong while reset password"
        })
    }
}

// resetpassword
exports.resetPassword = async (req,res)=>{
    try{
        // fetch data
        const {password,confirmPassword,token}=req.body;
        // validation
        if(password!==confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Passwords do not match"
            })
        }
        // get user details
        const userDetails=await User.findOne({token:token});
        // if no entry - invalid token
        if(!userDetails){
            return res.status(400).json({
                success:false,
                message:"Invalid token"
            })
        }
        // token time checking
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.status(400).json({
                success:false,
                message:"Token is expired,plz regenrate token"
            })
        }
        // hash password
        const hashedPassword=await bcrypt.hash(password,10);
        // password update
        await User.findOneAndUpdate({token:token}, {password:hashedPassword},{new:true});
        // return res
        return res.status(200).json({
            success:true,
            message:"Password reset successfully"
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while reset password"
        })
    }
}