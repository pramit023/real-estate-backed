import mongoose from "mongoose";

export const connectDB= async()=>{
  await mongoose.connect("mongodb+srv://pramitpriyanshu16_db_user:Pramit23@cluster0.zyfcue6.mongodb.net/RealEstate").then(()=>{
    console.log("DB Connected")
  })
}