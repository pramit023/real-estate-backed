import Inquiry from "../models/inquiry.model.js";
import Property from "../models/property.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user_model.js";


export const sendInquiry=async(req,res)=>{
  try{
    const {propertyId,message}=req.body;
    
    // Validation
    if(!propertyId || !message || !message.trim()){
      return res.status(400).json({
        success:false,
        message:"Property ID and message are required"
      });
    }
    
    const property=await  Property.findById(propertyId).populate("seller");
    if(!property){
      return res.status(404).json({
        success:false,
        message:"Property not found"
      });
    }
    
    if(!property.seller){
      return res.status(400).json({
        success:false,
        message:"Property does not have a seller"
      });
    }
    
    // Check if inquiry already exists from this buyer for this property
    const existingInquiry = await Inquiry.findOne({
      property: propertyId,
      buyer: req.user._id
    });
    
    if(existingInquiry){
      return res.status(400).json({
        success:false,
        message:"You have already sent an inquiry for this property"
      });
    }
    
    const inquiry=await Inquiry.create({
      property:property._id,
      buyer:req.user._id,
      seller:property.seller._id,
      message:message.trim(),
    });

    // Populate the response for better data
    await inquiry.populate([
      { path: "buyer", select: "name email phone" },
      { path: "seller", select: "name email phone" },
      { path: "property", select: "title price city" }
    ]);

    // Create notification for seller
    await Notification.create({
      type: "inquiry",
      recipient: property.seller._id,
      recipientType: "seller",
      inquiry: inquiry._id,
      property: property._id,
      user: req.user._id,
      title: `New Inquiry from ${req.user.name}`,
      message: `${req.user.name} is interested in "${property.title}" and sent you a message`,
      actionUrl: `/seller/inquiries/${inquiry._id}`,
    });

    // Create notification for admin
    const admins = await User.find({ role: "admin" });
    for (let admin of admins) {
      await Notification.create({
        type: "inquiry",
        recipient: admin._id,
        recipientType: "admin",
        inquiry: inquiry._id,
        property: property._id,
        user: req.user._id,
        title: `New Inquiry on ${property.title}`,
        message: `Buyer ${req.user.name} sent inquiry for property "${property.title}" by seller ${property.seller.name}`,
        actionUrl: `/admin/inquiries/${inquiry._id}`,
      });
    }

    res.status(201).json({
      success:true,
      message:"Inquiry sent successfully",
      inquiry,
    });
  }
  catch(err){
    console.error("Error in sendInquiry:", err);
    res.status(500).json({
      success:false,
      message:err.message || "Failed to send inquiry"
    });
  }
}

// seller view inquires

export const getSellerInquiries=async(req,res)=>{
  try{
    const inquiries=await Inquiry.find({seller:req.user._id}).populate("buyer","name email phone").populate("property","title price images city").sort({createdAt:-1});
    res.json({
      success:true,
      count: inquiries.length,
      inquiries,
    });
  }
  catch(err){
    res.status(500).json({
      success:false,
      message:err.message
    });
  }
}

// mark inquiry as read
export const markAsRead=async(req,res)=>{
  try{
    const inquiry=await Inquiry.findById(req.params.id);
    if(!inquiry){
      return res.status(404).json({
        success:false,
        message:"Inquiry not found"
      });
    }
    inquiry.isRead=true;
    await inquiry.save();
    res.json({
      success:true,
      message:"Inquiry marked as read"
    });
  }
  catch(err){
    res.status(500).json({
      success:false,
      message:err.message
    });
  }
}
