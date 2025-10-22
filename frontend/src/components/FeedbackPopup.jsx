import { useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import "./FeedbackPopup.css";

const FeedbackPopup = ({ isOpen, onClose }) => {
  const [name, setName] = useState(""); // will be filled automatically
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  // 👇 Get name from localStorage when popup opens
  useEffect(() => {
    if (isOpen) {
      const storedName = localStorage.getItem("username");
      console.log(storedName)
      if (storedName) {
        setName(storedName);
      } else {
        toast.warning("Please Login to Feedback us");
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message || !rating) {
      toast.error("Please fill all fields!");
      return;
    }

    try {
      setLoading(true);
      await api.post("/feedback", { name, message, rating });
      toast.success("Thanks for your feedback!");
      setMessage("");
      setRating(0);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Please Login to Feedback Us")
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-overlay" onClick={onClose}>
      <div className="feedback-popup" onClick={(e) => e.stopPropagation()}>
        <h2>Send Feedback</h2>
        <form onSubmit={handleSubmit}>
          {/* 👇 Removed name input */}
          <textarea
            placeholder="Drop Your Feedback"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>

          <div className="rating">
            {[1, 2, 3, 4, 5].map((num) => (
              <span
                key={num}
                className={num <= rating ? "star selected" : "star"}
                onClick={() => setRating(num)}
              >
                ★
              </span>
            ))}
          </div>

          <button type="submit" disabled={loading} className="feedback-submit-btn">
            {loading ? "Sending..." : "Submit"}
          </button>
        </form>
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
      </div>
    </div>
  );
};

export default FeedbackPopup;
