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
  lastUsed?: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface PlantillaWhatsappPayload {
  name: string;
  subject: string;
  message: string;
  category?: PlantillaWhatsapp["category"];
  status?: PlantillaWhatsapp["status"];
  targetAudience?: PlantillaWhatsapp["targetAudience"];
  variables?: string[];
  priority?: PlantillaWhatsapp["priority"];
  hasAttachment?: boolean;
  isSchedulable?: boolean;
  usageCount?: number;
  lastUsed?: string | null;
  created_by: number;
}

// Map snake_case from API to camelCase for frontend
function toCamelTemplate(s: any): PlantillaWhatsapp {
  return {
    id: s.id,
    name: s.name,
    subject: s.subject ?? "",
    message: s.message ?? "",
    category: s.category ?? "general",
    status: s.status ?? "draft",
    targetAudience: s.target_audience ?? "all",
    variables: Array.isArray(s.variables) ? s.variables : [],
    priority: s.priority ?? "medium",
    hasAttachment: Boolean(s.has_attachment),
    isSchedulable: Boolean(s.is_schedulable),
    usageCount: typeof s.usage_count === "number" ? s.usage_count : 0,
    lastUsed: s.last_used ?? null,
    created_by: s.created_by,
    created_at: s.created_at,
    updated_at: s.updated_at,
  };
}

// Map camelCase payload to snake_case for API
function toSnakePayload(p: PlantillaWhatsappPayload) {
  return {
    name: p.name,
    subject: p.subject,
    message: p.message,
    category: p.category,
    status: p.status,
    target_audience: p.targetAudience,
    variables: p.variables,
    priority: p.priority,
    has_attachment: p.hasAttachment,
    is_schedulable: p.isSchedulable,
    usage_count: p.usageCount,
    last_used: p.lastUsed,
    created_by: p.created_by,
  };
}

// --- Métodos CRUD ---

export async function getPlantillasWhatsapp(): Promise<PlantillaWhatsapp[]> {
  const res = await api.get("/whatsapp-templates");
  return (res.data as any[]).map(toCamelTemplate);
}

export async function createPlantillaWhatsapp(payload: PlantillaWhatsappPayload): Promise<PlantillaWhatsapp> {
  const res = await api.post("/whatsapp-templates", toSnakePayload(payload));
  return toCamelTemplate(res.data);
}

export async function getPlantillaWhatsapp(id: number): Promise<PlantillaWhatsapp> {
  const res = await api.get(`/whatsapp-templates/${id}`);
  return toCamelTemplate(res.data);
}

export async function updatePlantillaWhatsapp(id: number, payload: PlantillaWhatsappPayload): Promise<PlantillaWhatsapp> {
  const res = await api.put(`/whatsapp-templates/${id}`, toSnakePayload(payload));
  return toCamelTemplate(res.data);
}

export async function deletePlantillaWhatsapp(id: number): Promise<void> {
  await api.delete(`/whatsapp-templates/${id}`);
}
