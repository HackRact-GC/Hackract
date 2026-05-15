import * as service from "./notification.service.js";

export const list = async (req, res) => {
  try {
    const notifications = await service.getNotifications(req.user.id);
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markRead = async (req, res) => {
  try {
    await service.markRead(req.params.id, req.user.id);
    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllRead = async (req, res) => {
  try {
    await service.markAllRead(req.user.id);
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    await service.remove(req.params.id, req.user.id);
    res.json({ success: true, message: "Notification removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
