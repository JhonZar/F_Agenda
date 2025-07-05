"use client";

import React, { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, Grid3X3 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParalelos } from "@/hooks/useParalelos";
// import type { Profesor } from "@/api/paralelos";
import { ProfesorSearch } from "../profesores/components/ProfesorSearch";
import type { Profesor } from "@/api/profesores";

interface Paralelo {
  id: number;
  grade: string;
  section: string;
  teacher_id: number;
  teacher: Profesor;
}

export default function ParalelosPage() {
  const {
    paralelos,
    loading,
    error,
    fetchParalelos,
    addParalelo,
    editParalelo,
    removeParalelo,
  } = useParalelos();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState<string>("all");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<Omit<Paralelo, "teacher">>({
    id: 0,
    grade: "",
    section: "",
    teacher_id: 0,
  });
  const [selectedProfesor, setSelectedProfesor] = useState<Profesor | null>(null);

  // extrae la lista de grados disponibles
  const grades = Array.from(new Set(paralelos.map((p) => p.grade)));

  useEffect(() => {
    fetchParalelos();
  }, [fetchParalelos]);

  // filtra por grado/ sección
  const filtered = paralelos.filter((p) => {
    const matchesSearch =
      p.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.teacher.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === "all" || p.grade === filterGrade;
    return matchesSearch && matchesGrade;
  });

  const openCreate = () => {
    setMode("create");
    setForm({ id: 0, grade: "", section: "", teacher_id: 0 });
    setSelectedProfesor(null);
    setIsDialogOpen(true);
  };

  const openEdit = (p: Paralelo) => {
    setMode("edit");
    setForm({ id: p.id, grade: p.grade, section: p.section, teacher_id: p.teacher_id });
    setSelectedProfesor(p.teacher);
    setIsDialogOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "teacher_id" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedProfesor) {
      alert("Debes seleccionar un profesor");
      return;
    }
    const payload = { grade: form.grade, section: form.section, teacher_id: selectedProfesor.id };
    if (mode === "create") {
      await addParalelo(payload);
    } else {
      await editParalelo(form.id, payload);
    }
    setIsDialogOpen(false);
    fetchParalelos();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este paralelo?")) return;
    await removeParalelo(id);
    fetchParalelos();
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Paralelos</h2>
            <p className="text-slate-600">Gestión de paralelos por grado</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="bg-primary hover:bg-primary-dark">
              <Plus className="mr-2 h-4 w-4" /> Nuevo Paralelo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{mode === "create" ? "Crear Paralelo" : "Editar Paralelo"}</DialogTitle>
              <DialogDescription>
                {mode === "create"
                  ? "Agrega un nuevo paralelo"
                  : "Modifica los datos del paralelo"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-1">
                <Label htmlFor="grade">Grado</Label>
                <Input
                  id="grade"
                  name="grade"
                  value={form.grade}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="section">Sección</Label>
                <Input
                  id="section"
                  name="section"
                  value={form.section}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-1">
                <Label>Profesor</Label>
                <ProfesorSearch
                  onSelect={(prof) => {
                    setSelectedProfesor(prof);
                    setForm((f) => ({ ...f, teacher_id: prof.id }));
                  }}
                />
                {selectedProfesor && (
                  <div className="mt-2 text-sm">
                    Seleccionado: <strong>{selectedProfesor.name}</strong> ({selectedProfesor.email})
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                {mode === "create" ? "Crear" : "Guardar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm">Total</CardTitle>
            <Grid3X3 className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paralelos.length}</div>
            <CardDescription>Total de paralelos</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm">Grados</CardTitle>
            <Grid3X3 className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grades.length}</div>
            <CardDescription>Niveles con paralelos</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar y Filtrar</CardTitle>
          <CardDescription>
            Encuentra paralelos por grado, sección o profesor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filterGrade}
              onValueChange={(v) => setFilterGrade(v)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por grado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {grades.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Grado</TableHead>
                <TableHead>Sección</TableHead>
                <TableHead>Profesor</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.grade}</TableCell>
                  <TableCell>{p.section}</TableCell>
                  <TableCell>
                    {p.teacher.name} <br/>
                    <span className="text-sm text-muted-foreground">{p.teacher.email}</span>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(p)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(p.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {loading && <p className="mt-4">Cargando...</p>}
          {error && <p className="mt-4 text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
