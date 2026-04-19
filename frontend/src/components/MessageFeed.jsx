import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MessageFeed = ({ messages, currentUser }) => {
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ 
      flex: 1, 
      overflowY: "auto", 
      padding: "2rem",
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      background: "var(--bg-chat)"
    }}>
      <AnimatePresence initial={false}>
        {messages.map((msg, index) => {
          const isMe = msg.sender === currentUser._id;
          return (
            <motion.div
              key={msg._id || index}
              initial={{ opacity: 0, x: isMe ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                alignSelf: isMe ? "flex-end" : "flex-start",
                maxWidth: "70%",
                display: "flex",
                flexDirection: "column",
                alignItems: isMe ? "flex-end" : "flex-start"
              }}
            >
              <div 
                className="glass-panel"
                style={{
                  padding: "12px 18px",
                  borderRadius: isMe ? "18px 18px 2px 18px" : "18px 18px 18px 2px",
                  background: isMe ? "var(--primary)" : "var(--bg-sidebar)",
                  border: "none",
                  boxShadow: isMe ? "0 4px 15px rgba(157, 78, 221, 0.2)" : "none",
                  color: "white",
                  overflow: "hidden"
                }}
              >
                {msg.content && <div>{msg.content}</div>}
                {msg.mediaUrl && (
                  <div style={{ marginTop: msg.content ? "10px" : "0" }}>
                    {msg.mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                      <img 
                        src={msg.mediaUrl} 
                        alt="attachment" 
                        style={{ maxWidth: "100%", borderRadius: "8px", display: "block" }} 
                      />
                    ) : (
                      <a 
                        href={msg.mediaUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ color: "white", textDecoration: "underline", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "5px" }}
                      >
                        📂 View Attachment
                      </a>
                    )}
                  </div>
                )}
              </div>
              <span style={{ 
                fontSize: "0.7rem", 
                color: "var(--text-mute)", 
                marginTop: "4px",
                padding: "0 5px" 
              }}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <div ref={scrollRef} />
    </div>
  );
};

export default MessageFeed;
