import React, { useState } from "react";
import { Send, Paperclip, Smile } from "lucide-react";
import { socket } from "../socket/socket";
import { useAuth } from "../context/AuthContext";

import API from "../services/api";

import EmojiPicker from "emoji-picker-react";

const MessageInput = ({ receiverId }) => {
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  // Typing Logic
  let typingTimeout;
  const handleTyping = () => {
    socket.emit("typing", { senderId: user._id, receiverId });
    
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit("stop_typing", { senderId: user._id, receiverId });
    }, 2000);
  };

  const onEmojiClick = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    socket.emit("send_message", {
      sender: user._id,
      receiver: receiverId,
      content: message,
      mediaUrl: ""
    });
    
    setMessage("");
    setShowEmoji(false);
    socket.emit("stop_typing", { senderId: user._id, receiverId });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await API.post("/upload", formData);

      socket.emit("send_message", {
        sender: user._id,
        receiver: receiverId,
        content: "",
        mediaUrl: data.url
      });
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ padding: "1.5rem", background: "var(--bg-chat)", borderTop: "1px solid var(--glass-border)", position: "relative" }}>
      
      {/* Emoji Picker Popover */}
      {showEmoji && (
        <div style={{ position: "absolute", bottom: "100%", right: "1.5rem", marginBottom: "10px", zIndex: 1000 }}>
          <div className="glass-panel" style={{ padding: "10px", borderRadius: "16px" }}>
            <EmojiPicker 
              onEmojiClick={onEmojiClick} 
              theme="dark" 
              lazyLoadEmojis={true}
              searchDisabled={false}
              skinTonesDisabled={true}
              height={400}
            />
          </div>
        </div>
      )}

      <form onSubmit={handleSend} style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "15px",
        background: "rgba(255, 255, 255, 0.05)",
        padding: "8px 15px",
        borderRadius: "16px",
        border: "1px solid var(--glass-border)"
      }}>
        <label style={actionBtnStyle}>
          <Paperclip size={20} color={isUploading ? "var(--primary)" : "var(--text-mute)"} />
          <input type="file" style={{ display: "none" }} onChange={handleFileUpload} disabled={isUploading} />
        </label>
        
        <input 
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          placeholder={isUploading ? "Uploading file..." : "Type a secure message..."}
          style={inputStyle}
          disabled={isUploading}
        />

        <button 
          type="button" 
          style={{ ...actionBtnStyle, background: showEmoji ? "rgba(255,255,255,0.1)" : "none" }}
          onClick={() => setShowEmoji(!showEmoji)}
        >
          <Smile size={20} color={showEmoji ? "var(--primary-light)" : "var(--text-mute)"} />
        </button>

        <button type="submit" disabled={!message.trim()} style={{
          ...sendBtnStyle,
          opacity: message.trim() ? 1 : 0.5,
          cursor: message.trim() ? "pointer" : "default"
        }}>
          <Send size={20} color="white" />
        </button>
      </form>
    </div>
  );
};

const actionBtnStyle = {
  background: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px",
  borderRadius: "8px",
  transition: "var(--transition)"
};

const inputStyle = {
  flex: 1,
  background: "none",
  border: "none",
  color: "var(--text-main)",
  fontSize: "1rem",
  padding: "10px 0"
};

const sendBtnStyle = {
  background: "var(--primary)",
  width: "45px",
  height: "45px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 15px rgba(157, 78, 221, 0.3)",
  transition: "all 0.3s ease"
};

export default MessageInput;
