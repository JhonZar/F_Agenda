// utils/socket.ts
import { io, type Socket } from "socket.io-client";

export const socket: Socket = io(import.meta.env.VITE_SOCKET_URL!, {
  path: "/socket.io",
  transports: ["websocket"],
  withCredentials: true,
  autoConnect: false,
});
