import React from "react";
import { LogOut, Settings, MessageSquare } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ users, selectedUser, onSelect }) => {
  const { user, logoutUser } = useAuth();

  return (
    <div className="glass-panel" style={{ 
      width: "350px", 
      height: "100%", 
      borderRadius: "0", 
      borderRight: "1px solid var(--glass-border)",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* User Info Header */}
      <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--glass-border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.4rem", color: "var(--primary-light)" }}>Circle</h2>
          <div style={{ display: "flex", gap: "10px" }}>
            <button style={iconBtnStyle} title="Settings">
              <Settings size={20} color="var(--text-dim)" />
            </button>
            <button style={iconBtnStyle} onClick={logoutUser} title="Logout">
              <LogOut size={20} color="var(--accent-red)" />
            </button>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={avatarStyle}>{user.name[0]}</div>
          <div>
            <div style={{ fontWeight: "600", fontSize: "0.95rem" }}>{user.name}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-mute)" }}>{user.email}</div>
          </div>
        </div>
      </div>

      {/* Search / Tabs (Static for now) */}
      <div style={{ padding: "1rem 1.5rem" }}>
        <div style={{ 
          background: "rgba(255, 255, 255, 0.03)", 
          padding: "10px 15px", 
          borderRadius: "10px", 
          fontSize: "0.9rem",
          color: "var(--text-mute)",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <MessageSquare size={16} />
          Messages
        </div>
      </div>

      {/* Users List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem" }}>
        {users.map((u) => (
          <div
            key={u._id}
            onClick={() => onSelect(u)}
            style={{
              ...contactItemStyle,
              background: selectedUser?._id === u._id ? "rgba(255,255,255,0.05)" : "transparent",
              borderColor: selectedUser?._id === u._id ? "var(--primary)" : "transparent"
            }}
          >
            <div style={{ ...avatarStyle, background: selectedUser?._id === u._id ? "var(--primary)" : "var(--bg-chat)" }}>
              {u.name[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "500" }}>{u.name}</span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-mute)" }}>12:45 PM</span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-mute)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "180px" }}>
                Hey, are you around?
              </div>
            </div>
            {u.status === "online" && <div style={onlineDotStyle} />}
          </div>
        ))}
      </div>
    </div>
  );
};

const iconBtnStyle = {
  background: "rgba(255, 255, 255, 0.05)",
  padding: "8px",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const avatarStyle = {
  width: "45px",
  height: "45px",
  borderRadius: "14px",
  background: "var(--bg-chat)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.2rem",
  fontWeight: "bold",
  border: "1px solid var(--glass-border)",
  transition: "all 0.3s ease"
};

const contactItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
  padding: "12px 1rem",
  margin: "4px 8px",
  borderRadius: "14px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  position: "relative",
  border: "1px solid transparent"
};

const onlineDotStyle = {
  width: "10px",
  height: "10px",
  background: "var(--accent-green)",
  borderRadius: "50%",
  position: "absolute",
  right: "1rem",
  top: "50%",
  transform: "translateY(-50%)",
  boxShadow: "0 0 10px var(--accent-green)"
};

export default Sidebar;
