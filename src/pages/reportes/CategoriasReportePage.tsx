import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, PencilIcon, PlusIcon, Search, Tag, TrashIcon, Upload } from "lucide-react";
import { createReportCategory, deleteReportCategory, getReportCategories, updateReportCategory } from "@/api/reportCategories";

interface ReportCategory {
  id: number;
  name: string;
  description?: string;
}

export default function CategoriasReportePage() {
  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<ReportCategory>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      categories.filter((c) =>
        [c.name, c.description ?? ""].some((t) => t.toLowerCase().includes(query.trim().toLowerCase()))
      ),
    [categories, query]
  );

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getReportCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async () => {
    try {
      if (editingId !== null) {
        await updateReportCategory(editingId, form as any);
      } else {
        await createReportCategory(form as any);
      }
      setOpen(false);
      setForm({});
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta categoría?")) {
      try {
        await deleteReportCategory(id);
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category", error);
      }
    }
  };

  const handleEdit = (category: ReportCategory) => {
    setForm(category);
    setEditingId(category.id);
    setOpen(true);
  };

  return (
    <TooltipProvider>
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Categorías de Reporte</h2>
            <p className="text-muted-foreground">Organiza tus reportes en categorías claras y reutilizables.</p>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Importar</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Exportar</TooltipContent>
            </Tooltip>
            <Dialog
              open={open}
              onOpenChange={(o) => {
                setOpen(o);
                if (!o) {
                  setForm({});
                  setEditingId(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={() => { setForm({}); setEditingId(null); }} className="bg-black hover:bg-navy-700">
                  <PlusIcon className="mr-2 h-4 w-4 " /> Nueva Categoría
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                  <DialogTitle>{editingId ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
                  <DialogDescription>Completa los campos para {editingId ? "actualizar" : "crear"} la categoría.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      placeholder="Ej. Conducta, Asistencia, Rendimiento"
                      value={form.name || ""}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Input
                      id="description"
                      placeholder="Breve descripción (opcional)"
                      value={form.description || ""}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Ayuda a otros a entender cuándo usar esta categoría.</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancelar</Button>
                  <Button onClick={handleSave} disabled={loading || !((form.name || "").trim())}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters + Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-slate-200 md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-700">Buscar</CardTitle>
              <CardDescription>Filtra por nombre o descripción</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative w-full">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar categorías…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                {query && (
                  <Button variant="outline" onClick={() => setQuery("")}>Limpiar</Button>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Total categorías</CardTitle>
              <Tag className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{categories.length}</div>
              <p className="text-xs text-muted-foreground">Registradas en el sistema</p>
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <div className="min-h-[200px]">
          {loading && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border-slate-200 animate-pulse">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/5 bg-muted rounded" />
                      <div className="h-3 w-4/5 bg-muted rounded" />
                    </div>
                    <div className="h-8 w-8 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <Card className="border-dashed border-slate-300">
              <CardContent className="p-10 text-center text-muted-foreground">
                <Tag className="h-10 w-10 mx-auto mb-3" />
                <p className="mb-1">No hay categorías que coincidan con la búsqueda.</p>
                <p className="text-sm">Crea una nueva o ajusta el término de búsqueda.</p>
              </CardContent>
            </Card>
          )}

          {!loading && filtered.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((cat) => (
                <Card key={cat.id} className="border-slate-200 hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                      style={{ backgroundColor: stringToColor(cat.name) }}
                      aria-hidden
                    >
                      {cat.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{cat.name}</p>
                      {cat.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{cat.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(cat)} aria-label="Editar">
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="destructive" onClick={() => handleDelete(cat.id)} aria-label="Eliminar">
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Eliminar</TooltipContent>
                      </Tooltip>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

// Utilidad simple para generar un color estable por nombre
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
}
