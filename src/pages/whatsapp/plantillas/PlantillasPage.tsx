import { useState, useEffect } from "react"
import {
  getPlantillasWhatsapp,
} from "@/api/plantillasWhatsapp"
import type { PlantillaWhatsapp } from "@/api/plantillasWhatsapp"
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
import { Plus, Search, Edit, Trash2, MessageSquare, Send, Copy, Eye, Filter, Download, Upload, Smartphone, Users, Calendar, AlertCircle, CheckCircle, Clock, MoreHorizontal } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// WhatsAppTemplate replaced by PlantillaWhatsapp from API

interface MessagePreview {
  template: PlantillaWhatsapp
  sampleData: Record<string, string>
  renderedMessage: string
}

export default function WhatsAppTemplatesPage() {
  const [templates, setTemplates] = useState<PlantillaWhatsapp[]>([])

  useEffect(() => {
    async function loadTemplates() {
      try {
        const data = await getPlantillasWhatsapp()
        setTemplates(data)
      } catch (error) {
        console.error("Error al cargar plantillas:", error)
      }
    }
    loadTemplates()
  }, [])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterAudience, setFilterAudience] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<PlantillaWhatsapp | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<MessagePreview | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<PlantillaWhatsapp | null>(null)
  const [activeTab, setActiveTab] = useState("templates")

  const categories = [
    { value: "academic", label: "Académico", color: "bg-blue-100 text-blue-800" },
    { value: "administrative", label: "Administrativo", color: "bg-green-100 text-green-800" },
    { value: "emergency", label: "Emergencia", color: "bg-red-100 text-red-800" },
    { value: "event", label: "Eventos", color: "bg-purple-100 text-purple-800" },
    { value: "reminder", label: "Recordatorios", color: "bg-yellow-100 text-yellow-800" },
    { value: "general", label: "General", color: "bg-gray-100 text-gray-800" },
  ]

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || template.category === filterCategory
    const matchesStatus = filterStatus === "all" || template.status === filterStatus
    const matchesAudience = filterAudience === "all" || template.targetAudience === filterAudience
    return matchesSearch && matchesCategory && matchesStatus && matchesAudience
  })

  const handleAddTemplate = () => {
    setEditingTemplate(null)
    setIsDialogOpen(true)
  }

  const handleEditTemplate = (template: PlantillaWhatsapp) => {
    setEditingTemplate(template)
    setIsDialogOpen(true)
  }

  const handlePreviewTemplate = (template: PlantillaWhatsapp) => {
    // Generar datos de muestra para la vista previa
    const sampleData: Record<string, string> = {}
    template.variables.forEach((variable) => {
      switch (variable) {
        case "padre_nombre":
          sampleData[variable] = "Sr./Sra. García"
          break
        case "estudiante_nombre":
          sampleData[variable] = "María García"
          break
        case "paralelo":
          sampleData[variable] = "3ro Básico A"
          break
        case "fecha":
          sampleData[variable] = "25 de Marzo, 2024"
          break
        case "hora":
          sampleData[variable] = "14:00"
          break
        case "ubicacion":
          sampleData[variable] = "Aula 301"
          break
        case "profesor_nombre":
          sampleData[variable] = "Prof. María González"
          break
        case "mes":
          sampleData[variable] = "Marzo"
          break
        case "monto":
          sampleData[variable] = "Bs. 350"
          break
        case "codigo_estudiante":
          sampleData[variable] = "EST-2024-001"
          break
        case "fecha_vencimiento":
          sampleData[variable] = "30 de Marzo"
          break
        case "institucion":
          sampleData[variable] = "Unidad Educativa Olanda"
          break
        case "nombre":
          sampleData[variable] = "Carlos"
          break
        case "periodo":
          sampleData[variable] = "Primer Trimestre"
          break
        case "promedio":
          sampleData[variable] = "85/100"
          break
        case "materia_mejor":
          sampleData[variable] = "Matemáticas"
          break
        case "area_mejora":
          sampleData[variable] = "Ciencias Sociales"
          break
        case "mensaje_emergencia":
          sampleData[variable] = "Suspensión de clases por condiciones climáticas adversas"
          break
        default:
          sampleData[variable] = `[${variable}]`
      }
    })

    // Renderizar el mensaje con los datos de muestra
    let renderedMessage = template.message
    template.variables.forEach((variable) => {
      const regex = new RegExp(`{${variable}}`, "g")
      renderedMessage = renderedMessage.replace(regex, sampleData[variable])
    })

    setPreviewTemplate({
      template,
      sampleData,
      renderedMessage,
    })
    setIsPreviewOpen(true)
  }

  const handleSendTemplate = (template: PlantillaWhatsapp) => {
    setSelectedTemplate(template)
    setIsSendDialogOpen(true)
  }

  const getCategoryInfo = (category: string) => {
    return categories.find((cat) => cat.value === category) || categories[categories.length - 1]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case "parents":
        return <Users className="h-4 w-4" />
      case "teachers":
        return <Users className="h-4 w-4" />
      case "students":
        return <Users className="h-4 w-4" />
      case "all":
        return <Users className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  return (
    <TooltipProvider>
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
       
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SidebarTrigger />
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Plantillas WhatsApp</h2>
              <p className="text-slate-600">Gestiona plantillas de mensajes para comunicación automatizada</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Importar plantillas</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Exportar plantillas</p>
              </TooltipContent>
            </Tooltip>
            <Button onClick={handleAddTemplate} className="bg-navy-600 hover:bg-navy-700 text-black">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Plantilla
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Total Plantillas</CardTitle>
              <MessageSquare className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{templates.length}</div>
              <p className="text-xs text-slate-600">Plantillas creadas</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Activas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {templates.filter((t) => t.status === "active").length}
              </div>
              <p className="text-xs text-slate-600">Listas para usar</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Más Usada</CardTitle>
              <Send className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {Math.max(...templates.map((t) => t.usageCount))}
              </div>
              <p className="text-xs text-slate-600">Envíos máximos</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Borradores</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {templates.filter((t) => t.status === "draft").length}
              </div>
              <p className="text-xs text-slate-600">En desarrollo</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates">Plantillas</TabsTrigger>
            <TabsTrigger value="analytics">Estadísticas</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            {/* Filters */}
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
                      placeholder="Buscar plantillas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 border-slate-200"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="border-slate-200">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="border-slate-200">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="draft">Borrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterAudience} onValueChange={setFilterAudience}>
                    <SelectTrigger className="border-slate-200">
                      <SelectValue placeholder="Audiencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las audiencias</SelectItem>
                      <SelectItem value="parents">Padres</SelectItem>
                      <SelectItem value="teachers">Profesores</SelectItem>
                      <SelectItem value="students">Estudiantes</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("")
                      setFilterCategory("all")
                      setFilterStatus("all")
                      setFilterAudience("all")
                    }}
                  >
                    Limpiar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Templates Table */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-slate-600" />
                  Lista de Plantillas
                </CardTitle>
                <CardDescription>Gestiona todas las plantillas de mensajes WhatsApp</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200 bg-slate-50">
                        <TableHead className="text-slate-700 font-semibold">Plantilla</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Categoría</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Audiencia</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Estado</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Uso</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTemplates.map((template) => {
                        const categoryInfo = getCategoryInfo(template.category)
                        return (
                          <TableRow key={template.id} className="border-slate-100 hover:bg-slate-50">
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium text-slate-900">{template.name}</div>
                                <div className="text-sm text-slate-600">{template.subject}</div>
                                <div className="flex items-center space-x-2">
                                  <Badge className={getPriorityColor(template.priority)}>
                                    {template.priority === "high"
                                      ? "Alta"
                                      : template.priority === "medium"
                                        ? "Media"
                                        : "Baja"}
                                  </Badge>
                                  {template.hasAttachment && (
                                    <Badge variant="outline" className="text-xs">
                                      Con adjunto
                                    </Badge>
                                  )}
                                  {template.isSchedulable && (
                                    <Badge variant="outline" className="text-xs">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      Programable
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={categoryInfo.color}>{categoryInfo.label}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getAudienceIcon(template.targetAudience)}
                                <span className="text-slate-700 capitalize">{template.targetAudience}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(template.status)}>
                                {template.status === "active"
                                  ? "Activo"
                                  : template.status === "inactive"
                                    ? "Inactivo"
                                    : "Borrador"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-slate-900">{template.usageCount} envíos</div>
                                <div className="text-xs text-slate-600">
                                  {template.lastUsed ? `Último: ${template.lastUsed}` : "Nunca usado"}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handlePreviewTemplate(template)}
                                      className="border-slate-200 text-slate-700 hover:bg-slate-50 bg-transparent"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Vista previa</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleSendTemplate(template)}
                                      disabled={template.status !== "active"}
                                      className="border-slate-200 text-slate-700 hover:bg-slate-50 bg-transparent"
                                    >
                                      <Send className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Enviar mensaje</p>
                                  </TooltipContent>
                                </Tooltip>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-slate-200 text-slate-700 bg-transparent"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Copy className="mr-2 h-4 w-4" />
                                      Duplicar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Download className="mr-2 h-4 w-4" />
                                      Exportar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Eliminar
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
                {filteredTemplates.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                    <p>No se encontraron plantillas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Estadísticas de Uso</CardTitle>
                <CardDescription>Análisis del rendimiento de las plantillas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                  <p>Estadísticas en desarrollo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Configuración de Plantillas</CardTitle>
                <CardDescription>Ajustes generales para el sistema de plantillas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                  <p>Configuración en desarrollo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Template Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-navy-600" />
                {editingTemplate ? "Editar Plantilla" : "Nueva Plantilla"}
              </DialogTitle>
              <DialogDescription>
                {editingTemplate ? "Modifica los datos de la plantilla" : "Crea una nueva plantilla de mensaje"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700">
                    Nombre de la Plantilla
                  </Label>
                  <Input id="name" defaultValue={editingTemplate?.name || ""} className="border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-slate-700">
                    Categoría
                  </Label>
                  <Select defaultValue={editingTemplate?.category || "general"}>
                    <SelectTrigger className="border-slate-200">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-slate-700">
                  Asunto
                </Label>
                <Input id="subject" defaultValue={editingTemplate?.subject || ""} className="border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-slate-700">
                  Mensaje
                </Label>
                <Textarea
                  id="message"
                  defaultValue={editingTemplate?.message || ""}
                  className="border-slate-200 min-h-[150px]"
                  placeholder="Escribe tu mensaje aquí. Usa {variable} para campos dinámicos."
                />
                <div className="text-xs text-slate-500">
                  Tip: Usa llaves para variables dinámicas, ej: {"{nombre}"}, {"{fecha}"}, {"{paralelo}"}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="audience" className="text-slate-700">
                    Audiencia
                  </Label>
                  <Select defaultValue={editingTemplate?.targetAudience || "parents"}>
                    <SelectTrigger className="border-slate-200">
                      <SelectValue placeholder="Seleccionar audiencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parents">Padres</SelectItem>
                      <SelectItem value="teachers">Profesores</SelectItem>
                      <SelectItem value="students">Estudiantes</SelectItem>
                      <SelectItem value="all">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-slate-700">
                    Prioridad
                  </Label>
                  <Select defaultValue={editingTemplate?.priority || "medium"}>
                    <SelectTrigger className="border-slate-200">
                      <SelectValue placeholder="Seleccionar prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-slate-700">
                    Estado
                  </Label>
                  <Select defaultValue={editingTemplate?.status || "draft"}>
                    <SelectTrigger className="border-slate-200">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Variables Detectadas</Label>
                <div className="flex flex-wrap gap-2">
                  {editingTemplate?.variables.map((variable) => (
                    <Badge key={variable} variant="outline" className="text-xs">
                      {"{" + variable + "}"}
                    </Badge>
                  )) || (
                    <span className="text-sm text-slate-500">
                      Las variables se detectarán automáticamente del mensaje
                    </span>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-navy-600 hover:bg-navy-700">
                {editingTemplate ? "Actualizar" : "Crear"} Plantilla
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-navy-600" />
                Vista Previa - {previewTemplate?.template.name}
              </DialogTitle>
              <DialogDescription>Así se verá el mensaje en WhatsApp</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {previewTemplate && (
                <div className="space-y-4">
                  {/* WhatsApp-like preview */}
                  <div className="bg-green-500 text-white p-4 rounded-lg max-w-sm ml-auto">
                    <div className="text-sm font-medium mb-2">{previewTemplate.template.subject}</div>
                    <div className="text-sm whitespace-pre-wrap">{previewTemplate.renderedMessage}</div>
                    <div className="text-xs opacity-75 mt-2 text-right">
                      {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  {/* Variables used */}
                  <div className="space-y-2">
                    <Label className="text-slate-700">Variables utilizadas:</Label>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(previewTemplate.sampleData).map(([key, value]) => (
                        <div key={key} className="flex justify-between p-2 bg-slate-50 rounded">
                          <span className="font-medium">{"{" + key + "}"}:</span>
                          <span className="text-slate-600">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                Cerrar
              </Button>
              <Button
                onClick={() => {
                  setIsPreviewOpen(false)
                  if (previewTemplate) {
                    handleSendTemplate(previewTemplate.template)
                  }
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="mr-2 h-4 w-4" />
                Enviar Mensaje
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Send Dialog */}
        <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-navy-600" />
                Enviar Mensaje - {selectedTemplate?.name}
              </DialogTitle>
              <DialogDescription>Configura el envío del mensaje WhatsApp</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Esta funcionalidad requiere integración con la API de WhatsApp Business. Actualmente en desarrollo.
                </AlertDescription>
              </Alert>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-700">Destinatarios</Label>
                  <Select>
                    <SelectTrigger className="border-slate-200">
                      <SelectValue placeholder="Seleccionar grupo de destinatarios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-parents">Todos los padres</SelectItem>
                      <SelectItem value="parallel-parents">Padres de un paralelo</SelectItem>
                      <SelectItem value="custom">Lista personalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Programar envío (opcional)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="date" className="border-slate-200" />
                    <Input type="time" className="border-slate-200" />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSendDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                <Send className="mr-2 h-4 w-4" />
                Enviar Ahora
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
