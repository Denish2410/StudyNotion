const mongoose=require("mongoose");
const mailSender=require("../utils/mailSender");
const otpSchema=new mongoose.Schema({
    email:{
        type:String,
        require:true,
        trim:true
    },
    otp:{
        type:String,
        require:true,
        trim:true
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:60*5
    }
});

// a fxn to send email
async function sendVerificationEmail(email,otp){
    try{
        const mailRespone=await mailSender(email,"Verification Email",otp);
        console.log("Mail Respone",mailRespone);
    }catch(error){
        console.log("error occured while sending mail",error);
        console.log(error);
        throw error;
    }
}

otpSchema.pre("save",async function(next){
    await sendVerificationEmail(this.email,this.otp);
});




module.exports=mongoose.model("Otp",otpSchema);