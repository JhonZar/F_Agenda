// src/views/academico/ParaleloEstudiantePage/hooks/useAssignedMap.ts
import { useMemo } from "react";
import type { Paralelo } from "@/api/paralelos";
import type { UseQueryResult } from "@tanstack/react-query";

export function useAssignedMap(
  paralelos: Paralelo[],
  asignadasQueries: UseQueryResult<{ id: number }[], any>[]
) {
  return useMemo(() => {
    const map = new Map<number, string>();
    paralelos.forEach((p, i) => {
      const lista = asignadasQueries[i]?.data;
      if (lista) {
        lista.forEach((u) => {
          map.set(u.id, `${p.grade}-${p.section}`);
        });
      }
    });
    return map;
  }, [paralelos, asignadasQueries]);
}
