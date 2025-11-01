// socket.js
import { io } from "socket.io-client";

let socket = null;
let retryCount = 0;

const connectSocket = () => {
  if (socket && socket.connected) return socket;

  socket = io("http://localhost:4000", {
  autoConnect: true,  // let it auto-connect on import
  reconnectionAttempts: 5, // retry max 5 times
  reconnectionDelay: 2000,
});;

  socket.on("connect", () => {
    console.log("✅ Connected to socket:", socket.id);
    retryCount = 0;
  });

  socket.on("disconnect", (reason) => {
    console.log("⚠ Socket disconnected:", reason);
    if (retryCount < 5) {
      retryCount += 1;
      const delay = Math.min(1000 * 2 ** retryCount, 30000);
      console.log(`Retrying connection in ${delay / 1000}s`);
      setTimeout(connectSocket, delay);
    } else {
      console.warn("Socket reconnection attempts exceeded");
    }
  });

  socket.connect();
  return socket;
};

export default connectSocket();
