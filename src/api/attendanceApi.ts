// src/lib/attendanceApi.ts
import { api } from "./client";

// --- Tipos ---
export interface Student {
  id: string;
  name: string;
  parallel: string;
  status: "present" | "absent" | "late" | "excused";
  arrivalTime?: string;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  parallel: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  takenBy: string;
  takenAt: string;
  students: Student[];
}

// --- Métodos CRUD ---
export async function getAttendance(
  date: string,
  paralelo_id: string
): Promise<AttendanceRecord> {
  const res = await api.get<AttendanceRecord>("/attendance", {
    params: { date, paralelo_id },
  });
  return res.data;
}

export async function getAttendanceHistory(): Promise<AttendanceRecord[]> {
  const res = await api.get<AttendanceRecord[]>("/attendance/history");
  console.log("Attendance history fetched:", res.data);
  return res.data;
}

export interface SaveAttendancePayload {
  date: string;
  paralelo_id: string;
  students: {
    id: string;
    status: Student["status"];
    arrivalTime?: string;
    notes?: string;
  }[];
}

export async function saveAttendance(
  payload: SaveAttendancePayload
): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>("/attendance", payload);
  return res.data;
}
