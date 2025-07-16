// src/views/academico/ParaleloEstudiantePage.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
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
  useAssignStudent,
  useSyncStudents,
  useRemoveStudent,
} from "./hook/useParaleloEstudiantes";
import { useEstudiantes } from "@/hooks/useEstudiantes";
import { getStudentsForParalelo } from "@/api/paraleloEstudiantes";
import type { Paralelo } from "@/api/paralelos";
import type { User } from "@/api/login";

export default function ParaleloEstudiantePage() {
  // 1) Traer paralelos
  const {
    paralelos,
    loading: loadingP,
    error: errorP,
    fetchParalelos,
  } = useParalelos();
  useEffect(() => {
    fetchParalelos();
  }, [fetchParalelos]);

  // 2) Traer todos los estudiantes
  const {
    data: estudiantes = [],
  } = useEstudiantes();

  // 3) Para cada paralelo, fetch de sus estudiantes asignados
  const asignadasQueries = useQueries({
    queries: paralelos.map((p) => ({
      queryKey: ["paraleloEstudiantes", p.id] as const,
      queryFn: () => getStudentsForParalelo(p.id),
      enabled: !!p.id,
      staleTime: 300_000,
      retry: 1,
    })),
  });

  // 4) UI: filtros / paralelo activo
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "assigned" | "unassigned">("all");
  const [activeParalelo, setActiveParalelo] = useState<Paralelo | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);

  // 5) Mutaciones para el paralelo activo
  const paraleloId = activeParalelo?.id ?? 0;
  const assignMut = useAssignStudent(paraleloId);
  const syncMut   = useSyncStudents(paraleloId);
  const removeMut = useRemoveStudent(paraleloId);

  // 6) Formularios modales
  const [selStudentId, setSelStudentId] = useState<number | "">("");
  const [syncList, setSyncList] = useState<number[]>([]);

  // 7) Armar lista de asignados del paralelo activo
  const activeIndex = activeParalelo
    ? paralelos.findIndex((p) => p.id === activeParalelo.id)
    : -1;
  const activeAsignados: User[] =
    activeIndex >= 0 ? asignadasQueries[activeIndex].data || [] : [];

  // Precarga syncList al abrir el modal de sincronizar
  useEffect(() => {
    if (syncOpen) {
      setSyncList(activeAsignados.map((u) => u.id));
    }
  }, [syncOpen, activeAsignados]);

  // 8) Filtrar paralelos según búsqueda y modo
  const filteredParalelos = useMemo(() => {
    return paralelos.filter((p, i) => {
      const assigned: User[] = asignadasQueries[i].data || [];
      const text = `${p.grade}-${p.section} ${p.teacher.name}`.toLowerCase();
      if (!text.includes(searchTerm.toLowerCase())) return false;
      if (filterMode === "assigned")   return assigned.length > 0;
      if (filterMode === "unassigned") return assigned.length === 0;
      return true;
    });
  }, [paralelos, asignadasQueries, searchTerm, filterMode]);

  // --- Handlers ---
  const handleAssign = async () => {
    if (!selStudentId || !activeParalelo) {
      toast.error("Selecciona un estudiante");
      return;
    }
    try {
      await assignMut.mutateAsync({ student_id: selStudentId });
      toast.success("Estudiante asignado");
      setAssignOpen(false);
      setSelStudentId("");
    } catch (err: any) {
      toast.error(err.message || "Error al asignar estudiante");
    }
  };

  const handleRemove = async (studentId: number) => {
    if (!activeParalelo) return;
    try {
      await removeMut.mutateAsync(studentId);
      toast.success("Estudiante desasignado");
    } catch (err: any) {
      toast.error(err.message || "Error al desasignar estudiante");
    }
  };

  const handleSync = async () => {
    try {
      await syncMut.mutateAsync({ student_ids: syncList });
      toast.success("Sincronización completada");
      setSyncOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Error al sincronizar estudiantes");
    }
  };

  // --- Loading & error globales ---
  if (loadingP) return <p>Cargando paralelos…</p>;
  if (errorP)   return <p className="text-red-500">{errorP}</p>;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Toaster position="top-right" richColors />

      {/* Buscador + filtros */}
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
            Con estudiantes
          </Button>
          <Button
            variant={filterMode === "unassigned" ? "default" : "outline"}
            onClick={() => setFilterMode("unassigned")}
          >
            Sin estudiantes
          </Button>
        </div>
      </div>

      {/* Tarjetas de Paralelos */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredParalelos.map((p, idx) => {
          const assigned: User[] = asignadasQueries[idx].data || [];
          return (
            <Card key={p.id} className="space-y-4">
              <CardHeader>
                <CardTitle>
                  {p.grade}-{p.section}
                </CardTitle>
                <CardDescription>
                  Profesor: {p.teacher.name}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {assigned.length > 0 ? (
                  <ul className="space-y-1">
                    {assigned.map((u) => (
                      <li
                        key={u.id}
                        className="flex justify-between items-center"
                      >
                        <span>{u.name}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setActiveParalelo(p);
                            handleRemove(u.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sin estudiantes asignados
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

      {/* Modal: Asignar estudiante */}
      <Dialog open={assignOpen} onOpenChange={() => setAssignOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Asignar estudiante a{" "}
              {activeParalelo
                ? `${activeParalelo.grade}-${activeParalelo.section}`
                : ""}
            </DialogTitle>
            <DialogDescription>
              Selecciona un estudiante disponible.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Label htmlFor="stu-select">Estudiante</Label>
            <select
              id="stu-select"
              className="w-full rounded-md border px-3 py-2"
              value={selStudentId}
              onChange={(e) =>
                setSelStudentId(
                  e.target.value ? Number(e.target.value) : ""
                )
              }
            >
              <option value="">-- selecciona --</option>
              {estudiantes
                .filter((u) => !activeAsignados.some((a) => a.id === u.id))
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
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

      {/* Modal: Sincronizar estudiantes */}
      <Dialog open={syncOpen} onOpenChange={() => setSyncOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Sincronizar estudiantes de{" "}
              {activeParalelo
                ? `${activeParalelo.grade}-${activeParalelo.section}`
                : ""}
            </DialogTitle>
            <DialogDescription>
              Marca a los estudiantes que quieres mantener asignados.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-80 overflow-auto py-4 space-y-2">
            {estudiantes.map((u) => (
              <label key={u.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={syncList.includes(u.id)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSyncList((prev) =>
                      checked ? [...prev, u.id] : prev.filter((id) => id !== u.id)
                    );
                  }}
                />
                <span>{u.name}</span>
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
