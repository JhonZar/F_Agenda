// src/views/academico/ParaleloEstudiantePage/hooks/useFilteredStudents.ts
import { useMemo } from "react";

export interface Student {
  id: number;
  name: string;
  currentParallel?: string;
}

export function useFilteredStudents(
  estudiantes: { id: number; name: string }[],
  assignedMap: Map<number, string>,
  searchTerm: string
) {
  const unassigned = useMemo(
    () => estudiantes.filter((u) => !assignedMap.has(u.id)),
    [estudiantes, assignedMap]
  );

  const assigned = useMemo(
    () =>
      estudiantes
        .filter((u) => assignedMap.has(u.id))
        .map((u) => ({
          id: u.id,
          name: u.name,
          currentParallel: assignedMap.get(u.id)!,
        })),
    [estudiantes, assignedMap]
  );

  const filteredUnassigned = useMemo(
    () =>
      unassigned.filter((u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [unassigned, searchTerm]
  );

  const filteredAssigned = useMemo(
    () =>
      assigned.filter((u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [assigned, searchTerm]
  );

  return { unassigned, assigned, filteredUnassigned, filteredAssigned };
}
