import mongoose from "mongoose";

export const connectDB= async()=>{
  const mongoUri = process.env.MONGO_URI || "mongodb+srv://pramitpriyanshu16_db_user:Pramit23@cluster0.zyfcue6.mongodb.net/RealEstate";

  await mongoose.connect(mongoUri).then(()=>{
    console.log("DB Connected")
  })
}
