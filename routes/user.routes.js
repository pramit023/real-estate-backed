import express from "express";

import { protect } from "../middlewares/auth.middleware.js";
import { getProfile, getPublicProfile, updateProfile, deleteProfile } from "../controllers/user.controller.js";
import upload from "../middlewares/upload.middleware.js";

const userRouter = express.Router();

userRouter.get("/profile", protect, getProfile);
userRouter.put("/profile", protect, upload.single("profilePic"), updateProfile);
userRouter.delete("/profile", protect, deleteProfile);
userRouter.get("/profile/:id", getPublicProfile);

export default userRouter;
