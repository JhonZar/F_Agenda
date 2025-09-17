"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster, toast } from "sonner";
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
import { Plus, Search, Edit, Trash2 } from "lucide-react";

import {
  useEstudiantes,
  useCreateEstudiante,
  useUpdateEstudiante,
  useDeleteEstudiante,
} from "@/hooks/useEstudiantes";
import type {
  Estudiante,
  CreateEstudiantePayload,
  UpdateEstudiantePayload,
} from "@/api/estudiantes";

import { io, Socket } from "socket.io-client";

// Puedes configurar el origen del WS en .env: VITE_RFID_WS_ORIGIN=http://localhost:3001
const RFID_WS_ORIGIN = (import.meta as any)?.env?.VITE_RFID_WS_ORIGIN || "http://localhost:4000";

export default function EstudiantesPage() {
  const { data: estudiantes = [], isLoading, isError, error } =
    useEstudiantes();
  const createMut = useCreateEstudiante();
  const updateMut = useUpdateEstudiante();
  const deleteMut = useDeleteEstudiante();

  // Estado del modal y formulario (deben existir antes de handlers/efectos que los usan)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Estudiante | null>(null);
  const [form, setForm] = useState<CreateEstudiantePayload>({
    name: "",
    email: "",
    phone: "",
    ci: "",
    rfid: "",
  });

  // Estado para captura RFID en tiempo real
  const [rfidCapture, setRfidCapture] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Maneja eventos entrantes del WS
  const handleRfidEvent = (event: any) => {
    // Normalizamos tipos esperados: unknown_uid y attendance
    const type = event?.type || event?.event || null;

    if (!type) return;

    if (type === "unknown_uid") {
      const uid = event?.uid;
      // Si el modal está abierto y estamos en modo captura, autocompletar el input RFID
      if (dialogOpen && rfidCapture && uid) {
        setForm((f) => ({ ...f, rfid: uid }));
        toast.success(`RFID capturado: ${uid}`);
        // Desactiva captura automática tras capturar uno
        setRfidCapture(false);
      }
    } else if (type === "attendance") {
      const action = event?.attendance?.action || "check_in";
      const name = event?.user?.name || "Estudiante";
      toast.info(`${name}: ${action === "check_out" ? "Salida" : "Entrada"} registrada`);
    } else {
      // Fallback por si el server emite un "rfid_read" simple
      if (dialogOpen && rfidCapture && event?.uid) {
        setForm((f) => ({ ...f, rfid: event.uid }));
        toast.success(`RFID capturado: ${event.uid}`);
        setRfidCapture(false);
      }
    }
  };

  useEffect(() => {
    // Conecta solo cuando el modal esté abierto y el modo captura activo
    if (!(dialogOpen && rfidCapture)) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocketConnected(false);
      return;
    }

    const socket = io(RFID_WS_ORIGIN, {
      transports: ["websocket"],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));

    // Escucha los posibles nombres de eventos
    socket.on("rfid_read", handleRfidEvent);
    socket.on("unknown_uid", handleRfidEvent);
    socket.on("attendance", handleRfidEvent);
    socket.on("status", (s: any) => {
      // opcional: podrías usarlo para UI
      console.debug("RFID WS status:", s);
    });

    socket.on("connect_error", (err) => {
      console.error("RFID WS error:", err);
      toast.error("Sin conexión al lector (WS)");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    };
  }, [dialogOpen, rfidCapture]);

  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = estudiantes ?? [];
    if (!term) return list;
    return list.filter((e) =>
      [e.name, e.email, e.phone ?? "", e.ci, e.rfid ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [estudiantes, search]);
console.log(filtered);
  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", email: "", phone: "", ci: "", rfid: "" });
    setDialogOpen(true);
    // activa escucha automática en modo creación
    setRfidCapture(true);
  };

  const openEdit = (e: Estudiante) => {
    setEditing(e);
    setForm({ name: e.name, email: e.email, phone: e.phone, ci: e.ci, rfid: e.rfid });
    setDialogOpen(true);
    // no forzamos captura en edición; el usuario puede activarla si quiere sobreescribir RFID
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMut.mutateAsync(id);
      toast.success("Estudiante eliminado");
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar");
    }
  };

  // Evita enviar strings vacíos en update (para que Laravel no dispare "required")
  const sanitizeForUpdate = (obj: CreateEstudiantePayload) => {
    const out: Partial<CreateEstudiantePayload> = {};
    (Object.keys(obj) as (keyof CreateEstudiantePayload)[]).forEach((k) => {
      const v = obj[k];
      if (v === undefined || v === null) return;
      if (typeof v === "string") {
        const trimmed = v.trim();
        if (trimmed === "") return; // no enviar campo vacío
        // Normaliza RFID a mayúsculas
        // @ts-ignore
        out[k] = k === "rfid" ? (trimmed as string).toUpperCase() : trimmed;
      } else {
        // @ts-ignore
        out[k] = v;
      }
    });
    return out;
  };

  const handleSubmit = async () => {
  try {
    if (editing) {
      // Solo enviar campos no vacíos para no gatillar "sometimes|required"
      const sanitized = sanitizeForUpdate(form);
      const payload: UpdateEstudiantePayload = {
        id: editing.id,
        payload: sanitized,
      };
      await updateMut.mutateAsync(payload);
      toast.success("Estudiante actualizado");
    } else {
      // En creación puedes enviar el form completo
      await createMut.mutateAsync(form);
      toast.success("Estudiante creado");
    }
    setDialogOpen(false);
  } catch (err: any) {
    const errors = err?.response?.data?.errors;
    if (errors) {
      const firstError = Object.values(errors)[0] as string[];
      toast.error(firstError?.[0] || "Error de validación");
    } else {
      toast.error(err.message || "Error al guardar estudiante");
    }
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  if (isLoading) return <p>Cargando…</p>;
  if (isError) return <p className="text-red-500">{error?.message}</p>;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <div>
            <h2 className="text-3xl font-bold">Estudiantes</h2>
            <p className="text-slate-600">Gestión de estudiantes matriculados</p>
          </div>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Estudiante
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estudiantes.length}</div>
            <CardDescription>Registrados</CardDescription>
          </CardContent>
        </Card>
        {/* ...más métricas si quieres */}
      </div>

      {/* Tabla y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-slate-600" /> Lista de Estudiantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
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
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>CI</TableHead>
                <TableHead>RFID</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{e.name}</TableCell>
                  <TableCell>{e.email}</TableCell>
                  <TableCell>{e.phone || "—"}</TableCell>
                  <TableCell>{e.ci}</TableCell>
                  <TableCell>
                    {e.rfid ? (
                      <span title={e.rfid} className="inline-flex items-center text-green-600">
                        ✓
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(e)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(e.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Crear/Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Estudiante" : "Nuevo Estudiante"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Modifica los datos del estudiante"
                : "Completa los datos del nuevo estudiante"}
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                value={form.phone || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ci">CI</Label>
              <Input id="ci" name="ci" value={form.ci} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="rfid">RFID</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={rfidCapture ? "default" : "outline"}
                    onClick={() => setRfidCapture((v) => !v)}
                  >
                    {rfidCapture ? "Escuchando…" : "Capturar con lector"}
                  </Button>
                  <span className={`text-xs ${socketConnected ? "text-green-600" : "text-slate-400"}`}>
                    {socketConnected ? "WS conectado" : "WS desconectado"}
                  </span>
                </div>
              </div>
              <Input
                id="rfid"
                name="rfid"
                value={form.rfid || ""}
                onChange={handleChange}
                placeholder={rfidCapture ? "Acerque la tarjeta al lector…" : ""}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editing ? "Actualizar" : "Crear"} Estudiante
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
