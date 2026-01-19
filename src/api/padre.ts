import { api } from "./client";

export interface ParentInfo {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface ParentChildParallel {
  id: number;
  grade: string | number;
  section: string;
  label: string;
  teacher?: {
    id: number;
    name: string;
  } | null;
}

export interface ParentChildAttendanceSummary {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
}

export interface ParentChildAttendanceEntry {
  id: number;
  date: string;
  status: string;
  arrival: string | null;
  notes: string | null;
  parallel: {
    id: number;
    label: string;
  } | null;
}

export interface ParentChildReportEntry {
  id: number;
  category?: string;
  teacher?: string;
  description: string;
  created_at: string;
}

export interface ParentChildSummary {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  ci: string | null;
  parallels: ParentChildParallel[];
  attendance: {
    summary: ParentChildAttendanceSummary;
    recent: ParentChildAttendanceEntry[];
  };
  reports: {
    total: number;
    recent: ParentChildReportEntry[];
  };
}

export interface ParentDashboardResponse {
  parent: ParentInfo;
  children: ParentChildSummary[];
}

export async function getParentDashboard(padreId?: number): Promise<ParentDashboardResponse> {
  const res = await api.get<ParentDashboardResponse>("/padre/hijos", {
    params: padreId ? { padre_id: padreId } : undefined,
  });
  return res.data;
}
