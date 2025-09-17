// src/api/estudiantes.ts
import { api } from "./client";

// --- Tipos ---
export interface Estudiante {
  id: number;
  name: string;
  email: string;
  phone?: string;
  ci?: string;
  rfid?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEstudiantePayload {
  name: string;
  email: string;
  phone?: string;
  ci?: string;
  rfid?: string;
}

export interface UpdateEstudiantePayload {
  id: number;
  payload: Partial<CreateEstudiantePayload>;
}

// --- CRUD ---
export async function getEstudiantes(): Promise<Estudiante[]> {
  const res = await api.get<Estudiante[]>("/estudiantes");
  return res.data;
}

export async function createEstudiante(
  payload: CreateEstudiantePayload
): Promise<Estudiante> {
  const res = await api.post<Estudiante>("/estudiantes", payload);
  return res.data;
}

export async function updateEstudiante({
  id,
  payload,
}: UpdateEstudiantePayload): Promise<Estudiante> {
  const res = await api.put<Estudiante>(`/estudiantes/${id}`, payload);
  return res.data;
}

export async function deleteEstudiante(id: number): Promise<void> {
  await api.delete(`/estudiantes/${id}`);
}
