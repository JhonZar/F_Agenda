// src/api/materias.ts

import { api } from "./client";

// --- Tipos ---
export interface Materia {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface MateriaPayload {
  name: string;
  description?: string;
}

// --- Métodos CRUD ---

/**
 * Obtiene todas las materias.
 */
export async function getMaterias(): Promise<Materia[]> {
  const res = await api.get<Materia[]>("/materias");
  console.log("Materias obtenidas:", res.data);
  return res.data;
}

/**
 * Crea una nueva materia.
 */
export async function createMateria(
  payload: MateriaPayload
): Promise<Materia> {
  const res = await api.post<Materia>("/materias", payload);
  return res.data;
}

/**
 * Obtiene una materia por su ID.
 */
export async function getMateria(id: number): Promise<Materia> {
  const res = await api.get<Materia>(`/materias/${id}`);
  return res.data;
}

/**
 * Actualiza los datos de una materia existente.
 */
export async function updateMateria(
  id: number,
  payload: MateriaPayload
): Promise<Materia> {
  const res = await api.put<Materia>(`/materias/${id}`, payload);
  return res.data;
}

/**
 * Elimina una materia por su ID.
 */
export async function deleteMateria(id: number): Promise<void> {
  await api.delete(`/materias/${id}`);
}
