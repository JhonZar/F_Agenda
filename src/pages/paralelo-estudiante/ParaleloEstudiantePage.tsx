// src/views/academico/ParaleloEstudiantePage.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import type { Paralelo } from "@/api/paralelos";
import { getStudentsForParalelo } from "@/api/paraleloEstudiantes";
import { useParalelos } from "@/hooks/useParalelos";
import { useEstudiantes } from "@/hooks/useEstudiantes";
import {
  useAssignStudent,
  useRemoveStudent,
} from "./hook/useParaleloEstudiantes";

import { TooltipProvider } from "@/components/ui/tooltip";

import { Header } from "./components/Header";
import { StatsCards } from "./components/StatsCards";
import { ParallelsOverview } from "./components/ParallelsOverview";
import { StudentList } from "./components/StudentList";
import { AssignDialog } from "./components/AssignDialog";
import { useAssignedMap } from "./hook/useAssignedMap";
import { useFilteredStudents } from "./hook/useFilteredStudents";

const DEFAULT_CAPACITY = 50;

export default function ParaleloEstudiantePage() {
  // 1) Paralelos
  const {
    paralelos,
    loading: loadingP,
    error: errorP,
    fetchParalelos,
  } = useParalelos();
  useEffect(() => {
    fetchParalelos();
  }, [fetchParalelos]);

  // 2) Estudiantes
  const { data: estudiantes = [] } = useEstudiantes();

  // 3) Queries de asignados por paralelo
  const asignQueries = useQueries({
    queries: paralelos.map((p) => ({
      queryKey: ["paraleloEstudiantes", p.id] as const,
      queryFn: () => getStudentsForParalelo(p.id),
      enabled: !!p.id,
      staleTime: 300_000,
      retry: 1,
    })),
  });

  // 4) Mapa de asignaciones
  const assignedMap = useAssignedMap(paralelos, asignQueries);

  // 5) Filtrado
  const [searchTerm, setSearchTerm] = useState("");
  const { filteredUnassigned, filteredAssigned } = useFilteredStudents(
    estudiantes,
    assignedMap,
    searchTerm
  );

  // 6) Selección y mutaciones
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [selectedParallel, setSelectedParallel] = useState<string>("");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isLoadingAssign, setIsLoadingAssign] = useState(false);

  const assignMut = useAssignStudent(Number(selectedParallel));
  const removeMut = useRemoveStudent(0);

  // 7) Estadísticas
  const totalStudents = estudiantes.length;
  const totalUnassigned = filteredUnassigned.length;
  const totalAssigned = filteredAssigned.length;
  const totalParallels = paralelos.length;

  // 8) Conteos por paralelo y disponibilidad
  const assignedCountById = useMemo(
    () =>
      Object.fromEntries(
        paralelos.map((p, i) => [p.id, asignQueries[i].data?.length ?? 0])
      ),
    [paralelos, asignQueries]
  );

  function getParallelAvailability(p: Paralelo) {
    const current = assignedCountById[p.id] ?? 0;
    const percentage = (current / DEFAULT_CAPACITY) * 100;
    if (percentage >= 100) return { color: "bg-red-500", text: "Completo" };
    if (percentage >= 80) return { color: "bg-yellow-500", text: "Casi lleno" };
    return { color: "bg-green-500", text: "Disponible" };
  }

  // 9) Handlers
  const handleToggle = (id: number) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const handleSelectAll = () => {
    const ids = filteredUnassigned.map((u) => u.id);
    setSelectedStudents((prev) =>
      prev.length === ids.length ? [] : ids
    );
  };
  const handleAssign = async () => {
    if (!selectedParallel || selectedStudents.length === 0) return;
    setIsLoadingAssign(true);
    try {
      await Promise.all(
        selectedStudents.map((stuId) =>
          assignMut.mutateAsync({ student_id: stuId })
        )
      );
      toast.success("Estudiantes asignados");
      setSelectedStudents([]);
      setIsAssignDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Error en la asignación");
    } finally {
      setIsLoadingAssign(false);
    }
  };
  const handleRemove = async (studentId: number) => {
    try {
      await removeMut.mutateAsync(studentId);
      toast.success("Desasignado");
    } catch (e: any) {
      toast.error(e.message || "Error");
    }
  };

  if (loadingP) return <p>Cargando paralelos…</p>;
  if (errorP) return <p className="text-red-500">{errorP}</p>;

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Toaster position="top-right" richColors />

        <Header onRefresh={fetchParalelos} />

        <StatsCards
          totalStudents={totalStudents}
          totalUnassigned={totalUnassigned}
          totalAssigned={totalAssigned}
          totalParallels={totalParallels}
        />

        <ParallelsOverview
          paralelos={paralelos}
          assignedCountById={assignedCountById}
          getAvailability={getParallelAvailability}
        />

        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          <StudentList
            title="Sin Asignar"
            students={filteredUnassigned}
            countLabel={filteredUnassigned.length.toString()}
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            selectedIds={selectedStudents}
            onToggle={handleToggle}
            onSelectAll={handleSelectAll}
            showAssignBar={selectedStudents.length > 0}
            onAssignClick={() => setIsAssignDialogOpen(true)}
          />

          <StudentList
            title="Asignados"
            students={filteredAssigned}
            countLabel={filteredAssigned.length.toString()}
            onRemove={handleRemove}
          />
        </div>

        <AssignDialog
          open={isAssignDialogOpen}
          onClose={() => setIsAssignDialogOpen(false)}
          paralelos={paralelos}
          assignedCountById={assignedCountById}
          selectedCount={selectedStudents.length}
          selectedParallel={selectedParallel}
          onSelectParallel={setSelectedParallel}
          onConfirm={handleAssign}
          loading={isLoadingAssign}
        />
      </div>
    </TooltipProvider>
  );
}
