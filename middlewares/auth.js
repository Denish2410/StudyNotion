const jwt=require("jsonwebtoken");
require("dotenv").config();
const User=require("../models/User");

// auth
exports.auth = async (req,res,next) =>{
    try{
        // extract token
        const token=req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ","");
        if(!token){
            return res.status(401).json({
                success: false,
                message:"Token not found"
            })
        }
        // verfiy token
        try{
            const decode=jwt.verify(token,process.env.JWT_SECERT);
            console.log("decode : ",decode);
            req.user=decode;
        }catch(error){
            return res.status(401).json({
                success:false,
                message:"Token is invalid"
            })
        }
        next();
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Something went wrong"
        });
    }
}
// isStudent
exports.isStudent=(req,res,next)=>{
    try{
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message:"This is protected route for student only"
            })
        }
        next();
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Something went wrong"
        });
    }
}

// isInstrutor
exports.isInstructor=(req,res,next)=>{
    try{
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message:"This is protected route for instructor only"
            })
        }
        next();
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Something went wrong"
        });
    }
}

// isAdmin
exports.isAdmin=(req,res,next)=>{
    try{
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success:false,
                message:"This is protected route for admin only"
            })
        }
        next();
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Something went wrong"
        });
    }
}