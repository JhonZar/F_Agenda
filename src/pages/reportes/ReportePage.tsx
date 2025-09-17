"use client"

import { useState, useEffect } from "react"
import {
  getReports,
  createReport,
  updateReport,
} from "@/api/reports"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash2, FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface Report {
  id: string
  title: string
  description: string
  category: string
  student: string
  reporter: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in_progress" | "resolved" | "closed"
  createdDate: string
  resolvedDate?: string
  actions: string
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await getReports()
        const transformed: Report[] = data.map((report: any) => ({
          id: String(report.id),
          title: report.description,
          description: report.description,
          category: report.category?.name || "Sin categoría",
          student: report.student?.name || "Desconocido",
          reporter: report.teacher?.name || "Desconocido",
          priority: "medium",
          status: "pending",
          createdDate: new Date(report.created_at).toLocaleDateString(),
          resolvedDate: report.updated_at ? new Date(report.updated_at).toLocaleDateString() : undefined,
          actions: "",
        }))
        setReports(transformed)
      } catch (error) {
        console.error("Error loading reports", error)
      }
    }
    loadReports()
  }, [])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReport, setEditingReport] = useState<Report | null>(null)

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    student: "",
    priority: "medium",
    status: "pending",
    actions: "",
  })

  const categories = ["Académico", "Disciplinario", "Asistencia", "Salud", "Psicológico", "Otro"]

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporter.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || report.category === filterCategory
    const matchesStatus = filterStatus === "all" || report.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleAddReport = () => {
    setForm({
      title: "",
      description: "",
      category: "",
      student: "",
      priority: "medium",
      status: "pending",
      actions: "",
    });
    setEditingReport(null);
    setIsDialogOpen(true);
  }

  const handleEditReport = (report: Report) => {
    setForm({
      title: report.title,
      description: report.description,
      category: report.category,
      student: report.student,
      priority: report.priority,
      status: report.status,
      actions: report.actions,
    });
    setEditingReport(report);
    setIsDialogOpen(true);
  }

  const handleSaveReport = async () => {
    const payload = {
      student_id: 1, // TODO: map properly
      teacher_id: 1, // TODO: map properly
      category_id: 1, // TODO: map properly
      description: form.description,
    };
    try {
      if (editingReport) {
        await updateReport(Number(editingReport.id), payload);
      } else {
        await createReport(payload);
      }
      setIsDialogOpen(false);
      const refreshed = await getReports();
      const transformed: Report[] = refreshed.map((report: any) => ({
        id: String(report.id),
        title: report.description,
        description: report.description,
        category: report.category?.name || "Sin categoría",
        student: report.student?.name || "Desconocido",
        reporter: report.teacher?.name || "Desconocido",
        priority: "medium",
        status: "pending",
        createdDate: new Date(report.created_at).toLocaleDateString(),
        resolvedDate: report.updated_at ? new Date(report.updated_at).toLocaleDateString() : undefined,
        actions: "",
      }))
      setReports(transformed);
    } catch (error) {
      console.error("Error saving report", error);
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "urgent":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "low":
        return "Baja"
      case "medium":
        return "Media"
      case "high":
        return "Alta"
      case "urgent":
        return "Urgente"
      default:
        return "Desconocida"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "in_progress":
        return "En Proceso"
      case "resolved":
        return "Resuelto"
      case "closed":
        return "Cerrado"
      default:
        return "Desconocido"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "in_progress":
        return <AlertTriangle className="h-4 w-4" />
      case "resolved":
        return <CheckCircle className="h-4 w-4" />
      case "closed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Reportes</h2>
            <p>Gestión de reportes estudiantiles</p>
          </div>
        </div>
        <Button onClick={handleAddReport} className="bg-black hover:bg-navy-700">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Reporte
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total Reportes</CardTitle>
            <FileText className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{reports.length}</div>
            <p className="text-xs text-slate-600">Reportes registrados</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {reports.filter((r) => r.status === "pending").length}
            </div>
            <p className="text-xs text-slate-600">Requieren atención</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">En Proceso</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {reports.filter((r) => r.status === "in_progress").length}
            </div>
            <p className="text-xs text-slate-600">Siendo atendidos</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Resueltos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {reports.filter((r) => r.status === "resolved").length}
            </div>
            <p className="text-xs text-slate-600">Casos cerrados</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-600" />
            Lista de Reportes
          </CardTitle>
          <CardDescription className="text-slate-600">
            Administra los reportes estudiantiles y su seguimiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar reportes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 border-slate-200 focus:border-slate-400"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px] border-slate-200">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px] border-slate-200">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in_progress">En Proceso</SelectItem>
                <SelectItem value="resolved">Resuelto</SelectItem>
                <SelectItem value="closed">Cerrado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-700">Título</TableHead>
                <TableHead className="text-slate-700">Estudiante</TableHead>
                <TableHead className="text-slate-700">Categoría</TableHead>
                <TableHead className="text-slate-700">Reportado por</TableHead>
                <TableHead className="text-slate-700">Prioridad</TableHead>
                <TableHead className="text-slate-700">Estado</TableHead>
                <TableHead className="text-slate-700">Fecha</TableHead>
                <TableHead className="text-slate-700">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id} className="border-slate-100">
                  <TableCell>
                    <div>
                      <div className="font-medium text-slate-900">{report.title}</div>
                      <div className="text-sm text-slate-600 max-w-[200px] truncate">{report.description}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">{report.student}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-slate-300 text-slate-700">
                      {report.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-700">{report.reporter}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(report.priority)}>{getPriorityText(report.priority)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(report.status)}
                      <Badge className={getStatusColor(report.status)}>{getStatusText(report.status)}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-700">{report.createdDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditReport(report)}
                        className="border-slate-200 text-slate-700 hover:bg-slate-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50">
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900">{editingReport ? "Editar Reporte" : "Nuevo Reporte"}</DialogTitle>
            <DialogDescription className="text-slate-600">
              {editingReport ? "Modifica los datos del reporte" : "Completa los datos del nuevo reporte"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-700">
                Título del Reporte
              </Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-700">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="border-slate-200"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-slate-700">
                  Categoría
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm({ ...form, category: value })}
                >
                  <SelectTrigger className="border-slate-200">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="student" className="text-slate-700">
                  Estudiante
                </Label>
                <Input
                  id="student"
                  value={form.student}
                  onChange={(e) => setForm({ ...form, student: e.target.value })}
                  className="border-slate-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-slate-700">
                  Prioridad
                </Label>
                <Select
                  value={form.priority}
                  onValueChange={(value) => setForm({ ...form, priority: value as "low" | "medium" | "high" | "urgent" })}
                >
                  <SelectTrigger className="border-slate-200">
                    <SelectValue placeholder="Seleccionar prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-slate-700">
                  Estado
                </Label>
                <Select
                  value={form.status}
                  onValueChange={(value) => setForm({ ...form, status: value as "pending" | "in_progress" | "resolved" | "closed" })}
                >
                  <SelectTrigger className="border-slate-200">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="in_progress">En Proceso</SelectItem>
                    <SelectItem value="resolved">Resuelto</SelectItem>
                    <SelectItem value="closed">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="actions" className="text-slate-700">
                Acciones Tomadas
              </Label>
              <Textarea
                id="actions"
                value={form.actions}
                onChange={(e) => setForm({ ...form, actions: e.target.value })}
                className="border-slate-200"
                rows={3}
                placeholder="Describe las acciones tomadas para resolver este reporte..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveReport} className="bg-navy-600 hover:bg-navy-700 text-black">
              {editingReport ? "Actualizar" : "Crear"} Reporte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
