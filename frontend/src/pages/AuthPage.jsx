import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { login, register } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, LogIn, UserPlus } from "lucide-react";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const { loginUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        const { data } = await login({ email: formData.email, password: formData.password });
        loginUser(data, data.token);
      } else {
        const { data } = await register(formData);
        loginUser(data, data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-main)"
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel"
        style={{ width: "400px", padding: "3rem" }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", color: "var(--primary-light)" }}>
            {isLogin ? "Welcome Back" : "Join The Circle"}
          </h1>
          <p style={{ color: "var(--text-dim)" }}>
            {isLogin ? "Sign in to your private frequency" : "Create your exclusive identity"}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {!isLogin && (
            <div style={inputContainerStyle}>
              <User size={20} color="var(--text-mute)" />
              <input
                type="text"
                placeholder="Full Name"
                style={inputStyle}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          )}
          {!isLogin && (
            <div style={inputContainerStyle}>
              <Lock size={20} color="var(--text-mute)" />
              <input
                type="text"
                placeholder="Invite Code"
                style={inputStyle}
                onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value })}
                required
              />
            </div>
          )}
          <div style={inputContainerStyle}>
            <Mail size={20} color="var(--text-mute)" />
            <input
              type="email"
              placeholder="Email Address"
              style={inputStyle}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div style={inputContainerStyle}>
            <Lock size={20} color="var(--text-mute)" />
            <input
              type="password"
              placeholder="Password"
              style={inputStyle}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          {error && <p style={{ color: "var(--accent-red)", fontSize: "0.9rem" }}>{error}</p>}

          <button type="submit" className="btn-primary" style={{ marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "2rem", color: "var(--text-dim)", fontSize: "0.9rem" }}>
          {isLogin ? "Don't have an invite?" : "Already in the circle?"}{" "}
          <span
            onClick={() => setIsLogin(!isLogin)}
            style={{ color: "var(--primary-light)", cursor: "pointer", fontWeight: "bold" }}
          >
            {isLogin ? "Apply" : "Sign In"}
          </span>
        </p>
      </motion.div>
    </div>
  );
};

const inputContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px 18px",
  borderRadius: "12px",
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid var(--glass-border)",
};

const inputStyle = {
  background: "none",
  border: "none",
  color: "var(--text-main)",
  fontSize: "1rem",
  width: "100%",
};

export default AuthPage;
