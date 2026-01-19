import { api } from "./client";

export interface RegenteOverviewCounts {
  students: number;
  teachers: number;
  parents: number;
  regents: number;
  reports: {
    total: number;
    last30Days: number;
  };
}

export interface RegenteAttendanceTotals {
  present: number;
  absent: number;
  late: number;
  excused: number;
}

export interface RegenteParallelSummary {
  id: number;
  grade: string | number;
  section: string;
  teacher?: string | null;
  studentsCount: number;
}

export interface RegenteReportSummary {
  id: number;
  student?: string;
  teacher?: string;
  category?: string;
  description: string;
  created_at: string;
}

export interface RegenteOverviewResponse {
  counts: RegenteOverviewCounts;
  attendance: {
    since: string;
    totals: RegenteAttendanceTotals;
  };
  parallels: RegenteParallelSummary[];
  latest_reports: RegenteReportSummary[];
}

export async function getRegenteOverview(): Promise<RegenteOverviewResponse> {
  const res = await api.get<RegenteOverviewResponse>("/regente/overview");
  return res.data;
}
