import mongoose from "mongoose";

const userSchema= new mongoose.Schema({
  name:{
    type:String,
    required:true,
  },
  email:{
    type:String,
    required:true,
    unique:true
  },
  password:{
    type:String,
    required:true,
  },
  role:{
    type:String,
    enum:["buyer","seller","admin"],
    default:"buyer",
    index:true
  },
  phone:{
    type:String,
  },
  address: {
    type: String,
  },
  isBlocked:{
    type:Boolean,
    default:false
  },
  profilePic:{
    type:String
  },
  isApproved:{
    type:Boolean,
    default:true
  },
  isVerified:{
    type:Boolean,
    default:false,
    index:true
  },
  verificationToken:{
    type:String,
  },
  resetPasswordToken:{
    type:String,
  },
  resetPasswordExpire:{
    type:Date,
  },
  bio: {
    type: String,
  },
  companyName: {
    type: String,
  },
  websiteUrl: {
    type: String,
  },
} ,{
  timestamps:true
});

const User=mongoose.model("user",userSchema);

export default User;