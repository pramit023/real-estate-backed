import User from "../models/user_model.js";
import Property from "../models/property.model.js";
import Inquiry from "../models/inquiry.model.js";


// get all users
export const getAllUsers=async(req,res)=>{
  try{
    const users=await User.find().select("-password");
    res.json({
      success:true,
      count:users.length,
      users,
    });
  } catch(err){
    res.status(500).json({
     
      message:err.message
    });
  }
}   


// Block a particular user
export const blockUser=async(req,res)=>{
  try{
    const user=await User.findById(req.params.id);
    user.isBlocked=!user.isBlocked;
    await user.save();
    res.json({
      success:true,
      message: user.isBlocked ? "User blocked":"unblocked successfully",
      isBlocked:user.isBlocked,
    });
  } catch(err){
    res.status(500).json({
  
      message:err.message
    });
  }
}   

// to delete a particular user
export const deleteUser=async(req,res)=>{
  try{
    await User.findByIdAndDelete(req.params.id);
    res.json({
      success:true,
      message:"User deleted successfully",
    });
  } catch(error){
    res.status(500).json({
      message:error.message
    });
  } 
}

// view all pending properties for moderation (admin)
export const getAllProperties=async(req,res)=>{
  try{
    const properties=await Property.find({ isVerified: false }).populate("seller","name email");
    res.json({
      success:true,
      count:properties.length,
      properties,
    });
  } catch(err){
    res.status(500).json({
      message:err.message
    });
  }
}

export const verifyProperty=async(req,res)=>{
  try{
    const property=await Property.findById(req.params.id);
    if(!property){
      return res.status(404).json({
        success:false,
        message:"Property not found"
      });
    }

    property.isVerified=true;
    await property.save();

    res.json({
      success:true,
      message:"Property verified successfully",
      property,
    });
  } catch(err){
    res.status(500).json({
      message:err.message
    });
  }
}

//  to delete a property (admin)
export const deleteProperty=async(req,res)=>{
  try{  
    await Property.findByIdAndDelete(req.params.id);
    res.json({
      success:true,
      message:"Property deleted successfully",
    });
  } catch(err){
    res.status(500).json({
      message:err.message
    });
  }}

// to view all inquiries (admin)
export const getAllInquiries=async(req,res)=>{
  try{
    const inquiries=await Inquiry.find().populate("buyer","name email").populate("seller","name email").populate("property","title price").sort({createdAt:-1});
    res.json({
      success:true,
      count:inquiries.length,
      inquiries,
    });
  } catch(error){
    res.status(500).json({
      message:error.message
    });
  }}

  // dashboard analytics
export const getDashboardStats=async(req,res)=>{
  try{
    const totalUsers=await User.countDocuments();
    const totalProperties=await Property.countDocuments();
    const activeListings=await Property.countDocuments({
      status:"sale",
    });

    const soldProperties=await Property.countDocuments({
      status:"sold",
    });
    res.json({
      success:true,
      stats:{ 
        totalUsers,
        totalProperties,
        activeListings, 
        soldProperties,

      },
    });

  } catch(error){
    res.status(500).json({
      message:error.message
    });
  }
}

// to get pending seller account

export const getPendingSellers=async(req,res)=>{
  try{
    const pendingSellers=await User.find({role:"seller",isApproved:false}).select("-password");

    res.json({
      success:true,
      count:pendingSellers.length,
      pendingSellers,
    });

  }
  catch(err){
    res.status(500).json({
      message:err.message

    });
  }       
}

// to verify seller account

export const verifySeller=async(req,res)=>{ 
  try{
    const seller=await User.findById(req.params.id);
    if(!seller || seller.role!=="seller"){  
      return res.status(404).json({
        success:false,
        message:"Seller not found"
      });
    }
    seller.isApproved=true;
    await seller.save();
    res.json({
      success:true,
      message:"Seller verified successfully",
      seller
    });
  }
  catch(err){
    res.status(500).json({  
      
      message:err.message
    });
  } 
}




