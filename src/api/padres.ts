

// src/api/padres.ts
import { api } from "./client";

// --- Tipos ---
export interface Padre {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  ci: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePadrePayload {
  name: string;
  email?: string;
  phone?: string;
  ci: string;
}

export interface UpdatePadrePayload {
  id: number;
  payload: Partial<CreatePadrePayload>;
}

// --- CRUD ---
export async function getPadres(): Promise<Padre[]> {
  const res = await api.get<Padre[]>("/padres");
  return res.data;
}

export async function createPadre(
  payload: CreatePadrePayload
): Promise<Padre> {
  const res = await api.post<Padre>("/padres", payload);
  return res.data;
}

export async function updatePadre({
  id,
  payload,
}: UpdatePadrePayload): Promise<Padre> {
  const res = await api.put<Padre>(`/padres/${id}`, payload);
  return res.data;
}

export async function deletePadre(id: number): Promise<void> {
  await api.delete(`/padres/${id}`);
}

// --- Padre-Estudiante ---
export interface PadreEstudiante {
  id: number;
  padre_id: number;
  estudiante_id: number;
  created_at: string;
  updated_at: string;
  padre?: Padre;
  estudiante?: any;
}

export interface CreatePadreEstudiantePayload {
  padre_id: number;
  estudiante_id: number;
}

export interface UpdatePadreEstudiantePayload {
  id: number;
  payload: Partial<CreatePadreEstudiantePayload>;
}

export async function getPadresEstudiantes(params?: {
  padre_id?: number;
  estudiante_id?: number;
}): Promise<PadreEstudiante[]> {
  const res = await api.get<PadreEstudiante[]>("/padres-estudiantes", {
    params,
  });
  return res.data;
}

export async function createPadreEstudiante(
  payload: CreatePadreEstudiantePayload
): Promise<PadreEstudiante> {
  const res = await api.post<PadreEstudiante>("/padres-estudiantes", payload);
  return res.data;
}

export async function updatePadreEstudiante({
  id,
  payload,
}: UpdatePadreEstudiantePayload): Promise<PadreEstudiante> {
  const res = await api.put<PadreEstudiante>(
    `/padres-estudiantes/${id}`,
    payload
  );
  return res.data;
}

export async function deletePadreEstudiante(id: number): Promise<void> {
  await api.delete(`/padres-estudiantes/${id}`);
}