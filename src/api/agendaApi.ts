// src/lib/agendaApi.ts
import { api } from "./client";

// --- Tipos ---
export interface AgendaEvent {
  id: number;
  title: string;
  description?: string;
  scheduled_at: string; // fecha + hora, p.e. "2024-03-20T14:00:00"
  type: "global" | "parallel";
  paralelo?: string;
  location: string;
  organizer: string;
  participants: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  reminders: boolean;
  recurring: boolean;
  recurring_type?: "daily" | "weekly" | "monthly";
}

export interface CreateAgendaPayload {
  paralelo_id?: number;
  grade?: string;
  title: string;
  description?: string;
  scheduled_at: string;
}

export interface UpdateAgendaPayload {
  paralelo_id?: number;
  grade?: string;
  title?: string;
  description?: string;
  scheduled_at?: string;
}

// --- Métodos CRUD ---

/**
 * Obtener lista de eventos.
 * Opcionalmente filtrar por paralelo_id y/o grade.
 */
export async function getAgendas(params?: {
  paralelo_id?: number;
  grade?: string;
}): Promise<AgendaEvent[]> {
  const res = await api.get<AgendaEvent[]>("/agendas", { params });
  console.log("Agendas fetched:", res.data);
  return res.data;
}

/**
 * Obtener un evento por su ID.
 */
export async function getAgenda(id: number): Promise<AgendaEvent> {
  const res = await api.get<AgendaEvent>(`/agendas/${id}`);
  return res.data;
}

/**
 * Crear un nuevo evento en la agenda.
 */
export async function createAgenda(
  payload: CreateAgendaPayload
): Promise<AgendaEvent> {
  const res = await api.post<AgendaEvent>("/agendas", payload);
  return res.data;
}

/**
 * Actualizar un evento existente.
 */
export async function updateAgenda(
  id: number,
  payload: UpdateAgendaPayload
): Promise<AgendaEvent> {
  const res = await api.put<AgendaEvent>(`/agendas/${id}`, payload);
  return res.data;
}

/**
 * Eliminar un evento de la agenda.
 */
export async function deleteAgenda(id: number): Promise<void> {
  await api.delete(`/agendas/${id}`);
}
