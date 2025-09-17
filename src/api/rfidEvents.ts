// src/api/rfidEvents.ts
import { io, Socket } from "socket.io-client";

export interface RfidAttendanceEvent {
  type: "attendance";
  uid: string;
  user: { id: number; name: string };
  attendance: {
    date: string;
    paralelo_id: number;
    action: "check_in" | "check_out" | "already_checked_in";
    record_id: number;
  };
}

export interface RfidUnknownEvent {
  type: "unknown_uid";
  uid: string;
  date: string;
}

export type RfidEvent = RfidAttendanceEvent | RfidUnknownEvent;

let socket: Socket | null = null;

export function connectRfidEvents(
  onEvent: (event: RfidEvent) => void,
  onError?: (err: any) => void
) {
  if (!socket) {
    socket = io("http://localhost:3001", {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("✅ Conectado a RFID WS");
    });

    socket.on("disconnect", () => {
      console.log("❌ Desconectado de RFID WS");
    });

    socket.on("rfid_read", (data: RfidEvent) => {
      console.log("📡 Evento RFID:", data);
      onEvent(data);
    });

    socket.on("connect_error", (err) => {
      console.error("RFID WS error:", err);
      onError?.(err);
    });
  }
  return socket;
}

export function disconnectRfidEvents() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}