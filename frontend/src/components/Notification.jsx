import { useEffect, useState } from "react";
import api from "../services/api";
import { FaBell } from "react-icons/fa";
import "./Notification.css";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(document.body.classList.contains("dark"));
  const token = localStorage.getItem("token");

  // Watch for dark mode changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.body.classList.contains("dark"));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          fontSize: "22px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          position: "relative",
          marginTop: "5px",
        }}
      >
        <FaBell size={24} color={isDark ? "white" : "#696767ff"} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-5px",
              right: "-3px",
              background: "red",
              color: "white",
              borderRadius: "100%",
              padding: "2px 4px",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notifications-container">
          <h4 style={{ marginBottom: "10px" }}>Notifications</h4>
          {notifications.length === 0 ? (
            <p>No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                style={{
                  padding: "8px",
                  background: n.read ? "transparent" : "#333",
                  borderBottom: "1px solid #444",
                  cursor: "pointer",
                }}
              >
                <p style={{ margin: 0 }}>
                  <strong>{n.senderUserId?.username}</strong>{" "}
                  {n.type === "like" ? "liked" : "commented on"} your post{" "}
                  <strong>{n.postId?.title}</strong>
                </p>
                <small>{new Date(n.createdAt).toLocaleString()}</small>
              </div>
            ))
          )}
        </div>
      )
      }
    </div >
  );
};

export default Notification;
