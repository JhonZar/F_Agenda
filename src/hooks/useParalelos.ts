import { useState, useCallback } from "react";
import {
  getParalelos,
  createParalelo,
  updateParalelo,
  deleteParalelo,
  type Paralelo,
  type ParaleloPayload,
} from "@/api/paralelos";

export function useParalelos() {
  const [paralelos, setParalelos] = useState<Paralelo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listar todos
  const fetchParalelos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getParalelos();
      setParalelos(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al cargar paralelos");
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear
  const addParalelo = useCallback(async (payload: ParaleloPayload) => {
    setLoading(true);
    setError(null);
    try {
      const nuevo = await createParalelo(payload);
      setParalelos((prev) => [...prev, nuevo]);
      return nuevo;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al crear paralelo");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar
  const editParalelo = useCallback(async (id: number, payload: ParaleloPayload) => {
    setLoading(true);
    setError(null);
    try {
      const actualizado = await updateParalelo(id, payload);
      setParalelos((prev) =>
        prev.map((p) => (p.id === id ? actualizado : p))
      );
      return actualizado;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al actualizar paralelo");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar
  const removeParalelo = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await deleteParalelo(id);
      setParalelos((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al eliminar paralelo");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    paralelos,
    loading,
    error,
    fetchParalelos,
    addParalelo,
    editParalelo,
    removeParalelo,
    setParalelos, // por si necesitas manipular manualmente
  };
}