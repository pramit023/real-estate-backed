import express from 'express';
import Chat from '../models/chat.model.js';
import Property from '../models/property.model.js';
import { protect } from '../middlewares/auth.middleware.js';

const chatRouter = express.Router();
chatRouter.use(protect);

const populateChat = (query) =>
  query
    .populate('buyer', 'name email phone profilePic')
    .populate('seller', 'name email phone profilePic')
    .populate('property', 'title price images city');

// Create or return an existing chat between buyer and seller.
chatRouter.post('/start', async (req, res) => {
  try {
    const { propertyId, sellerId, buyerId: providedBuyerId } = req.body;
    let finalBuyerId;
    let finalSellerId;

    if (req.user.role === 'seller') {
      finalBuyerId = providedBuyerId;
      finalSellerId = req.user._id;
    } else {
      finalBuyerId = req.user._id;
      finalSellerId = sellerId;
    }

    if (!propertyId || !finalBuyerId || !finalSellerId) {
      return res.status(400).json({
        success: false,
        message: 'Property, buyer and seller are required.',
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    let chat = await Chat.findOne({
      property: propertyId,
      buyer: finalBuyerId,
      seller: finalSellerId,
    });

    if (!chat) {
      chat = await Chat.create({
        property: propertyId,
        buyer: finalBuyerId,
        seller: finalSellerId,
        messages: [],
      });
    }

    chat = await populateChat(Chat.findById(chat._id));
    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Send a message in an existing chat.
chatRouter.post('/send', async (req, res) => {
  try {
    const { chatId, text, image } = req.body;
    const userId = req.user._id;

    if (!chatId || (!text?.trim() && !image)) {
      return res.status(400).json({
        success: false,
        message: 'Chat and message text are required.',
      });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    if (chat.buyer.toString() !== userId.toString() && chat.seller.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    chat.messages.push({
      sender: userId,
      text: text?.trim() || '',
      image,
      createdAt: new Date(),
    });

    await chat.save();

    const populatedChat = await populateChat(Chat.findById(chat._id)).populate('messages.sender', 'name profilePic');
    const newMessage = populatedChat.messages[populatedChat.messages.length - 1];

    res.json({ success: true, chat: populatedChat, newMessage });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Get all chats for the current user.
chatRouter.get('/user', async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await populateChat(
      Chat.find({
        $or: [{ buyer: userId }, { seller: userId }],
      }).sort({ updatedAt: -1 })
    ).populate('messages.sender', 'name profilePic');

    res.json({ success: true, chats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching messages', error: err.message });
  }
});

// Get messages for a specific chat.
chatRouter.get('/:chatId', async (req, res) => {
  try {
    const chat = await populateChat(Chat.findById(req.params.chatId)).populate('messages.sender', 'name profilePic');
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    const userId = req.user._id.toString();
    if (chat.buyer._id.toString() !== userId && chat.seller._id.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching messages', error: err.message });
  }
});

// Delete a chat.
chatRouter.delete('/:chatId', async (req, res) => {
  try {
    const userId = req.user._id;
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    if (chat.buyer.toString() !== userId.toString() && chat.seller.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await Chat.findByIdAndDelete(req.params.chatId);
    res.json({ success: true, message: 'Chat deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting chat', error: err.message });
  }
});

// Delete a message.
chatRouter.delete('/:chatId/message/:messageId', async (req, res) => {
  try {
    const userId = req.user._id;
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    const message = chat.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    chat.messages.pull(req.params.messageId);
    await chat.save();

    res.json({ success: true, message: 'Message deleted successfully', chat });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting message', error: err.message });
  }
});

export default chatRouter;
