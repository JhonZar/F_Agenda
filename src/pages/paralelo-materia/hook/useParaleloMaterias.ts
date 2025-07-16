// src/hooks/useParaleloMaterias.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMateriasForParalelo,
  assignMateriaToParalelo,
  syncMateriasForParalelo,
  removeMateriaFromParalelo,
  type AssignMateriaPayload,
  type SyncMateriasPayload,
} from "@/api/paraleloMaterias";
import type { Materia } from "@/api/materias";

/**
 * Hook para listar las materias de un paralelo.
 */
export function useParaleloMaterias(
  paraleloId: number,
  enabled: boolean = true
) {
  return useQuery<Materia[], Error>({
    queryKey: ["paraleloMaterias", paraleloId],
    queryFn: () => getMateriasForParalelo(paraleloId),
    enabled: enabled && !!paraleloId,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

/**
 * Hook para asignar (attach) una materia a un paralelo.
 */
export function useAssignMateriaToParalelo(paraleloId: number) {
  const qc = useQueryClient();
  return useMutation<Materia[], Error, AssignMateriaPayload>({
    mutationFn: (payload) => assignMateriaToParalelo(paraleloId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["paraleloMaterias", paraleloId] });
    },
  });
}

/**
 * Hook para sincronizar (sync) todas las materias de un paralelo.
 */
export function useSyncMateriasForParalelo(paraleloId: number) {
  const qc = useQueryClient();
  return useMutation<Materia[], Error, SyncMateriasPayload>({
    mutationFn: (payload) => syncMateriasForParalelo(paraleloId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["paraleloMaterias", paraleloId] });
    },
  });
}

/**
 * Hook para desasignar (detach) una materia de un paralelo.
 */
export function useRemoveMateriaFromParalelo(paraleloId: number) {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (materiaId) =>
      removeMateriaFromParalelo(paraleloId, materiaId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["paraleloMaterias", paraleloId] });
    },
  });
}
