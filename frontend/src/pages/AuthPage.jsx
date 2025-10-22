import { useState, useEffect, useCallback, useMemo } from 'react';
import '../styles/AuthPage.css';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

const INITIAL_FORM = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  otp: "",
  newPassword: "",
};

const AuthPage = () => {
  const [mode, setMode] = useState("login");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [sendingOtp, setSendingOtp] = useState(false);
  const navigate = useNavigate();

  // ✅ useCallback prevents function re-creations on each render
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // ✅ Countdown optimized to avoid extra renders
  useEffect(() => {
    if (!otpSent || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setOtpSent(false);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [otpSent, countdown]);

  // ✅ Memoize formatted countdown
  const formattedCountdown = useMemo(() => {
    const m = Math.floor(countdown / 60).toString().padStart(2, '0');
    const s = (countdown % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, [countdown]);

  // ✅ OTP send logic optimized
  const handleSendOtp = useCallback(async () => {
    if (!formData.email) {
      toast.warn("Please enter your email");
      return;
    }

    try {
      setSendingOtp(true);
      const endpoint = mode === "register" ? "/auth/send-otp" : "/auth/forgot-password";
      const { data } = await api.post(endpoint, { email: formData.email });

      toast.success(data.message);
      setOtpSent(true);
      setCountdown(300); // 5 minutes
    } catch (error) {
      console.error("OTP error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to send OTP");
    }finally{
      setSendingOtp(false)
    }
  }, [formData.email, mode]);

  // ✅ Single optimized submit handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    try {
      if (mode === "register") {
        if (formData.password !== formData.confirmPassword)
          return toast.error("Passwords do not match");
        if (!otpSent)
          return toast.warn("Please send OTP first");

        const { data } = await api.post("/auth/verify-otp", {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          otp: formData.otp,
        });

        toast.success(data.message + " Please login now.");
        setOtpSent(false);
        setFormData(INITIAL_FORM);
        setMode("login");
      }

      else if (mode === "login") {
        const { data } = await api.post("/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        toast.success("Login successful!");
        setTimeout(() => navigate("/"), 1200);
      }

      else if (mode === "forgot") {
        if (!otpSent) return toast.warn("Please send OTP first");

        const { data } = await api.post("/auth/reset-password", {
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword,
        });

        toast.success(data.message);
        setOtpSent(false);
        setMode("login");
        setFormData(INITIAL_FORM);
      }
    } catch (error) {
      console.error("Submit error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Action failed");
    }
  }, [formData, mode, otpSent, navigate]);

  // ✅ Memoized title text
  const titleText = useMemo(() => {
    if (mode === "login") return "Login";
    if (mode === "register") return "Register with OTP";
    return "Forgot Password";
  }, [mode]);

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{titleText}</h2>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          {mode === "login" && (
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          )}

          {(mode === "register" || mode === "forgot") && !otpSent && (
            <button type="button" onClick={handleSendOtp}>
              {sendingOtp ? "Sending OTP..." : "Send OTP"}
            </button>
          )}

          {(mode === "register" || mode === "forgot") && otpSent && (
            <>
              <p>OTP sent! Expires in: {formattedCountdown}</p>

              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={formData.otp}
                onChange={handleChange}
                required
              />

              {mode === "register" && (
                <>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </>
              )}

              {mode === "forgot" && (
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Enter New Password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                />
              )}
            </>
          )}

          <button type="submit">
            {mode === "login"
              ? "Login"
              : mode === "register"
                ? "Register"
                : "Reset Password"}
          </button>
        </form>

        {mode !== "forgot" && (
          <p className="toggle-text">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <span
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setOtpSent(false);
              }}
            >
              {mode === "login" ? "Register" : "Login"}
            </span>
          </p>
        )}

        {mode === "login" && (
          <p className="toggle-text">
            Forgot your password?{" "}
            <span
              onClick={() => {
                setMode("forgot");
                setOtpSent(false);
              }}
            >
              Reset
            </span>
          </p>
        )}

        {mode === "forgot" && (
          <p className="toggle-text">
            Remember your password?{" "}
            <span
              onClick={() => {
                setMode("login");
                setOtpSent(false);
              }}
            >
              Back to Login
            </span>
          </p>
        )}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default AuthPage;
