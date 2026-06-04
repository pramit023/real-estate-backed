import Property from "../models/property.model.js";
import Inquiry from "../models/inquiry.model.js";
import jwt from "jsonwebtoken";

import { v2 as cloudinary } from "cloudinary";

import uploadToCloudinary from "../utils/uploadToCloudinary.js";

const MAX_PROPERTY_IMAGES = 10;

// ADD PROPERTY
export const addProperty = async (req, res) => {
  try {

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      if (req.files.length > MAX_PROPERTY_IMAGES) {
        return res.status(400).json({
          success: false,
          message: `You can upload a maximum of ${MAX_PROPERTY_IMAGES} property images.`,
        });
      }

      for (let file of req.files) {

        const result = await uploadToCloudinary(
          file.buffer
        );

        imageUrls.push(result.secure_url);
      }
    }

    const property = await Property.create({

      title: req.body.title,
      description: req.body.description,
      price: Number(req.body.price),

      city: req.body.city,
      area: req.body.area,
      pincode: req.body.pincode,

      propertyType: req.body.propertyType,

      bhk: req.body.bhk
        ? String(req.body.bhk)
        : undefined,

      bathrooms: req.body.bathrooms
        ? Number(req.body.bathrooms)
        : undefined,

      areaSize: req.body.areaSize
        ? Number(req.body.areaSize)
        : undefined,

      furnishing: req.body.furnishing,

      status: req.body.status,

      images: imageUrls,

      seller: req.user._id,

      amenities: req.body.amenities
        ? Array.isArray(req.body.amenities)
          ? req.body.amenities
          : (() => {
              try {
                return JSON.parse(
                  req.body.amenities
                );
              } catch (e) {
                return req.body.amenities.split(",");
              }
            })()
        : [],
    });

    res.json({
      success: true,
      property,
    });

  } catch (error) {

    console.error(
      "ADD_PROPERTY_ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal server error while adding property",
    });
  }
};

// GET MY PROPERTIES
export const getMyProperties = async (
  req,
  res
) => {
  try {

    const properties = await Property.find({
      seller: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      properties,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE PROPERTY
export const updateProperty = async (
  req,
  res
) => {
  try {

    const property =
      await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (
      property.seller.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const fields = [
      "title",
      "description",
      "price",
      "city",
      "area",
      "pincode",
      "propertyType",
      "bhk",
      "bathrooms",
      "areaSize",
      "furnishing",
      "status",
      "amenities",
    ];

    fields.forEach((field) => {

      if (req.body[field] !== undefined) {

        if (
          field === "amenities" &&
          typeof req.body[field] === "string"
        ) {

          try {

            property[field] = JSON.parse(
              req.body[field]
            );

          } catch (e) {

            property[field] =
              req.body[field].split(",");
          }

        } else {

          property[field] =
            req.body[field];
        }
      }
    });

    if (req.files && req.files.length > 0) {
      const existingImages = property.images || [];

      if (existingImages.length + req.files.length > MAX_PROPERTY_IMAGES) {
        return res.status(400).json({
          success: false,
          message: `A property can have a maximum of ${MAX_PROPERTY_IMAGES} images. Remove existing images before adding more.`,
        });
      }

      let newImages = [];

      for (let file of req.files) {

        const result =
          await uploadToCloudinary(
            file.buffer
          );

        newImages.push(
          result.secure_url
        );
      }

      property.images = [
        ...existingImages,
        ...newImages,
      ];
    }

    await property.save();

    res.json({
      success: true,
      message: "Property updated",
      property,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE PROPERTY
export const deleteProperty = async (
  req,
  res
) => {
  try {

    const property =
      await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (
      property.seller.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    for (let imageUrl of property.images) {

      const publicId = imageUrl
        .split("/")
        .pop()
        .split(".")[0];

      await cloudinary.uploader.destroy(
        "properties/" + publicId
      );
    }

    await property.deleteOne();

    res.json({
      success: true,
      message: "Property deleted",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL PROPERTIES
export const getAllProperties = async (
  req,
  res
) => {
  try {

    const properties =
      await Property.find().populate(
        "seller",
        "name email"
      );

    res.json({
      success: true,
      properties,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET PROPERTY DETAILS
export const getPropertyDetails = async (
  req,
  res
) => {
  try {

    const property =
      await Property.findById(
        req.params.id
      ).populate(
        "seller",
        "name email phone profilePic"
      );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.json({
      success: true,
      property,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePropertyStatus = async (
  req,
  res
) => {
  try {

    const property =
      await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (
      property.seller.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const allowedStatuses = ["sale", "rent", "sold"];
    const nextStatus = req.body.status || "sold";

    if (!allowedStatuses.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property status",
      });
    }

    property.status = nextStatus;

    await property.save();

    res.json({
      success: true,
      message:
        "Property status updated",
      property,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET PROPERTY COUNTS
export const getPropertyCountsByType = async (
  req,
  res
) => {

  try {

    const counts = await Property.aggregate([
      {
        $group: {
          _id: "$propertyType",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const formattedCounts =
      counts.reduce((acc, curr) => {

        acc[curr._id] = curr.count;

        return acc;

      }, {});

    res.json({
      success: true,
      counts: formattedCounts,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SELLER DASHBOARD
export const getSellerDashboard = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const listings = await Property.find({ seller: sellerId })
      .sort({ createdAt: -1 })
      .lean();

    const totalViews = listings.reduce((sum, property) => sum + (property.views || 0), 0);
    const liveListings = listings.filter(
      (property) => property.isVerified && property.status !== "sold"
    ).length;
    const propertiesSold = listings.filter((property) => property.status === "sold").length;
    const pendingProperties = listings.filter((property) => !property.isVerified).length;
    const activeLeads = await Inquiry.countDocuments({ seller: sellerId, isRead: false });
    const totalLeads = await Inquiry.countDocuments({ seller: sellerId });

    const recentInquiries = await Inquiry.find({ seller: sellerId })
      .populate("buyer", "name email phone profilePic")
      .populate("property", "title price city")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      dashboard: {
        stats: {
          totalViews,
          activeLeads,
          liveListings,
          propertiesSold,
          totalProperties: listings.length,
          pendingProperties,
          totalLeads,
        },
        listings,
        recentProperties: listings.slice(0, 5),
        recentInquiries,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
