const User=require("../models/User");
const OTP=require("../models/Otp");
const otpGenerator=require("otp-generator");
const Profile = require("../models/Profile");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const { SubscriptIcon } = require("lucide-react");
require("dotenv").config();

// sendOTP
exports.sendOTP= async (req,res)=>{
    try{
        const {email}=req.body; // fetch email from req body
        const checkUserPresent=await User.findOne({email}); // checking if user exist or not
        // if user exist
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:"User already registered"
            })
        }
        // generate otp
        var otp=otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false
        })
        console.log("OTP : ",otp);

        // check unique otp or not
        let result=await OTP.findOne({otp});
        while(result){
            otp=otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false
            });
            result=await OTP.findOne({otp});
        }

        // create an entry in DB for OTP
        const otpPayload={
            email,
            otp
        }
        const otpBody= await OTP.create(otpPayload);
        console.log("otpBody : ",otpBody);
        
        res.status(200).json({
            success:true,
            message:"OTP sent successfully",
            otp
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error while sending OTP"
        })
    }
}

// signup
exports.signUp = async (req,res) => {
    try{
        // data fetch
        const {firstName,lastName,email,password,confrimPassword,accountType,contactNumber,otp}=req.body;

        // data validation
        if(!firstName || !lastName || !email || !password || !confrimPassword || !contactNumber || !otp){
            return res.status(401).json({
                success:false,
                message:"All fields are required"
            })
        }

        // compare two passwords
        if(password !== confrimPassword){
            return res.status(400).json({
                success:false,
                message:"Passwords do not match"
            })
        }   
        // user exist check
        const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User is alredy registered"
            })
        }
        // find most recent otp from user
        const recentOtp=await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log("recentOtp : ",recentOtp);

        // validate otp
        if(recentOtp.length===0){
            // OTP not found
            return res.status(400).json({
                success:false,
                message:"OTP not found"
            })
        }else if(otp !== recentOtp[0].otp){
            // Invalid OTP
            return res.status(400).json({
                success:false,
                message:"Invalid OTP"
            })
        }
        // Hash password
        const hashedPassword=await bcrypt.hash(password,10);

        // Create the user
		let approved = "";
		approved === "Instructor" ? (approved = false) : (approved = true);

        // create entry in DB
        const profileDetails=await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null
        })
        
        const user=await User.create({
            firstName,
            lastName,
            email,
            password:hashedPassword,
            accountType,
			approved: approved,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/9.x/initials/svg?seed=${firstName} ${lastName}`
        })
        // return res
        return res.status(200).json({
            success:true,
            message:"User created successfully",
            user
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error while creating user"
        })
    }
}

// login
exports.login = async (req,res)=>{
    try{
        // fetch data
        const {email,password}=req.body;
        // validation
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"All feild required, Plz try again"
            })
        }
        // check user extist
        const user=await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered"
            })
        }
        // generate JWT after password matched
        const payload={
            email:user.email,
            id:user._id,
            accountType:user.accountType
        }
        if(await bcrypt.compare(password,user.password)){
            const token= jwt.sign(payload,process.env.JWT_SECERT,{
                expiresIn:"24h"
            })
            user.token=token;
            user.password=undefined;
            // create cookie and send response
            const options={
                expires:new Date(Date.now()+3*24*60*60*1000),
                httpOnly:true
            }
            res.cookie("token",token,options).status(200).json({
                success:true,
                message:"User logged in successfully",
                token,
                user
            })
        }
        else{
            return res.status(401).json({
                success:false,
                password:"Password do not match"
            })
        }
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Login failure plz try again"
        })
    }
}

// changePassword
exports.changePassword = async (req,res) =>{
    try{
        // fetch data from req.body
        const {email}=req.body;
        if(!email){
            return res.status(401).json({
                success:false,
                message:"Email is required, Plz try again"
            })
        }
        // get oldPWD,newPWD,confrimNewPWD
        const {oldPassword,newPassword,confrimNewPassword}=req.body;
        // validation
        if(!oldPassword || !newPassword || !confrimNewPassword){
            return res.status(401).json({
                success:false,
                message:"All feild required, Plz try again"
            })
        }
        if(newPassword !== confrimNewPassword){
            return res.status(401).json({
                success:false,
                message:"Passwords do not match"
            })
        }
        // update newPWD in DB
        const user=await User.findOne({email});
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered"
            })
        }
        const hashedPassword=await bcrypt.hash(newPassword,10);
        user.password=hashedPassword;
        await user.save();
        // send mail - password update
        await mailSender(email, "Password Changed Successfully", "Your password has been changed successfully");
        // return response
        return res.status(200).json({
            success:true,
            message:"Password changed successfully"
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while change password"
        })
    }
}
