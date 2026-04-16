const mongoose=require("mongoose"); // mongoose instance
require("dotenv").config(); // To access all the data from .ENV file

exports.connext = () =>{
    mongoose.connect(process.env.MONGODB_URL)  // connecting to the database
    .then(()=>{
        console.log("DB connected successfully"); // if db is connected successfully
    })
    .catch((error)=>{
        console.log("DB connection failed");  // if db is not connected successfully
        console.error(error);
        process.exit(1);   
    })
}