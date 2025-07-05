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
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  GraduationCap,
  Phone,
  Mail,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { useProfesores } from "./hook/useProfesores";
import type { Profesor } from "@/api/profesores";

// Extendemos el tipo recibido con campos locales
interface TeacherLocal extends Profesor {
  phone: string;
  ci: string;
  specialization: string;
  subjects: string[];
  status: "active" | "inactive" | "vacation";
  hireDate: string;
  address: string;
}

export default function TeachersPage() {
  const { profesores, loading, error, refetch, addProfesor } = useProfesores();

  const [teachers, setTeachers] = useState<TeacherLocal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TeacherLocal | null>(null);
  const [form, setForm] = useState<TeacherLocal>({
    id: 0,
    name: "",
    email: "",
    phone: "",
    ci: "",
    specialization: "",
    subjects: [],
    status: "active",
    hireDate: new Date().toISOString().slice(0, 10),
    address: "",
  });

  // Mapear cada profesor recibido a TeacherLocal con valores por defecto
  useEffect(() => {
    setTeachers(
      profesores.map((p) => ({
        ...p,
        phone: p.phone ?? "",
        ci: p.ci ?? "",
        specialization: "General",
        subjects: [],
        status: "active",
        hireDate: new Date().toISOString().slice(0, 10),
        address: "",
      }))
    );
  }, [profesores]);

  // Filtrado por búsqueda
  const filtered = teachers.filter((t) =>
    [t.name, t.email, t.ci, t.specialization]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Abrir modal para crear
  const openCreate = () => {
    setEditing(null);
    setForm({
      id: 0,
      name: "",
      email: "",
      phone: "",
      ci: "",
      specialization: "",
      subjects: [],
      status: "active",
      hireDate: new Date().toISOString().slice(0, 10),
      address: "",
    });
    setIsDialogOpen(true);
  };

  // Abrir modal para editar
  const openEdit = (t: TeacherLocal) => {
    setEditing(t);
    setForm(t);
    setIsDialogOpen(true);
  };

  // Eliminar (temporal)
  const handleDelete = (id: number) => {
    console.log("Eliminar profesor:", id);
  };

  // Guardar o crear
  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      ci: form.ci, // <-- aquí vas
    };
    if (editing) {
      console.log("Guardar cambios de:", form);
    } else {
      await addProfesor(payload);
      refetch();
    }
    setIsDialogOpen(false);
  };

  // Manejar cambios en inputs/textareas
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]:
        name === "subjects" ? value.split(",").map((s) => s.trim()) : value,
    }));
  };

  // Manejar cambio de status
  const handleStatusChange = (v: string) => {
    setForm((f) => ({ ...f, status: v as TeacherLocal["status"] }));
  };

  // Colores y textos para estado
  const getStatusColor = (s: string) => {
    switch (s) {
      case "active":
        return "bg-green-100 text-green-800";
      case "vacation":
        return "bg-blue-100 text-blue-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const getStatusText = (s: string) => {
    switch (s) {
      case "active":
        return "Activo";
      case "vacation":
        return "Vacaciones";
      case "inactive":
        return "Inactivo";
      default:
        return "Desconocido";
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <div>
            <h2 className="text-3xl font-bold">Profesores</h2>
            <p className="text-slate-600">Gestión del personal docente</p>
          </div>
        </div>
        <Button
          onClick={openCreate}
          className="bg-primary hover:bg-primary-dark"
        >
          <Plus className="mr-2 h-4 w-4" /> Nuevo Profesor
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Total</CardTitle>
            <GraduationCap className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
            <CardDescription>Registrados</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Activos</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teachers.filter((t) => t.status === "active").length}
            </div>
            <CardDescription>En servicio</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Vacaciones</CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teachers.filter((t) => t.status === "vacation").length}
            </div>
            <CardDescription>En vacaciones</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Especializaciones</CardTitle>
            <GraduationCap className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(teachers.map((t) => t.specialization)).size}
            </div>
            <CardDescription>Áreas distintas</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Tabla & búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-slate-600" />
            Lista de Profesores
          </CardTitle>
          <CardDescription>Administra el personal docente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>CI</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.name}</TableCell>
                  <TableCell>{t.email}</TableCell>
                  <TableCell>{t.ci}</TableCell>
                  <TableCell>{t.phone}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(t)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(t.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {loading && <p>Cargando...</p>}
          {error && <p className="text-red-500">{error}</p>}
        </CardContent>
      </Card>

      {/* Diálogo crear/editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Profesor" : "Nuevo Profesor"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Modifica los datos del professor"
                : "Completa los datos del nuevo profesor"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ci">CI</Label>
                <Input
                  id="ci"
                  name="ci"
                  value={form.ci}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editing ? "Actualizar" : "Crear"} Profesor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
