

import { api } from "./client";

// --- Tipos ---
export interface ReportCategory {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportCategoryPayload {
  name: string;
  description?: string;
}

// --- Métodos CRUD ---

// Obtener todas las categorías
export async function getReportCategories(): Promise<ReportCategory[]> {
  const res = await api.get<ReportCategory[]>("/report-categories");
  return res.data;
}

// Crear una categoría
export async function createReportCategory(payload: ReportCategoryPayload): Promise<ReportCategory> {
  const res = await api.post<ReportCategory>("/report-categories", payload);
  return res.data;
}

// Obtener una categoría por ID
export async function getReportCategory(id: number): Promise<ReportCategory> {
  const res = await api.get<ReportCategory>(`/report-categories/${id}`);
  return res.data;
}

// Actualizar una categoría
export async function updateReportCategory(id: number, payload: ReportCategoryPayload): Promise<ReportCategory> {
  const res = await api.put<ReportCategory>(`/report-categories/${id}`, payload);
  return res.data;
}

// Eliminar una categoría
export async function deleteReportCategory(id: number): Promise<void> {
  await api.delete(`/report-categories/${id}`);
}