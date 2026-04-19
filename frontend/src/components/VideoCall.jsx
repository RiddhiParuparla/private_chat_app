import React, { useEffect, useRef, useState } from "react";
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const VideoCall = ({ activeCall, onEndCall, currentUser, peer }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  useEffect(() => {
    // Start local media
    const startMedia = async () => {
      try {
        const constraints = { 
          video: activeCall.callType === 'video', 
          audio: true 
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setLocalStream(stream);

        if (activeCall.callType === 'video' && localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        if (activeCall.type === "incoming" && activeCall.callObj) {
          // Answer call
          activeCall.callObj.answer(stream);
          activeCall.callObj.on("stream", (remote) => {
            setRemoteStream(remote);
            if (activeCall.callType === 'video' && remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remote;
            }
          });
        } else if (activeCall.type === "outgoing" && peer) {
          // Initiate call
          const call = peer.call(activeCall.receiverId, stream);
          if (call) {
            call.on("stream", (remote) => {
              setRemoteStream(remote);
              if (activeCall.callType === 'video' && remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remote;
              }
            });
          }
        }
      } catch (err) {
        console.error("Failed to get media", err);
      }
    };

    if (activeCall && (peer || activeCall.callObj)) startMedia();

    return () => {
      localStream?.getTracks().forEach(track => track.stop());
    };
  }, [activeCall, peer]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream && activeCall.callType === 'video') {
      localStream.getVideoTracks()[0].enabled = !localStream.getVideoTracks()[0].enabled;
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-panel"
      style={modalStyle}
    >
      <div style={videoContainerStyle}>
        {activeCall.callType === 'video' ? (
          <>
            {/* Remote Video (Full Screen) */}
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              style={remoteVideoStyle}
            />
            
            {/* Local Video (Floating) */}
            <div className="glass-panel" style={localVideoWrapperStyle}>
              <video 
                ref={localVideoRef} 
                autoPlay 
                playsInline 
                muted 
                style={localVideoStyle}
              />
            </div>
          </>
        ) : (
          /* Audio Call UI (Avatar) */
          <div style={audioCallPlaceholderStyle}>
            <div className="pulse" style={avatarPlaceholderStyle}>
              {activeCall.otherUser?.name?.[0] || 'P'}
            </div>
            <p style={{ marginTop: "20px", fontSize: "1.2rem", opacity: 0.7 }}>
              {remoteStream ? "Voice Call Connected" : "Ringing..."}
            </p>
          </div>
        )}

        {/* Info Overlay */}
        <div style={infoOverlayStyle}>
          <h2 style={{ fontSize: "2rem", marginBottom: "5px" }}>{activeCall.otherUser?.name || "Private Call"}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-dim)" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: remoteStream ? "var(--accent-green)" : "var(--accent-red)" }} />
            {activeCall.callType === 'video' ? 'Video Session' : 'Encrypted Voice'}
          </div>
        </div>

        {/* Controls */}
        <div style={controlsWrapperStyle}>
          <button 
            onClick={toggleMute} 
            style={{ ...controlBtnStyle, background: isMuted ? "var(--accent-red)" : "var(--glass)" }}
          >
            {isMuted ? <MicOff /> : <Mic />}
          </button>
          
          {activeCall.callType === 'video' && (
            <button 
              onClick={toggleVideo} 
              style={{ ...controlBtnStyle, background: isVideoOff ? "var(--accent-red)" : "var(--glass)" }}
            >
              {isVideoOff ? <VideoOff /> : <Video />}
            </button>
          )}

          <button 
            onClick={onEndCall} 
            style={{ ...controlBtnStyle, background: "var(--accent-red)", width: "65px", height: "65px" }}
          >
            <PhoneOff size={28} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  zIndex: 9999,
  background: "rgba(0,0,0,0.9)",
  borderRadius: 0,
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const videoContainerStyle = {
  position: "relative",
  width: "100%",
  height: "100%",
  overflow: "hidden"
};

const remoteVideoStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

const localVideoWrapperStyle = {
  position: "absolute",
  top: "20px",
  right: "20px",
  width: "200px",
  height: "150px",
  overflow: "hidden",
  borderRadius: "12px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
};

const localVideoStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

const infoOverlayStyle = {
  position: "absolute",
  top: "30px",
  left: "30px",
  color: "white"
};

const controlsWrapperStyle = {
  position: "absolute",
  bottom: "40px",
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: "20px",
  alignItems: "center"
};

const controlBtnStyle = {
  width: "50px",
  height: "50px",
  borderRadius: "50%",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  cursor: "pointer",
  transition: "all 0.3s ease"
};

const audioCallPlaceholderStyle = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--bg-main)"
};

const avatarPlaceholderStyle = {
  width: "150px",
  height: "150px",
  borderRadius: "50%",
  background: "var(--primary)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "4rem",
  fontWeight: "bold",
  color: "white",
  boxShadow: "0 0 40px rgba(157, 78, 221, 0.4)"
};

export default VideoCall;
