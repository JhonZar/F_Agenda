import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogTrigger,DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TrashIcon, PencilIcon, PlusIcon, Search, Loader2 } from "lucide-react";
import {
  getReportCategories,
  createReportCategory,
  updateReportCategory,
  deleteReportCategory,
} from "@/api/reportCategories";

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
  const filtered = categories.filter((c) =>
    [c.name, c.description ?? ""].some((t) => t.toLowerCase().includes(query.toLowerCase()))
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
    <div className="p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-2xl font-bold">Categorías de Reporte</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar categorías…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
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
              <Button onClick={() => { setForm({}); setEditingId(null); }}>
                <PlusIcon className="mr-2 h-4 w-4" /> Nueva Categoría
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Categoría" : "Nueva Categoría"}
                </DialogTitle>
                <DialogDescription>
                  Completa los campos y guarda para {editingId ? "actualizar" : "crear"} la categoría.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Nombre</label>
                  <Input
                    id="name"
                    placeholder="Ej. Conducta, Asistencia, Rendimiento"
                    value={form.name || ""}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Descripción</label>
                  <Input
                    id="description"
                    placeholder="Breve descripción (opcional)"
                    value={form.description || ""}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Ayuda a otros a entender cuándo usar esta categoría.</p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => { setOpen(false); }} disabled={loading}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={loading || !((form.name || "").trim())}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-2">
        {loading && (
          <>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border p-4 rounded flex justify-between items-center animate-pulse">
                <div className="space-y-2 w-2/3">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-muted rounded"></div>
                  <div className="h-8 w-8 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </>
        )}

        {!loading && filtered.length === 0 && (
          <div className="border border-dashed rounded p-8 text-center text-muted-foreground">
            <p className="mb-2">No hay categorías que coincidan con la búsqueda.</p>
            <p className="text-sm">Crea una nueva o ajusta el término de búsqueda.</p>
          </div>
        )}

        {!loading && filtered.map((cat) => (
          <div
            key={cat.id}
            className="border p-4 rounded flex justify-between items-center hover:bg-accent/40 transition-colors"
          >
            <div>
              <p className="font-medium">{cat.name}</p>
              {cat.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{cat.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" onClick={() => handleEdit(cat)} aria-label="Editar">
                <PencilIcon className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="destructive" onClick={() => handleDelete(cat.id)} aria-label="Eliminar">
                <TrashIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}