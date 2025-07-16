// src/views/academico/ParaleloCursoMateriaPage.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, RefreshCw, Trash2 } from "lucide-react";

import { useParalelos } from "@/hooks/useParalelos";
import {
  useAssignMateriaToParalelo,
  useSyncMateriasForParalelo,
} from "./hook/useParaleloMaterias";
import {
  getMateriasForParalelo,
  removeMateriaFromParalelo,
} from "@/api/paraleloMaterias";
import { useMaterias } from "../materias/hook/useMaterias";
import type { Paralelo } from "@/api/paralelos";

export default function ParaleloCursoMateriaPage() {
  // 1) Traer paralelos
  const {
    paralelos,
    loading: loadingParalelos,
    error: errorParalelos,
    fetchParalelos,
  } = useParalelos();
  useEffect(() => {
    fetchParalelos();
  }, [fetchParalelos]);

  // 2) Traer todas las materias
  const { data: todas = [] } = useMaterias();

  // 3) Para cada paralelo, fetch de sus materias asignadas
  const asignadasQueries = useQueries({
    queries: paralelos.map((p) => ({
      queryKey: ["paraleloMaterias", p.id] as const,
      queryFn: () => getMateriasForParalelo(p.id),
      enabled: !!p.id,
      staleTime: 5 * 60_000,
      retry: 1,
    })),
  });

  // queryClient para invalidaciones
  const qc = useQueryClient();

  // 4) Estados UI
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "assigned" | "unassigned">("all");
  const [activeParalelo, setActiveParalelo] = useState<Paralelo | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);

  // 5) Hook y mutaciones dinámicas para el paralelo activo
  const paraleloId = activeParalelo?.id ?? 0;
  const assignMut = useAssignMateriaToParalelo(paraleloId);
  const syncMut = useSyncMateriasForParalelo(paraleloId);

  // 6) Formularios modales
  const [selMateriaId, setSelMateriaId] = useState<number | "">("");
  const [syncList, setSyncList] = useState<number[]>([]);

  // 7) Extraer materias asignadas del activo
  const activeIndex = activeParalelo
    ? paralelos.findIndex((p) => p.id === activeParalelo.id)
    : -1;
  const activeAsignadas =
    activeIndex >= 0 ? asignadasQueries[activeIndex].data || [] : [];

  // cuando abro “Sincronizar” precargo la lista
  useEffect(() => {
    if (syncOpen) {
      setSyncList(activeAsignadas.map((m) => m.id));
    }
  }, [syncOpen, activeAsignadas]);

  // 8) Filtrar paralelos por búsqueda y modo
  const filteredParalelos = useMemo(() => {
    return paralelos.filter((p, i) => {
      const asignadas = asignadasQueries[i].data || [];
      const text = `${p.grade}-${p.section} ${p.teacher.name}`.toLowerCase();
      if (!text.includes(searchTerm.toLowerCase())) return false;
      if (filterMode === "assigned") return asignadas.length > 0;
      if (filterMode === "unassigned") return asignadas.length === 0;
      return true;
    });
  }, [paralelos, asignadasQueries, searchTerm, filterMode]);

  // --- Handlers ---
  const handleAssign = async () => {
    if (!selMateriaId || !activeParalelo) {
      toast.error("Selecciona una materia");
      return;
    }
    try {
      await assignMut.mutateAsync({ materia_id: selMateriaId });
      toast.success("Materia asignada");
      setAssignOpen(false);
      setSelMateriaId("");
    } catch (err: any) {
      toast.error(err.message || "Error al asignar materia");
    }
  };

  const handleRemove = async (parId: number, mId: number) => {
    try {
      await removeMateriaFromParalelo(parId, mId);
      qc.invalidateQueries({ queryKey: ["paraleloMaterias", parId] });
      toast.success("Materia desasignada");
    } catch (err: any) {
      toast.error(err.message || "Error al desasignar materia");
    }
  };

  const handleSync = async () => {
    try {
      await syncMut.mutateAsync({ materia_ids: syncList });
      toast.success("Sincronización completada");
      setSyncOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Error al sincronizar materias");
    }
  };

  if (loadingParalelos) return <p>Cargando paralelos…</p>;
  if (errorParalelos) return <p className="text-red-500">{errorParalelos}</p>;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Toaster position="top-right" richColors />

      {/* Buscador y filtros */}
      <div className="flex items-center justify-between">
        <SidebarTrigger />
        <div className="flex items-center gap-4">
          <Input
            placeholder="Buscar paralelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button
            variant={filterMode === "all" ? "default" : "outline"}
            onClick={() => setFilterMode("all")}
          >
            Todos
          </Button>
          <Button
            variant={filterMode === "assigned" ? "default" : "outline"}
            onClick={() => setFilterMode("assigned")}
          >
            Con materias
          </Button>
          <Button
            variant={filterMode === "unassigned" ? "default" : "outline"}
            onClick={() => setFilterMode("unassigned")}
          >
            Sin materias
          </Button>
        </div>
      </div>

      {/* Tarjetas de paralelos */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredParalelos.map((p, idx) => {
          const asignadas = asignadasQueries[idx].data || [];
          return (
            <Card key={p.id} className="space-y-4">
              <CardHeader>
                <CardTitle>
                  {p.grade}-{p.section}
                </CardTitle>
                <CardDescription>Profesor: {p.teacher.name}</CardDescription>
              </CardHeader>

              <CardContent>
                {asignadas.length > 0 ? (
                  <ul className="space-y-1">
                    {asignadas.map((m) => (
                      <li
                        key={m.id}
                        className="flex justify-between items-center"
                      >
                        <span>{m.name}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemove(p.id, m.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sin materias asignadas
                  </p>
                )}
              </CardContent>

              <div className="flex justify-end gap-2 p-4 pt-0">
                <Button
                  variant="outline"
                  onClick={() => {
                    setActiveParalelo(p);
                    setSyncOpen(true);
                  }}
                >
                  <RefreshCw className="mr-1 h-4 w-4" />
                  Sincronizar
                </Button>
                <Button
                  onClick={() => {
                    setActiveParalelo(p);
                    setAssignOpen(true);
                  }}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Asignar
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal: Asignar una materia */}
      <Dialog open={assignOpen} onOpenChange={() => setAssignOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Asignar materia a{" "}
              {activeParalelo
                ? `${activeParalelo.grade}-${activeParalelo.section}`
                : ""}
            </DialogTitle>
            <DialogDescription>Elige una materia disponible.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Label htmlFor="mat-select">Materia</Label>
            <select
              id="mat-select"
              className="w-full rounded-md border px-3 py-2"
              value={selMateriaId}
              onChange={(e) =>
                setSelMateriaId(e.target.value ? Number(e.target.value) : "")
              }
            >
              <option value="">-- selecciona --</option>
              {todas
                .filter((m) => !activeAsignadas.some((a) => a.id === m.id))
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssign}>Asignar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Sincronizar todas */}
      <Dialog open={syncOpen} onOpenChange={() => setSyncOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Sincronizar materias de{" "}
              {activeParalelo
                ? `${activeParalelo.grade}-${activeParalelo.section}`
                : ""}
            </DialogTitle>
            <DialogDescription>
              Marca las materias que quieres mantener asignadas.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-80 overflow-auto py-4 space-y-2">
            {todas.map((m) => (
              <label key={m.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={syncList.includes(m.id)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSyncList((prev) =>
                      checked ? [...prev, m.id] : prev.filter((id) => id !== m.id)
                    );
                  }}
                />
                <span>{m.name}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSyncOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSync}>Sincronizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
