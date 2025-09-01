

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPadres,
  createPadre,
  updatePadre,
  deletePadre,
  type Padre,
  type CreatePadrePayload,
  type UpdatePadrePayload,
//   Padre,
//   CreatePadrePayload,
//   UpdatePadrePayload,
} from "@/api/padres";

export const PADRES_QK = ["padres"] as const;

/** Lista de padres */
export function usePadres() {
  return useQuery<Padre[]>({
    queryKey: PADRES_QK,
    queryFn: getPadres,
  });
}

/** Crear padre */
export function useCreatePadre() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePadrePayload) => createPadre(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PADRES_QK });
    },
  });
}

/** Actualizar padre */
export function useUpdatePadre() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePadrePayload) => updatePadre(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PADRES_QK });
    },
  });
}

/** Eliminar padre */
export function useDeletePadre() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePadre(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PADRES_QK });
    },
  });
}

import {
  getPadresEstudiantes,
  createPadreEstudiante,
  updatePadreEstudiante,
  deletePadreEstudiante,
  type PadreEstudiante,
  type CreatePadreEstudiantePayload,
  type UpdatePadreEstudiantePayload,
} from "@/api/padres";

export const PADRES_EST_QK = ["padres-estudiantes"] as const;

/** Lista de vínculos padre-estudiante */
export function usePadresEstudiantes(params?: {
  padre_id?: number;
  estudiante_id?: number;
}) {
  return useQuery<PadreEstudiante[]>({
    queryKey: [...PADRES_EST_QK, params],
    queryFn: () => getPadresEstudiantes(params),
  });
}

/** Crear vínculo padre-estudiante */
export function useCreatePadreEstudiante() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePadreEstudiantePayload) =>
      createPadreEstudiante(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PADRES_EST_QK });
    },
  });
}

/** Actualizar vínculo padre-estudiante */
export function useUpdatePadreEstudiante() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePadreEstudiantePayload) =>
      updatePadreEstudiante(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PADRES_EST_QK });
    },
  });
}

/** Eliminar vínculo padre-estudiante */
export function useDeletePadreEstudiante() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePadreEstudiante(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PADRES_EST_QK });
    },
  });
}