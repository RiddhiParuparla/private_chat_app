const Message = require("../models/Message");

// @desc    Get chat history between two users
// @route   GET /api/messages/:otherUserId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Send a new message (API version - usually handled by Socket, but good for media)
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, mediaUrl } = req.body;
    const senderId = req.user.id;

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
      mediaUrl,
    });

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
