import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "https://private-chat-app-qzju.onrender.com";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});
