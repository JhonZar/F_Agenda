// src/pages/paralelo-estudiante/hook/useParaleloEstudiantes.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStudentsForParalelo,
  assignStudentToParalelo,
  syncStudentsForParalelo,
  removeStudentFromParalelo,
  type AssignStudentPayload,
  type SyncStudentsPayload,
} from "@/api/paraleloEstudiantes";
import type { User } from "@/api/login";

/**
 * Hook para listar las estudiantes de un paralelo.
 */
export function useParaleloEstudiantes(paraleloId: number) {
  return useQuery<User[], Error>({
    queryKey: ["paraleloEstudiantes", paraleloId],
    queryFn: () => getStudentsForParalelo(paraleloId),
    enabled: Boolean(paraleloId),
  });
}

/**
 * Hook para asignar (attach) una estudiante a un paralelo.
 */
export function useAssignStudent(paraleloId: number) {
  const qc = useQueryClient();
  return useMutation<User[], Error, AssignStudentPayload>({
    mutationFn: (payload) =>
      assignStudentToParalelo(paraleloId, payload),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["paraleloEstudiantes", paraleloId],
      });
    },
  });
}

/**
 * Hook para sincronizar (sync) todas las estudiantes de un paralelo.
 */
export function useSyncStudents(paraleloId: number) {
  const qc = useQueryClient();
  return useMutation<User[], Error, SyncStudentsPayload>({
    mutationFn: (payload) =>
      syncStudentsForParalelo(paraleloId, payload),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["paraleloEstudiantes", paraleloId],
      });
    },
  });
}

/**
 * Hook para desasignar (detach) una estudiante de un paralelo.
 */
export function useRemoveStudent(paraleloId: number) {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (studentId) =>
      removeStudentFromParalelo(paraleloId, studentId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["paraleloEstudiantes", paraleloId],
      });
    },
  });
}
