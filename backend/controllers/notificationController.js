// ES Modules
import Notification from "../models/Notification.js";

export const getMyNotifications = async (req, res) => {
    try{
        const notifications = await Notification.find({ recipientUserId: req.user._id})
            .populate("senderUserId", "username")
            .populate("postId", "title")
            .sort({ createdAt: -1 });

        res.json(notifications);
    } catch(err){
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const markAsRead = async (req, res) => {
    try{
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ message: "Notificaction marked as read" });
    }catch(err){
        res.status(500).json({ message: "Server error", error: err.message });
    }
};