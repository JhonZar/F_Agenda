import { api } from "./client";

// --- Tipos ---
export interface PlantillaWhatsapp {
  id: number;
  name: string;
  subject: string;
  message: string;
  category: "academic" | "administrative" | "emergency" | "event" | "reminder" | "general";
  status: "active" | "inactive" | "draft";
  targetAudience: "parents" | "teachers" | "students" | "all";
  variables: string[];
  priority: "low" | "medium" | "high";
  hasAttachment: boolean;
  isSchedulable: boolean;
  usageCount: number;
  lastUsed?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface PlantillaWhatsappPayload {
  name: string;
  content: string;
  created_by: number;
}

// --- Métodos CRUD ---

export async function getPlantillasWhatsapp(): Promise<PlantillaWhatsapp[]> {
  const res = await api.get<PlantillaWhatsapp[]>("/whatsapp-templates");
  return res.data;
}

export async function createPlantillaWhatsapp(payload: PlantillaWhatsappPayload): Promise<PlantillaWhatsapp> {
  const res = await api.post<PlantillaWhatsapp>("/whatsapp-templates", payload);
  return res.data;
}

export async function getPlantillaWhatsapp(id: number): Promise<PlantillaWhatsapp> {
  const res = await api.get<PlantillaWhatsapp>(`/whatsapp-templates/${id}`);
  return res.data;
}

export async function updatePlantillaWhatsapp(id: number, payload: PlantillaWhatsappPayload): Promise<PlantillaWhatsapp> {
  const res = await api.put<PlantillaWhatsapp>(`/whatsapp-templates/${id}`, payload);
  return res.data;
}

export async function deletePlantillaWhatsapp(id: number): Promise<void> {
  await api.delete(`/whatsapp-templates/${id}`);
}