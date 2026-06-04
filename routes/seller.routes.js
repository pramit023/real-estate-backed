import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import {
  getSellerStatus,
  getSellerInquiries,
  getInquiryDetails,
  markInquiryAsRead,
} from '../controllers/seller.controller.js';

const sellerRouter = express.Router();

// Protected routes - require seller authentication
sellerRouter.use(protect, authorize('seller'));

// Get seller account status
sellerRouter.get('/status', getSellerStatus);

// Get all inquiries for seller
sellerRouter.get('/inquiries', getSellerInquiries);

// Get specific inquiry details
sellerRouter.get('/inquiries/:id', getInquiryDetails);

// Mark inquiry as read
sellerRouter.patch('/inquiries/:id/read', markInquiryAsRead);

export default sellerRouter;
