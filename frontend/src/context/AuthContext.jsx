import React, { createContext, useState, useEffect, useContext } from "react";
import { socket } from "../socket/socket";
import Peer from "peerjs";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [peer, setPeer] = useState(null);

  useEffect(() => {
    if (token && user) {
      socket.connect();
      socket.emit("join", user._id);

      // Initialize PeerJS (Uses default Cloud Server for reliability)
      const newPeer = new Peer(user._id);
      
      newPeer.on("open", (id) => {
        console.log("Peer ID:", id);
      });

      setPeer(newPeer);

      return () => {
        newPeer.destroy();
      };
    } else {
      socket.disconnect();
    }
  }, [token, user]);

  const loginUser = (userData, userToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);
    setUser(userData);
    setToken(userToken);
  };

  const logoutUser = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    socket.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, token, peer, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
