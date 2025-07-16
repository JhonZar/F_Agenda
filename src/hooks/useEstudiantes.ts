// src/hooks/useEstudiantes.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEstudiantes,
  createEstudiante,
  updateEstudiante,
  deleteEstudiante,
  type Estudiante,
  type CreateEstudiantePayload,
  type UpdateEstudiantePayload,
} from "@/api/estudiantes";

export function useEstudiantes() {
  return useQuery<Estudiante[], Error>({
    queryKey: ["estudiantes"],
    queryFn: getEstudiantes,
    staleTime: 5 * 60_000,
  });
}

export function useCreateEstudiante() {
  const qc = useQueryClient();
  return useMutation<Estudiante, Error, CreateEstudiantePayload>({
    mutationFn: createEstudiante,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estudiantes"] });
    },
  });
}

export function useUpdateEstudiante() {
  const qc = useQueryClient();
  return useMutation<Estudiante, Error, UpdateEstudiantePayload>({
    mutationFn: updateEstudiante,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estudiantes"] });
    },
  });
}

export function useDeleteEstudiante() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteEstudiante,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estudiantes"] });
    },
  });
}
