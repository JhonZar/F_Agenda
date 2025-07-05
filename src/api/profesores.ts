// src/api/profesores.ts
import { api } from "./client";

// --- Tipos ---
export interface Profesor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  ci?: string;
}

export interface CreateProfesorPayload {
  name: string;
  email: string;
  phone?: string;
  ci: string;               // ahora enviamos CI en lugar de password
}

// --- Métodos de API ---

export async function getProfesores(): Promise<Profesor[]> {
  const res = await api.get<Profesor[]>("/profesores");
  console.log("Profesores obtenidos:", res.data);
  return res.data;
}

export async function createProfesor(
  payload: CreateProfesorPayload
): Promise<Profesor> {
  const res = await api.post<Profesor>("/profesores", payload);
  return res.data;
}
