// src/hooks/useMaterias.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMaterias,
  getMateria,
  createMateria,
  updateMateria,
  deleteMateria,
  type Materia,
  type MateriaPayload,
//   Materia,
//   MateriaPayload,
} from "@/api/materias";

// 1) Hook para listar todas las materias
export function useMaterias() {
  return useQuery<Materia[], Error>({
    queryKey: ["materias"],
    queryFn: getMaterias,
    staleTime: 5 * 60_000, // 5 minutos
    retry: 1,
  });
}

// 2) Hook para obtener una sola materia por ID
export function useMateria(id: number, enabled = true) {
  return useQuery<Materia, Error>({
    queryKey: ["materias", id],
    queryFn: () => getMateria(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

// 3) Hook para crear una nueva materia
export function useCreateMateria() {
  const qc = useQueryClient();
  return useMutation<Materia, Error, MateriaPayload>({
    mutationFn: createMateria,
    onSuccess: () => {
      // invalidamos lista para que vuelva a fetch
      qc.invalidateQueries({ queryKey: ["materias"] });
    },
  });
}

// 4) Hook para actualizar una materia existente
export function useUpdateMateria() {
  const qc = useQueryClient();
  return useMutation<Materia, Error, { id: number; payload: MateriaPayload }>({
    mutationFn: ({ id, payload }) => updateMateria(id, payload),
    onSuccess: (_, { id }) => {
      // invalidamos tanto la lista como el dato individual
      qc.invalidateQueries({ queryKey: ["materias"] });
      qc.invalidateQueries({ queryKey: ["materias", id] });
    },
  });
}

// 5) Hook para eliminar una materia
export function useDeleteMateria() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => deleteMateria(id),
    onSuccess: (_, id) => {
      // invalidamos la lista y el detalle
      qc.invalidateQueries({ queryKey: ["materias"] });
      qc.invalidateQueries({ queryKey: ["materias", id] });
    },
  });
}
