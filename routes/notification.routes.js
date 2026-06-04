import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
} from '../controllers/notification.controller.js';

const notificationRouter = express.Router();

// Protected routes - require authentication
notificationRouter.use(protect);

// Get all notifications for current user
notificationRouter.get('/', getNotifications);

// Get unread count
notificationRouter.get('/unread/count', getUnreadCount);

// Mark specific notification as read
notificationRouter.patch('/:id/read', markNotificationAsRead);

// Mark all notifications as read
notificationRouter.patch('/read/all', markAllNotificationsAsRead);

// Delete notification
notificationRouter.delete('/:id', deleteNotification);

export default notificationRouter;
