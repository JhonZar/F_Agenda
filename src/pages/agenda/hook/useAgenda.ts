// src/pages/agenda/hook/useAgenda.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAgendas,
  getAgenda,
  createAgenda,
  updateAgenda,
  deleteAgenda,
  type AgendaEvent,
  type CreateAgendaPayload,
  type UpdateAgendaPayload,
} from "@/api/agendaApi";

// 1) Listado de eventos (con filtros opcionales)
export function useAgendas(params?: { paralelo_id?: number; grade?: string }) {
  return useQuery<AgendaEvent[], Error>({
    queryKey: ["agendas", params],
    queryFn: () => getAgendas(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// 2) Detalle de un evento
export function useAgenda(id?: number) {
  return useQuery<AgendaEvent, Error>({
    queryKey: ["agenda", id],
    queryFn: () => getAgenda(id!),
    enabled: typeof id === "number",
    staleTime: 5 * 60 * 1000,
  });
}

// 3) Crear un evento
export function useCreateAgenda() {
  const queryClient = useQueryClient();
  return useMutation<AgendaEvent, Error, CreateAgendaPayload>({
    mutationFn: createAgenda,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendas"] });
    },
  });
}

// 4) Actualizar un evento
export function useUpdateAgenda() {
  const queryClient = useQueryClient();
  return useMutation<
    AgendaEvent,
    Error,
    { id: number; payload: UpdateAgendaPayload }
  >({
    mutationFn: ({ id, payload }) => updateAgenda(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agendas"] });
      queryClient.invalidateQueries({ queryKey: ["agenda", variables.id] });
    },
  });
}

// 5) Eliminar un evento
export function useDeleteAgenda() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => deleteAgenda(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["agendas"] });
      queryClient.invalidateQueries({ queryKey: ["agenda", id] });
    },
  });
}
