import  { useMemo, useState } from "react";
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
import { Mail, Phone, Plus, Search, Edit, Trash2, User, Link as LinkIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useEstudiantes } from "@/hooks/useEstudiantes";
import { usePadresEstudiantes, useCreatePadreEstudiante, useDeletePadreEstudiante } from "@/hooks/usePadres";
import {
  usePadres,
  useCreatePadre,
  useUpdatePadre,
  useDeletePadre,
} from "@/hooks/usePadres";
import { toast } from "sonner";
import type { Padre } from "@/api/padres";

export default function PadresPage() {
  // server data
  const { data: padres = [], isLoading, isError } = usePadres();
  const createMut = useCreatePadre();
  const updateMut = useUpdatePadre();
  const deleteMut = useDeletePadre();

  // ui state
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Padre | null>(null);
  type PadreForm = { name: string; email: string; phone: string; ci: string };
  const [form, setForm] = useState<PadreForm>({ name: "", email: "", phone: "", ci: "" });

const [linkDialogOpen, setLinkDialogOpen] = useState(false);
const [linkingParent, setLinkingParent] = useState<Padre | null>(null);
const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return padres;
    return padres.filter((p) =>
      [p.name, p.email ?? "", p.phone ?? "", p.ci]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [padres, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", email: "", phone: "", ci: "" });
    setDialogOpen(true);
  };

  const openEdit = (p: Padre) => {
    setEditing(p);
    setForm({ name: p.name ?? "", email: p.email ?? "", phone: p.phone ?? "", ci: p.ci ?? "" });
    setDialogOpen(true);
  };

  const openLinkStudents = (p: Padre) => {
    setLinkingParent(p);
    setLinkDialogOpen(true);
  };

// Mantener seleccionados en sync cuando llegan los links
const { data: estudiantes = [] } = useEstudiantes?.() ?? { data: [] } as any;
const { data: currentLinks = [], isLoading: linksLoading } = usePadresEstudiantes(
  linkingParent ? { padre_id: linkingParent.id } : undefined
);

// Cargar todos los vínculos padre-estudiante para mostrar en la tabla
const { data: allParentLinks = [] } = usePadresEstudiantes();

// Buscador dentro del modal de vinculación
const [linkSearch, setLinkSearch] = useState("");
const filteredStudents = useMemo(() => {
  const q = linkSearch.trim().toLowerCase();
  if (!q) return estudiantes as any[];
  return (estudiantes as any[]).filter((e: any) =>
    [e.name ?? "", e.ci ?? "", e.phone ?? ""].join(" ").toLowerCase().includes(q)
  );
}, [estudiantes, linkSearch]);

  // Mapear padre_id -> [estudiante_id]
  const studentsByParent = useMemo(() => {
    const map = new Map<number, number[]>();
    for (const l of allParentLinks as any[]) {
      const pid = (l as any).padre_id;
      const sid = (l as any).estudiante_id;
      if (typeof pid !== 'number' || typeof sid !== 'number') continue;
      if (!map.has(pid)) map.set(pid, []);
      map.get(pid)!.push(sid);
    }
    return map;
  }, [allParentLinks]);

  // Mapa rápido de estudiante por id para obtener nombre
  const studentById = useMemo(() => {
    const m = new Map<number, any>();
    (estudiantes as any[]).forEach((e: any) => m.set(e.id, e));
    return m;
  }, [estudiantes]);

  const createLinkMut = useCreatePadreEstudiante();
  const deleteLinkMut = useDeletePadreEstudiante();

  const existingStudentIds = useMemo(() => currentLinks.map(l => l.estudiante_id), [currentLinks]);
  
  // Sincroniza selección al abrir o cuando cambien los links
  if (linkDialogOpen && selectedStudents.length === 0 && existingStudentIds.length) {
    setSelectedStudents(existingStudentIds);
  }

  const toggleStudent = (id: number) => {
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const saveLinks = async () => {
    if (!linkingParent) return;
    const toCreate = selectedStudents.filter(id => !existingStudentIds.includes(id));
    const toDelete = currentLinks.filter(l => !selectedStudents.includes(l.estudiante_id));

    try {
      await Promise.allSettled([
        ...toCreate.map(estudiante_id => createLinkMut.mutateAsync({ padre_id: linkingParent.id, estudiante_id })),
        ...toDelete.map(l => deleteLinkMut.mutateAsync(l.id)),
      ]);
      toast.success("Vinculaciones guardadas");
      setLinkDialogOpen(false);
      setLinkingParent(null);
      setSelectedStudents([]);
    } catch (e: any) {
      toast.error(e?.message ?? "Error al guardar vinculación");
    }
  };

  const onSubmit = async () => {
    if (!form.name?.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (!form.ci?.trim()) {
      toast.error("La CI es obligatoria");
      return;
    }

    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, payload: { ...form } });
        toast.success("Padre actualizado");
      } else {
        await createMut.mutateAsync({ ...form });
        toast.success("Padre creado");
      }
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Error al guardar");
    }
  };

  const onDelete = async (id: number) => {
    try {
      await deleteMut.mutateAsync(id);
      toast.success("Padre eliminado");
    } catch (e: any) {
      toast.error(e?.message ?? "Error al eliminar");
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Padres de Familia</h2>
            <p className="text-slate-600">Gestión de padres y tutores</p>
          </div>
        </div>
        <Button onClick={openCreate} className="bg-navy-600 hover:bg-navy-700 text-black">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Padre/Tutor
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total Padres</CardTitle>
            <User className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{padres.length}</div>
            <p className="text-xs text-slate-600">Padres registrados</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Con email</CardTitle>
            <Mail className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{padres.filter((p) => !!p.email).length}</div>
            <p className="text-xs text-slate-600">Registros con correo</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Con teléfono</CardTitle>
            <Phone className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{padres.filter((p) => !!p.phone).length}</div>
            <p className="text-xs text-slate-600">Registros con teléfono</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <User className="h-5 w-5 text-slate-600" /> Lista de Padres de Familia
          </CardTitle>
          <CardDescription className="text-slate-600">
            Administra los padres y tutores vinculados a estudiantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre, email, teléfono o CI..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 border-slate-200 focus:border-slate-400"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-700">Padre/Tutor</TableHead>
                <TableHead className="text-slate-700">Contacto</TableHead>
                <TableHead className="text-slate-700">CI</TableHead>
                <TableHead className="text-slate-700">Estudiantes</TableHead>
                <TableHead className="text-slate-700">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-slate-500">Cargando...</TableCell>
                </TableRow>
              )}
              {isError && (
                <TableRow>
                  <TableCell colSpan={5} className="text-red-600">Error al cargar datos</TableCell>
                </TableRow>
              )}
              {!isLoading && !isError && filtered.map((p) => (
                <TableRow key={p.id} className="border-slate-100">
                  <TableCell>
                    <div className="font-medium text-slate-900">{p.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {p.email && (
                        <div className="flex items-center gap-1 text-sm text-slate-700">
                          <Mail className="h-3 w-3" /> {p.email}
                        </div>
                      )}
                      {p.phone && (
                        <div className="flex items-center gap-1 text-sm text-slate-700">
                          <Phone className="h-3 w-3" /> {p.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-700">{p.ci}</TableCell>
                  <TableCell>
                    {(() => {
                      const ids = studentsByParent.get(p.id) ?? [];
                      if (!ids.length) return <span className="text-slate-500 text-sm">Sin vínculos</span>;
                      const max = 3;
                      const shown = ids.slice(0, max);
                      const extra = ids.length - shown.length;
                      return (
                        <div className="flex flex-wrap gap-1">
                          {shown.map((sid) => {
                            const s = studentById.get(sid);
                            return (
                              <span
                                key={sid}
                                className="inline-flex items-center rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-700"
                                title={s?.name ?? `ID ${sid}`}
                              >
                                {s?.name ?? `#${sid}`}
                              </span>
                            );
                          })}
                          {extra > 0 && (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">+{extra} más</span>
                          )}
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openLinkStudents(p)}
                        className="border-slate-200 text-slate-700 hover:bg-slate-50"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(p)}
                        className="border-slate-200 text-slate-700 hover:bg-slate-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(p.id)}
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={linkDialogOpen} onOpenChange={(o) => { setLinkDialogOpen(o); if (!o) { setLinkingParent(null); setSelectedStudents([]); setLinkSearch(""); } }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Vincular Estudiantes {linkingParent ? `- ${linkingParent.name}` : ""}</DialogTitle>
            <DialogDescription className="text-slate-600">Selecciona los estudiantes bajo tutela de este padre/tutor</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {linksLoading ? (
              <p className="text-slate-500 text-sm">Cargando vínculos...</p>
            ) : (
              <>
                <div className="relative mb-3">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar estudiante por nombre, CI o teléfono..."
                    value={linkSearch}
                    onChange={(e) => setLinkSearch(e.target.value)}
                    className="pl-8 border-slate-200 focus:border-slate-400"
                  />
                </div>
                <div className="space-y-2 max-h-[320px] overflow-auto">
                  {filteredStudents.map((e: any) => {
                    const isSelected = selectedStudents.includes(e.id);
                    const isAssigned = existingStudentIds.includes(e.id);
                    return (
                      <label key={e.id} className={`flex items-center gap-2 p-2 border rounded-md ${isSelected ? "border-navy-300 bg-navy-50" : "border-slate-100"}`}>
                        <Checkbox checked={isSelected} onCheckedChange={() => toggleStudent(e.id)} />
                        <div className="flex-1">
                          <div className="text-slate-900 font-medium">{e.name}</div>
                          <div className="text-slate-600 text-sm">CI: {e.ci}{e.phone ? ` • ${e.phone}` : ""}</div>
                        </div>
                        {isAssigned && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">Asignado</span>
                        )}
                      </label>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <p className="text-slate-500 text-sm">No se encontraron estudiantes para ese término.</p>
                  )}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button onClick={saveLinks} className="bg-navy-600 hover:bg-navy-700 text-black">Guardar vinculación</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog crear/editar */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditing(null); setForm({ name: "", email: "", phone: "", ci: "" }); } }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-slate-900">{editing ? "Editar Padre/Tutor" : "Nuevo Padre/Tutor"}</DialogTitle>
            <DialogDescription className="text-slate-600">
              {editing ? "Modifica los datos del padre/tutor" : "Completa los datos del nuevo padre/tutor"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700">Nombre Completo</Label>
                <Input
                  id="name"
                  value={form.name ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email (opcional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="border-slate-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-700">Teléfono</Label>
                <Input
                  id="phone"
                  value={form.phone ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ci" className="text-slate-700">CI</Label>
                <Input
                  id="ci"
                  value={form.ci ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, ci: e.target.value }))}
                  className="border-slate-200"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={onSubmit} className="bg-navy-600 hover:bg-navy-700 text-black">
              {editing ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
