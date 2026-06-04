import express from 'express';
import { authorize,protect } from '../middlewares/auth.middleware.js';
import { blockUser, deleteUser, getAllProperties, deleteProperty, verifyProperty, getAllUsers, getDashboardStats, getPendingSellers, getAllInquiries, verifySeller } from '../controllers/admin.controller.js';


const adminRouter=express.Router();

adminRouter.use(protect,authorize ("admin"));
adminRouter.get("/users",getAllUsers);
adminRouter.patch("/users/:id/block",blockUser);
adminRouter.delete("/users/:id",deleteUser);
adminRouter.get("/properties",getAllProperties);
adminRouter.patch("/properties/:id/verify",verifyProperty);
adminRouter.delete("/properties/:id",deleteProperty); 
adminRouter.get("/inquiries",getAllInquiries);

adminRouter.get("/dashboard-stats",getDashboardStats);
adminRouter.get("/pending-sellers",getPendingSellers);
adminRouter.patch("/verify-seller/:id",verifySeller);
export default adminRouter;
