import mongoose from "mongoose";
import Property from "./property.model.js";

const wishlistSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    Property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      
    }
  });

  const Wishlist = mongoose.model("Wishlist", wishlistSchema);

  export default Wishlist;
