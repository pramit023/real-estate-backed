
import express from "express";
import multer from "multer";

import {
  addProperty,
  deleteProperty,
  getAllProperties,
  getMyProperties,
  getPropertyDetails,
  updateProperty,
  updatePropertyStatus,
  getPropertyCountsByType,
  getSellerDashboard
} from "../controllers/property.controller.js";

import {
  authorize,
  protect
} from "../middlewares/auth.middleware.js";

import upload from "../middlewares/upload.middleware.js";

const propertyRouter = express.Router();

const uploadPropertyImages = (req, res, next) => {
  upload.array("images", 10)(req, res, (error) => {
    if (!error) return next();

    const message =
      error instanceof multer.MulterError && (error.code === "LIMIT_FILE_COUNT" || error.code === "LIMIT_UNEXPECTED_FILE")
        ? "You can upload a maximum of 10 property images."
        : error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE"
          ? "Each property image must be 5MB or smaller."
          : error.message || "Unable to upload property images.";

    return res.status(400).json({
      success: false,
      message,
    });
  });
};

// GET ALL PROPERTIES
propertyRouter.get("/", getAllProperties);

// PROPERTY COUNTS - Static route (before :id)
propertyRouter.get(
  "/counts",
  getPropertyCountsByType
);

// SELLER DASHBOARD - Static route (before :id) 
propertyRouter.get(
  "/seller/dashboard",
  protect,
  authorize("seller"),
  getSellerDashboard
);

// ADD PROPERTY
propertyRouter.post(
  "/my",
  protect,
  authorize("seller"),
  uploadPropertyImages,
  addProperty
);

// GET MY PROPERTIES
propertyRouter.get(
  "/my",
  protect,
  authorize("seller"),
  getMyProperties
);

// UPDATE PROPERTY - Dynamic route with :id
propertyRouter.put(
  "/:id",
  protect,
  authorize("seller"),
  uploadPropertyImages,
  updateProperty
);

// DELETE PROPERTY - Dynamic route with :id
propertyRouter.delete(
  "/:id",
  protect,
  authorize("seller"),
  deleteProperty
);

// UPDATE STATUS - Dynamic route with :id
propertyRouter.patch(
  "/:id/status",
  protect,
  authorize("seller"),
  updatePropertyStatus
);

// PROPERTY DETAILS - Generic :id route (MUST be last)
propertyRouter.get("/:id", getPropertyDetails);

export default propertyRouter;
