import { api } from "./client";
import type { User } from "./login";

// --- Payloads ---
export interface AssignStudentPayload {
  student_id: number;
}
export interface SyncStudentsPayload {
  student_ids: number[];
}

// --- CRUD sobre la relación ---

export async function getStudentsForParalelo(paraleloId: number): Promise<User[]> {
  const res = await api.get<User[]>(`/paralelos/${paraleloId}/estudiantes`);
  return res.data;
}

export async function assignStudentToParalelo(
  paraleloId: number,
  payload: AssignStudentPayload
): Promise<User[]> {
  const res = await api.post<User[]>(
    `/paralelos/${paraleloId}/estudiantes`,
    payload
  );
  return res.data;
}

export async function syncStudentsForParalelo(
  paraleloId: number,
  payload: SyncStudentsPayload
): Promise<User[]> {
  const res = await api.put<User[]>(
    `/paralelos/${paraleloId}/estudiantes`,
    payload
  );
  return res.data;
}

export async function removeStudentFromParalelo(
  paraleloId: number,
  studentId: number
): Promise<void> {
  await api.delete(
    `/paralelos/${paraleloId}/estudiantes/${studentId}`
  );
}
