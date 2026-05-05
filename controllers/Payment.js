const {instance}=require("../config/razorpay");
const Course=require("../models/Course");
const USer=require("../models/User");
const mailSender=require("../utils/mailSender");
const {courseEnrollmentEmail}=require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");

// capture the payment and initiate the razorpay order
exports.capturePayment =async (req,res)=>{
    // get course id and user id
    const {course_id}=req.body;
    const userId=req.user.id;

    // validation
    // valid courseID
    if(!course_id){
        return res.status(400).json({
            success:false,
            message:"Please provide course id"
        });
    }
    // valid courseDetails
    let course;
    try{
        course=await Course.findById(course_id);
        if(!course){
            return res.json({
                success:false,
                message:"Course not found"
            });
        }
        // user already pay for same course
        const uid=new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)){
            return res.status(200).json({
                success:false,
                message:"Student is already enrolled"
            })
        }
    }catch(error){
         return res.status(500).json({
            success:false,
            message:error.message
         });
    }
    
    // create order
    const amount=course.price;
    const currency="INR";

    const option={
        amount:amount*100,
        currency,
        receipt:Math.random(Date.now()).toString(),
        notes:{
            courseId:course_id,
            userId
        }
    }

    try{
        // initiate the payment using razorpay
        const paymentResponse=await instance.orders.create(option);
        console.log("Payment Response : ",paymentResponse);
        // return response
        return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail:course.thumbnail,
            orderId:paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount,
            message:"Order Id created successfully",

        })
    }catch(error){
        console.log(error);
        return res.json({
            success:false,
            message:"Could not inititate order",            
        })
    }
    // return response
}

// verify signature of razorpay and sever
exports.verifySignature = async (req,res) => {
    const webhookSecret="1234567";
    const signature=req.headers["x-razorpay-signature"];

    const shasum=crypto.createHmac("sha256",webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest=shasum.digest("hex");

    if(digest === signature){
        console.log("Payment Verified");

        const {courseId,userId}=req.body.payload.payment.entity.notes;
        
        try{
            // fulfil the action

            // find the course and enrolled the student in it
            const enrolledCourse =await Course.findOneAndUpdate(
                {_id:courseId},
                {$push:{studentsEnrolled:userId}},
                {new:true}
            );
            console.log("Enrolled course : ",enrolledCourse);
            if(!enrolledCourse){
                return res.status(500).json({
                    success:false,
                    message:"Course not found"
                });
            }


            // find the user and add the courses
            const enrolledStudent =await User.findOneAndUpdate(
                {_id:userId},
                {$push:{courses:courseId}},
                {new:true}
            );
            console.log("user : ",enrolledStudent);

            //send mail
            const emailResponse=await mailSender(enrolledStudent.email,
                `Course Enrollment - ${enrolledCourse.courseName}`,
                courseEnrollmentEmail(enrolledCourse.courseName,enrolledStudent.email)
            );
            console.log("Email response : ",emailResponse);
            
            return res.status(200).json({
                success:true,
                message:"Payment verified and course enrolled successfully"
            })

        }catch(error){
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message
            });
        }
        
    }else{
        return res.status(400).json({
            success:false,
            message:"Invalid signature"
        });
    }
    
}