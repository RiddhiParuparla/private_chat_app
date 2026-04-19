import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import MessageFeed from "../components/MessageFeed";
import MessageInput from "../components/MessageInput";
import { useAuth } from "../context/AuthContext";
import { socket } from "../socket/socket";
import { fetchUsers, fetchMessages } from "../services/api";

import VideoCall from "../components/VideoCall";
import { Phone, Video, PhoneIncoming } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ChatDashboard = () => {
  const { user, peer } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCallData, setIncomingCallData] = useState(null);

  useEffect(() => {
    if (!peer) return;

    // Handle Incoming Call via PeerJS
    peer.on("call", (call) => {
      const fromUser = users.find(u => u._id === call.peer);
      setIncomingCallData({ call, fromUser });
    });

    return () => peer.off("call");
  }, [peer, users]);

  const initiateCall = (type) => {
    setActiveCall({
      type: "outgoing",
      callType: type,
      receiverId: selectedUser._id,
      otherUser: selectedUser
    });
  };

  const answerCall = () => {
    setActiveCall({
      type: "incoming",
      callType: "video",
      callObj: incomingCallData.call,
      otherUser: incomingCallData.fromUser
    });
    setIncomingCallData(null);
  };

  const endCall = () => {
    setActiveCall(null);
    setIncomingCallData(null);
    // Peer tracks will be stopped by VideoCall cleanup
  };

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data } = await fetchUsers();
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };
    loadUsers();

    // Notification Permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (selectedUser) {
      const loadMessages = async () => {
        try {
          const { data } = await fetchMessages(selectedUser._id);
          setMessages(data);
        } catch (err) {
          console.error("Failed to load messages", err);
        }
      };
      loadMessages();
    }
  }, [selectedUser]);

  const [typingUser, setTypingUser] = useState(null);

  useEffect(() => {
    socket.on("user_status", ({ userId, status }) => {
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status } : u))
      );
    });

    socket.on("typing", ({ senderId }) => {
      if (senderId === selectedUser?._id) {
        setTypingUser(senderId);
      }
    });

    socket.on("stop_typing", ({ senderId }) => {
      if (senderId === selectedUser?._id) {
        setTypingUser(null);
      }
    });

    socket.on("receive_message", (newMessage) => {
      const isFromActiveChat = 
        (newMessage.sender === selectedUser?._id && newMessage.receiver === user._id) ||
        (newMessage.sender === user._id && newMessage.receiver === selectedUser?._id);

      if (isFromActiveChat) {
        setMessages((prev) => [...prev, newMessage]);
      } else if (newMessage.receiver === user._id) {
        // Notification for background messages
        if (Notification.permission === "granted") {
          new Notification("New Message", {
            body: newMessage.content || "Sent an attachment",
            icon: "/logo.png" // Placeholder
          });
        }
      }
    });

    return () => {
      socket.off("receive_message");
      socket.off("user_status");
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, [selectedUser, user._id]);

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-main)" }}>
      {/* Active Video/Voice Call */}
      <AnimatePresence>
        {activeCall && (
          <VideoCall 
            activeCall={activeCall} 
            onEndCall={endCall} 
            currentUser={user} 
            peer={peer} 
          />
        )}
      </AnimatePresence>

      {/* Incoming Call Notification */}
      <AnimatePresence>
        {incomingCallData && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="glass-panel"
            style={incomingCallAlertStyle}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div className="pulse" style={{ background: "var(--accent-green)", padding: "10px", borderRadius: "50%" }}>
                <PhoneIncoming size={24} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: "bold" }}>Incoming Call</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
                  {incomingCallData.fromUser?.name || "Private Friend"}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                onClick={answerCall}
                style={{ background: "var(--accent-green)", color: "white", padding: "8px 16px", borderRadius: "8px" }}
              >
                Answer
              </button>
              <button 
                onClick={endCall}
                style={{ background: "var(--accent-red)", color: "white", padding: "8px 16px", borderRadius: "8px" }}
              >
                Reject
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar - Contacts List */}
      <Sidebar 
        users={users} 
        selectedUser={selectedUser} 
        onSelect={setSelectedUser} 
      />

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        {selectedUser ? (
          <>
            {/* Header */}
            <header className="glass-panel" style={{ 
              padding: "1rem 2rem", 
              borderRadius: "0", 
              borderBottom: "1px solid var(--glass-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "15px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold"
                }}>
                  {selectedUser.name[0]}
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>{selectedUser.name}</h3>
                  {typingUser ? (
                    <span style={{ fontSize: "0.8rem", color: "var(--primary-light)", fontWeight: "600" }}>
                      typing...
                    </span>
                  ) : (
                    <span style={{ fontSize: "0.8rem", color: selectedUser.status === 'online' ? "var(--accent-green)" : "var(--text-mute)" }}>
                      {selectedUser.status === 'online' ? 'Online' : 'Offline'}
                    </span>
                  )}
                </div>
              </div>

              {/* Call Controls */}
              <div style={{ display: "flex", gap: "15px" }}>
                <button 
                  onClick={() => initiateCall('audio')}
                  style={{ background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "10px", cursor: "pointer" }}
                >
                  <Phone size={20} color="var(--text-dim)" />
                </button>
                <button 
                  onClick={() => initiateCall('video')}
                  style={{ background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "10px", cursor: "pointer" }}
                >
                  <Video size={20} color="var(--text-dim)" />
                </button>
              </div>
            </header>

            {/* Messages */}
            <MessageFeed messages={messages} currentUser={user} />

            {/* Input */}
            <MessageInput receiverId={selectedUser._id} />
          </>
        ) : (
          <div style={{ 
            flex: 1, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            flexDirection: "column",
            color: "var(--text-mute)"
          }}>
            <h1 style={{ color: "var(--text-dim)", opacity: 0.3 }}>PrivateCircle</h1>
            <p>Select a contact to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDashboard;

const incomingCallAlertStyle = {
  position: "fixed",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 10000,
  padding: "1rem 2rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "30px",
  minWidth: "400px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.4)"
};
