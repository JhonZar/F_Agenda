import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Calendar,
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  MapPin,
  Edit,
  Trash2,
  Bell,
  Globe,
  School,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// React-Query hooks para Agenda
import {
  useAgendas,
  useCreateAgenda,
  useUpdateAgenda,
  useDeleteAgenda,
} from "@/pages/agenda/hook/useAgenda";

// Tipos de la API
import type { CreateAgendaPayload, UpdateAgendaPayload } from "@/api/agendaApi";
import { useAuth } from "@/context/AuthContext";
import { getProfesorCursos, type ProfesorCurso } from "@/api/profesor";

// Interfaz para la UI
interface UIEvent {
  id: number;
  title: string;
  description: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  type: "global" | "parallel";
  paralelo?: string;
  location: string;
  organizer: string;
  participants: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  reminders: boolean;
  recurring: boolean;
  recurringType?: "daily" | "weekly" | "monthly";
}

export default function AgendaPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isProfesor = user?.role === "profesor";

  // Cursos del profesor (para filtrar)
  const [misCursos, setMisCursos] = useState<ProfesorCurso[]>([]);
  const [paraleloId, setParaleloId] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      if (!isProfesor) return;
      try {
        const res = await getProfesorCursos();
        setMisCursos(res);
        if (res.length > 0 && !paraleloId) setParaleloId(String(res[0].id));
      } catch (e) {
        console.error("Error cargando cursos del profesor", e);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProfesor]);

  // — React Query
  const agendasParams = isProfesor && paraleloId ? { paralelo_id: Number(paraleloId) } : undefined;
  const { data: events = [] } = useAgendas(agendasParams);

  // — 1) Convertir AgendaEvent[] a UIEvent[]
  const uiEvents: UIEvent[] = events.map((ev) => {
    const [datePart, timePart = ""] = (ev.scheduled_at ?? "").split("T");
    const time = timePart.slice(0, 5); // "HH:mm" o "" si no había parte hora
    return {
      id: ev.id,
      title: ev.title,
      description: ev.description || "",
      date: datePart,
      startTime: time,
      endTime: time,
      type: ev.type,
      paralelo: ev.paralelo,
      location: ev.location,
      organizer: ev.organizer,
      participants: ev.participants,
      status: ev.status,
      priority: ev.priority,
      reminders: ev.reminders,
      recurring: ev.recurring,
      recurringType: ev.recurring_type,
    };
  });

  // Calendario
  const [monthDate, setMonthDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [presetDate, setPresetDate] = useState<string>("")

  const monthLabel = monthDate.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  const startWeekday = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const blanks = Array.from({ length: startWeekday === 0 ? 6 : startWeekday - 1 }, () => null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const calendarCells = [...blanks, ...days];

  const eventsByDate = useMemo(() => {
    const map = new Map<string, UIEvent[]>();
    uiEvents.forEach((ev) => {
      if (!ev.date) return;
      const ym = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      if (!ev.date.startsWith(ym)) return;
      const arr = map.get(ev.date) || [];
      arr.push(ev);
      map.set(ev.date, arr);
    });
    return map;
  }, [uiEvents, monthDate]);
  const createAgenda = useCreateAgenda();
  const updateAgenda = useUpdateAgenda();
  const deleteAgenda = useDeleteAgenda();

  // — UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "global" | "parallel">(
    "all"
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "scheduled" | "in_progress" | "completed" | "cancelled"
  >("all");
  const [filterDate, setFilterDate] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<UIEvent | null>(null);

  // — Parallels estático (para admins)
  const parallels = [
    { id: "1", name: "1ro Básico A" },
    { id: "2", name: "1ro Básico B" },
    { id: "3", name: "2do Básico A" },
    { id: "4", name: "3ro Básico A" },
  ];

  // (moved uiEvents earlier)

  // — 2) Filtrado
  const filteredEvents = uiEvents.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.organizer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === "all" ||
      (filterType === "global" ? ev.type === "global" : ev.type === "parallel");
    const matchesStatus = filterStatus === "all" || ev.status === filterStatus;
    const matchesDate = !filterDate || ev.date === filterDate;
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const upcomingEvents = uiEvents.filter(
    (ev) => ev.date >= todayStr && ev.status === "scheduled"
  );
  const todayEvents = uiEvents.filter((ev) => ev.date === todayStr);

  // — Handlers
  const handleAddEvent = () => {
    setEditingEvent(null);
    setIsDialogOpen(true);
  };
  const handleEditEvent = (ev: UIEvent) => {
    setEditingEvent(ev);
    setIsDialogOpen(true);
  };
  const handleDeleteEvent = (id: number) => {
    if (confirm("¿Eliminar este evento?")) {
      deleteAgenda.mutate(id);
    }
  };

  // — Submit (create / update)
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    // Base datos comunes UI (el backend sólo usará algunos campos)
    const baseTitle = fd.get("title") as string;
    const baseDesc = (fd.get("description") as string) || "";

    // Construir scheduled_at ISO
    const date = fd.get("date") as string;
    const startTime = fd.get("startTime") as string;
    const scheduled_at = `${date}T${startTime}:00`;

    if (editingEvent) {
      // Update
      if (isProfesor) {
        const pid = Number(fd.get("profesor_paralelo_id") || paraleloId);
        const payload: UpdateAgendaPayload = {
          title: baseTitle,
          description: baseDesc,
          scheduled_at,
          paralelo_id: pid || undefined,
          grade: undefined,
        };
        updateAgenda.mutate(
          { id: editingEvent.id, payload },
          { onSuccess: () => setIsDialogOpen(false) }
        );
      } else {
        const payload: UpdateAgendaPayload = {
          title: baseTitle,
          description: baseDesc,
          scheduled_at,
        };
        updateAgenda.mutate(
          { id: editingEvent.id, payload },
          { onSuccess: () => setIsDialogOpen(false) }
        );
      }
    } else {
      // Create
      if (isProfesor) {
        const pid = Number(fd.get("profesor_paralelo_id") || paraleloId);
        const payload: CreateAgendaPayload = {
          title: baseTitle,
          description: baseDesc,
          scheduled_at,
          paralelo_id: pid,
        };
        createAgenda.mutate(payload, { onSuccess: () => setIsDialogOpen(false) });
      } else {
        const payload: CreateAgendaPayload = {
          title: baseTitle,
          description: baseDesc,
          scheduled_at,
          // Para admin, aquí podrías mapear paralelo seleccionado a su ID real
        };
        createAgenda.mutate(payload, { onSuccess: () => setIsDialogOpen(false) });
      }
    }
  };

  // — Iconos / colores
  const getEventTypeIcon = (type: string) =>
    type === "global" ? (
      <Globe className="h-4 w-4" />
    ) : (
      <School className="h-4 w-4" />
    );
  const getEventTypeColor = (type: string) =>
    type === "global"
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : "bg-green-100 text-green-800 border-green-200";
  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  const getPriorityColor = (p: string) => {
    switch (p) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  const getStatusText = (s: string) => {
    switch (s) {
      case "scheduled":
        return "Programado";
      case "in_progress":
        return "En Curso";
      case "completed":
        return "Completado";
      case "cancelled":
        return "Cancelado";
      default:
        return "Desconocido";
    }
  };

  return (
    <TooltipProvider>
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
    
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SidebarTrigger />
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Agenda Escolar
              </h2>
              <p className="text-slate-600">
                Gestiona eventos globales y por paralelo
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-foreground">
            <Button
              variant="outline"
              onClick={() =>
                setViewMode((v) => (v === "list" ? "calendar" : "list"))
              }
            >
              <Calendar className="mr-2 h-4 w-4" />
              {viewMode === "list" ? "Vista Lista" : "Vista Calendario"}
            </Button>
            {(isAdmin || isProfesor) && (
              <Button
                onClick={handleAddEvent}
                className="bg-black hover:bg-navy-700 "
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Evento
              </Button>
            )}
          </div>
        </div>
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-slate-200">
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Total Eventos
              </CardTitle>
              <Calendar className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {uiEvents.length}
              </div>
              <p className="text-xs text-slate-600">Este mes</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Próximos
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {upcomingEvents.length}
              </div>
              <p className="text-xs text-slate-600">Programados</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Hoy
              </CardTitle>
              <Bell className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {todayEvents.length}
              </div>
              <p className="text-xs text-slate-600">Programados hoy</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Globales
              </CardTitle>
              <Globe className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {uiEvents.filter((e) => e.type === "global").length}
              </div>
              <p className="text-xs text-slate-600">Institucionales</p>
            </CardContent>
          </Card>
        </div>

        {/* Vista Calendario */}
        {viewMode === "calendar" && (
          <Card className="border-slate-200">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="capitalize">{monthLabel}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))}>
                  Anterior
                </Button>
                <Button variant="outline" size="sm" onClick={() => setMonthDate(new Date())}>Hoy</Button>
                <Button variant="outline" size="sm" onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))}>
                  Siguiente
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 text-xs text-slate-500 mb-2">
                {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map((d) => (
                  <div key={d} className="px-2 py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-px bg-slate-200 rounded overflow-hidden">
                {calendarCells.map((cell, idx) => {
                  if (cell === null) {
                    return <div key={idx} className="bg-white h-24" />;
                  }
                  const day = cell as number;
                  const dateStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                  const dayEvents = eventsByDate.get(dateStr) || [];
                  return (
                    <div key={idx} className="bg-white h-32 p-2 hover:bg-slate-50 cursor-pointer" onClick={() => { setPresetDate(dateStr); setEditingEvent(null); setIsDialogOpen(true); }}>
                      <div className="text-right text-xs text-slate-500">{day}</div>
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0,3).map((ev) => (
                          <div key={ev.id} className="truncate text-[11px] px-1 py-0.5 rounded border "
                            title={`${ev.startTime} ${ev.title}`}
                          >
                            <span className="opacity-70 mr-1">{ev.startTime}</span>{ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-[11px] text-slate-500">+{dayEvents.length - 3} más</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Eventos de Hoy */}
        {todayEvents.length > 0 && (
          <Card className="border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                Eventos de Hoy
              </CardTitle>
              <CardDescription>Programados para hoy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 bg-white border border-blue-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-medium text-slate-900">
                          {event.title}
                        </div>
                        <div className="text-sm text-slate-600">
                          {event.startTime} • {event.location}
                        </div>
                      </div>
                    </div>
                    <Badge className={getEventTypeColor(event.type)}>
                      {getEventTypeIcon(event.type)}
                      <span className="ml-1">
                        {event.type === "global" ? "Global" : event.paralelo}
                      </span>
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-navy-600" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 border-slate-200"
                />
              </div>
              <Select
                value={filterType}
                onValueChange={(v) =>
                  setFilterType(v as "all" | "global" | "parallel")
                }
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="global">Globales</SelectItem>
                  <SelectItem value="parallel">Por Paralelo</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filterStatus}
                onValueChange={(v) =>
                  setFilterStatus(
                    v as
                      | "all"
                      | "scheduled"
                      | "in_progress"
                      | "completed"
                      | "cancelled"
                  )
                }
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="scheduled">Programado</SelectItem>
                  <SelectItem value="in_progress">En Curso</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="border-slate-200"
              />
              {isProfesor && (
                <Select value={paraleloId} onValueChange={setParaleloId}>
                  <SelectTrigger className="border-slate-200">
                    <SelectValue placeholder="Mi curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {misCursos.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {String(c.grade)} - {c.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                  setFilterStatus("all");
                  setFilterDate("");
                  if (isProfesor && misCursos.length > 0) setParaleloId(String(misCursos[0].id));
                }}
              >
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Eventos */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-slate-600" />
              Lista de Eventos
            </CardTitle>
            <CardDescription>
              Gestiona todos los eventos escolares
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-navy-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-slate-900">
                          {event.title}
                        </h4>
                        <Badge className={getEventTypeColor(event.type)}>
                          {getEventTypeIcon(event.type)}
                          <span className="ml-1">
                            {event.type === "global"
                              ? "Global"
                              : event.paralelo}
                          </span>
                        </Badge>
                        <Badge className={getPriorityColor(event.priority)}>
                          {event.priority === "high"
                            ? "Alta"
                            : event.priority === "medium"
                            ? "Media"
                            : "Baja"}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        {event.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{event.startTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{event.participants} participantes</span>
                        </div>
                        {event.reminders && (
                          <div className="flex items-center space-x-1">
                            <Bell className="h-3 w-3" />
                            <span>Recordatorios</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(event.status)}>
                      {getStatusText(event.status)}
                    </Badge>
                    <div className="flex items-center space-x-2">
                      {isAdmin && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditEvent(event)}
                              className="border-slate-200 text-slate-700 hover:bg-slate-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar evento</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {isAdmin && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteEvent(event.id)}
                              className="border-red-200 text-red-700 hover:bg-red-50 bg-transparent"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Eliminar evento</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredEvents.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p>No se encontraron eventos</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Formulario / Diálogo */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-navy-600" />
                {editingEvent ? "Editar Evento" : "Nuevo Evento"}
              </DialogTitle>
              <DialogDescription>
                {editingEvent
                  ? "Modifica los datos del evento"
                  : "Completa los datos del nuevo evento"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              {/* Título & Tipo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título del Evento</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingEvent?.title || ""}
                    className="border-slate-200"
                    required
                  />
                </div>
                {!isProfesor && (
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Evento</Label>
                    <Select name="type" defaultValue={editingEvent?.type || "global"}>
                      <SelectTrigger className="border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global">Global (Toda la institución)</SelectItem>
                        <SelectItem value="parallel">Por Paralelo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingEvent?.description || ""}
                  className="border-slate-200"
                  rows={3}
                />
              </div>

              {/* Fecha y Hora */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={editingEvent?.date || presetDate || ""}
                    className="border-slate-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Hora Inicio</Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="time"
                    defaultValue={editingEvent?.startTime || ""}
                    className="border-slate-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">Hora Fin</Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    defaultValue={editingEvent?.endTime || ""}
                    className="border-slate-200"
                    required
                  />
                </div>
              </div>

              {/* Ubicación / Paralelo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    name="location"
                    defaultValue={editingEvent?.location || ""}
                    className="border-slate-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paralelo">Paralelo</Label>
                  {isProfesor ? (
                    <Select name="profesor_paralelo_id" defaultValue={paraleloId || (misCursos[0]?.id ? String(misCursos[0].id) : "") }>
                      <SelectTrigger className="border-slate-200">
                        <SelectValue placeholder="Seleccionar mi curso" />
                      </SelectTrigger>
                      <SelectContent>
                        {misCursos.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {String(c.grade)} - {c.section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Select name="paralelo" defaultValue={editingEvent?.paralelo || ""}>
                      <SelectTrigger className="border-slate-200">
                        <SelectValue placeholder="Seleccionar paralelo" />
                      </SelectTrigger>
                      <SelectContent>
                        {parallels.map((p) => (
                          <SelectItem key={p.id} value={p.name}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* Organizador / Participantes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organizer">Organizador</Label>
                  <Input
                    id="organizer"
                    name="organizer"
                    defaultValue={editingEvent?.organizer || ""}
                    className="border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="participants">Participantes</Label>
                  <Input
                    id="participants"
                    name="participants"
                    type="number"
                    defaultValue={editingEvent?.participants?.toString() ?? "0"}
                    className="border-slate-200"
                  />
                </div>
              </div>

              {/* Prioridad / Estado */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select
                    name="priority"
                    defaultValue={editingEvent?.priority || "medium"}
                  >
                    <SelectTrigger className="border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    name="status"
                    defaultValue={editingEvent?.status || "scheduled"}
                  >
                    <SelectTrigger className="border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Programado</SelectItem>
                      <SelectItem value="in_progress">En Curso</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Recordatorios / Recurrente */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reminders"
                    name="reminders"
                    defaultChecked={editingEvent?.reminders || false}
                  />
                  <Label htmlFor="reminders">Enviar recordatorios</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recurring"
                    name="recurring"
                    defaultChecked={editingEvent?.recurring || false}
                  />
                  <Label htmlFor="recurring">Evento recurrente</Label>
                </div>
              </div>

              <DialogFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-navy-600 hover:bg-navy-700 text-foreground">
                  {editingEvent ? "Actualizar" : "Crear"} Evento
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
