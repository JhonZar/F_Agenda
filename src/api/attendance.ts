import { api } from "./client";

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceStudentInput {
  id: number;
  status: AttendanceStatus;
  arrivalTime?: string | null; // HH:mm
  notes?: string | null;
}

export interface AttendancePayload {
  date: string; // YYYY-MM-DD
  paralelo_id: number;
  students: AttendanceStudentInput[];
}

export interface AttendanceShowQuery {
  date: string;
  paralelo_id: number;
}

export async function saveAttendance(payload: AttendancePayload) {
  const res = await api.post("/attendance", payload);
  return res.data;
}

export async function getAttendance(params: AttendanceShowQuery) {
  const res = await api.get("/attendance", { params });
  return res.data as {
    id: string;
    date: string;
    parallel: string;
    totalStudents: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    takenBy?: string;
    takenAt?: string | null;
    students: { id: number; name: string; parallel: string; status: AttendanceStatus; arrivalTime?: string | null; notes?: string | null }[];
  };
}

