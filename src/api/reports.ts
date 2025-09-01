

import { api } from "./client";

// --- Tipos ---
export interface Report {
  id: number;
  student_id: number;
  teacher_id: number;
  category_id: number;
  description: string;
  created_at: string;
  updated_at: string;
  student?: any;
  teacher?: any;
  category?: any;
}

export interface ReportPayload {
  student_id: number;
  teacher_id: number;
  category_id: number;
  description: string;
}

// --- Métodos CRUD ---

export async function getReports(): Promise<Report[]> {
  const res = await api.get<Report[]>("/reportes");
  return res.data;
}

export async function createReport(payload: ReportPayload): Promise<Report> {
  const res = await api.post<Report>("/reportes", payload);
  return res.data;
}

export async function getReport(id: number): Promise<Report> {
  const res = await api.get<Report>(`/reportes/${id}`);
  return res.data;
}

export async function updateReport(id: number, payload: ReportPayload): Promise<Report> {
  const res = await api.put<Report>(`/reportes/${id}`, payload);
  return res.data;
}

export async function deleteReport(id: number): Promise<void> {
  await api.delete(`/reportes/${id}`);
}