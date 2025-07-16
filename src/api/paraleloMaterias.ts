// src/api/paraleloMaterias.ts

import { api } from "./client";
import type { Materia } from "./materias";

// --- Tipos ---

/**
 * Payload para asignar una sola materia a un paralelo
 */
export interface AssignMateriaPayload {
  materia_id: number;
}

/**
 * Payload para reemplazar el conjunto de materias de un paralelo
 */
export interface SyncMateriasPayload {
  materia_ids: number[];
}

// --- Métodos CRUD sobre la relación Paralelo ↔ Materias ---

/**
 * Obtiene todas las materias asignadas a un paralelo.
 */
export async function getMateriasForParalelo(
  paraleloId: number
): Promise<Materia[]> {
  const res = await api.get<Materia[]>(`/paralelos/${paraleloId}/materias`);
  console.log(
    `Materias del paralelo ${paraleloId} obtenidas:`,
    res.data
  );
  return res.data;
}

/**
 * Asigna (attach) una materia a un paralelo.
 */
export async function assignMateriaToParalelo(
  paraleloId: number,
  payload: AssignMateriaPayload
): Promise<Materia[]> {
  const res = await api.post<Materia[]>(
    `/paralelos/${paraleloId}/materias`,
    payload
  );
  return res.data;
}

/**
 * Reemplaza (sync) todas las materias de un paralelo.
 */
export async function syncMateriasForParalelo(
  paraleloId: number,
  payload: SyncMateriasPayload
): Promise<Materia[]> {
  const res = await api.put<Materia[]>(
    `/paralelos/${paraleloId}/materias`,
    payload
  );
  return res.data;
}

/**
 * Desasigna (detach) una materia de un paralelo.
 */
export async function removeMateriaFromParalelo(
  paraleloId: number,
  materiaId: number
) {
  await api.delete(`/paralelos/${paraleloId}/materias/${materiaId}`);
}