import Inquiry from "../models/inquiry.model.js";
import Property from "../models/property.model.js";
import User from "../models/user_model.js";

// Get current seller approval status
export const getSellerStatus = async (req, res) => {
  try {
    const seller = await User.findById(req.user._id).select("-password");

    if (!seller || seller.role !== "seller") {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    res.json({
      success: true,
      seller,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all inquiries for seller
export const getSellerInquiries = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const inquiries = await Inquiry.find({
      seller: sellerId,
    })
      .populate("buyer", "name email phone profilePic")
      .populate("property", "title price city images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Inquiry.countDocuments({
      seller: sellerId,
    });

    res.json({
      success: true,
      inquiries,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get inquiry details
export const getInquiryDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user._id;

    const inquiry = await Inquiry.findById(id)
      .populate("buyer", "name email phone profilePic address")
      .populate("property", "title price city images description")
      .populate("seller");

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    // Check if seller owns this inquiry
    if (inquiry.seller._id.toString() !== sellerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this inquiry",
      });
    }

    // Mark as read
    if (!inquiry.isRead) {
      inquiry.isRead = true;
      await inquiry.save();
    }

    res.json({
      success: true,
      inquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark inquiry as read
export const markInquiryAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user._id;

    const inquiry = await Inquiry.findById(id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    // Check if seller owns this inquiry
    if (inquiry.seller.toString() !== sellerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    inquiry.isRead = true;
    await inquiry.save();

    res.json({
      success: true,
      message: "Inquiry marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
