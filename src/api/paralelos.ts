import { api } from "./client";

// --- Tipos ---
export interface Profesor {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Paralelo {
  id: number;
  grade: string;
  section: string;
  teacher_id: number;
  created_at: string;
  updated_at: string;
  teacher: Profesor; 
}

export interface ParaleloPayload {
  grade: string;
  section: string;
  teacher_id: number;
}

// --- Métodos CRUD ---

// Obtener todos los paralelos
export async function getParalelos(): Promise<Paralelo[]> {
  const res = await api.get<Paralelo[]>("/paralelos");
  console.log("Paralelos obtenidos:", res.data);
  return res.data;
}

// Crear un paralelo
export async function createParalelo(payload: ParaleloPayload): Promise<Paralelo> {
  const res = await api.post<Paralelo>("/paralelos", payload);
  return res.data;
}

// Obtener un paralelo por ID
export async function getParalelo(id: number): Promise<Paralelo> {
  const res = await api.get<Paralelo>(`/paralelos/${id}`);
  return res.data;
}

// Actualizar un paralelo
export async function updateParalelo(id: number, payload: ParaleloPayload): Promise<Paralelo> {
  const res = await api.put<Paralelo>(`/paralelos/${id}`, payload);
  return res.data;
}

// Eliminar un paralelo
export async function deleteParalelo(id: number): Promise<void> {
  await api.delete(`/paralelos/${id}`);
}