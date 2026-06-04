import Wishlist from "../models/wishlist.model.js";

// to add property to wishlist
export const addWishlist=async(req,res)=>{
  try{
    const propertyId=req.params.propertyId || req.body.propertyId;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: "Property id is required",
      });
    }

    const existing= await Wishlist.findOne({user:req.user._id,Property:propertyId});
    if(existing){
      return res.status(400).json({
        success:true,
        message:"Property already in wishlist"
      });
    }

    await Wishlist.create({
      user:req.user._id,
      Property:propertyId,
    });
     res.status(201).json({

      success:true,
      message:"Property added to wishlist"
    });
  } catch (err) {
    res.status(500).json({
      success:false,
      message:err.message
    });
  }
}

// to get user wishlist

export const getWishlist=async(req,res)=>{

  try{
    const data= await Wishlist.find({user:req.user._id}).populate("Property");
    const normalizedWishlist = data.map((item) => ({
      ...item.toObject(),
      property: item.Property,
    }));

    res.status(200).json(normalizedWishlist);

  }

  catch(err){
    res.status(500).json({
      success:false, 
      message:err.message
    });
  } 


} 
// to remove property from wishlist

export const removeWishlist=async(req,res)=>{
  try{
    const propertyId=req.params.propertyId;
    const result=await Wishlist.findOneAndDelete({user:req.user._id,Property:propertyId});
    if(!result){
      return res.status(404).json({
        success:false,
        message:"Property not found in wishlist"
      });
    }
    res.status(200).json({
      success:true,
      message:"Property removed from wishlist"
    });
  } catch (err) {
    res.status(500).json({
      success:false,
      message:err.message
    });
  }
}
