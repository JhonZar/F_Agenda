// src/hooks/useProfesores.ts
import {
  getProfesores,
  createProfesor,
  type Profesor,
  type CreateProfesorPayload,
} from "@/api/profesores";
import { useState, useEffect } from "react";

export function useProfesores() {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const list = await getProfesores();
      setProfesores(list);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al cargar profesores");
    } finally {
      setLoading(false);
    }
  };

  const addProfesor = async (payload: CreateProfesorPayload) => {
    setLoading(true);
    try {
      const nuevo = await createProfesor(payload);
      setProfesores((prev) => [...prev, nuevo]);
      setError(null);
      return nuevo;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al crear profesor");
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return { profesores, loading, error, refetch: fetch, addProfesor };
}
