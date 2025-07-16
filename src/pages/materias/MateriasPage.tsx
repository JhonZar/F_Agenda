"use client";

import React, { useState, useEffect } from "react";
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
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  BookOpen,
} from "lucide-react";

import type { Materia, MateriaPayload } from "@/api/materias";
import {  useMaterias,
   useCreateMateria,
   useUpdateMateria,
   useDeleteMateria, } from "./hook/useMaterias";

export default function MateriasPage() {
  const { data: materias = [], isLoading, error } = useMaterias();
  const createMutation = useCreateMateria();
  const updateMutation = useUpdateMateria();
  const deleteMutation = useDeleteMateria();

  const [filtered, setFiltered] = useState<Materia[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Materia | null>(null);
  const [form, setForm] = useState<MateriaPayload>({ name: "", description: "" });

  // Filtrado
  useEffect(() => {
    setFiltered(
      materias.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        (m.description ?? "").toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [materias, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "" });
    setDialogOpen(true);
  };

  const openEdit = (m: Materia) => {
    setEditing(m);
    setForm({ name: m.name, description: m.description ?? "" });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Materia eliminada");
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar materia");
    }
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload: form });
        toast.success("Materia actualizada");
      } else {
        await createMutation.mutateAsync(form);
        toast.success("Materia creada");
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Error al guardar materia");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Estadísticas
  const total = materias.length;
  const withDesc = materias.filter((m) => m.description).length;
  const withoutDesc = total - withDesc;
  const initials = new Set(materias.map((m) => m.name.charAt(0))).size;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Sonner */}
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <div>
            <h2 className="text-3xl font-bold">Materias</h2>
            <p className="text-slate-600">Gestión de materias</p>
          </div>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary-dark">
          <Plus className="mr-2 h-4 w-4" /> Nueva Materia
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Total</CardTitle>
            <BookOpen className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <CardDescription>Registradas</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Con descripción</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{withDesc}</div>
            <CardDescription>Detalladas</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Sin descripción</CardTitle>
            <BookOpen className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{withoutDesc}</div>
            <CardDescription>Pendientes</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Iniciales</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{initials}</div>
            <CardDescription>Únicas</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Tabla y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-slate-600" />
            Lista de Materias
          </CardTitle>
          <CardDescription>Administra las materias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.name}</TableCell>
                  <TableCell>{m.description || "—"}</TableCell>
                  <TableCell>
                    {new Date(m.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(m)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(m.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {isLoading && <p>Cargando…</p>}
          {error && <p className="text-red-500">{error.message}</p>}
        </CardContent>
      </Card>

      {/* Modal Crear/Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Materia" : "Nueva Materia"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Modifica los datos de la materia"
                : "Completa los datos de la nueva materia"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full rounded-md border px-3 py-2 focus:ring focus:ring-primary"
                value={form.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editing ? "Actualizar" : "Crear"} Materia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
