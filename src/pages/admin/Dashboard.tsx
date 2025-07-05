import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
 import { SidebarTrigger } from "@/components/ui/sidebar"
import { Users, BookOpen, Calendar, FileText, MessageSquare, UserCheck, TrendingUp, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import WhatsAppQr from "../whatsapp/WhatsAppQr"

export default function Dashboard() {
  const stats = [
    {
      title: "Total Estudiantes",
      value: "1,234",
      description: "Activos este período",
      icon: Users,
      color: "text-navy-600",
      change: "+12%",
      trend: "up",
    },
    {
      title: "Profesores",
      value: "89",
      description: "Personal docente",
      icon: UserCheck,
      color: "text-navy-600",
      change: "+3%",
      trend: "up",
    },
    {
      title: "Materias",
      value: "45",
      description: "Materias activas",
      icon: BookOpen,
      color: "text-navy-600",
      change: "0%",
      trend: "stable",
    },
    {
      title: "Asistencia Promedio",
      value: "94.2%",
      description: "Esta semana",
      icon: Calendar,
      color: "text-navy-600",
      change: "+2.1%",
      trend: "up",
    },
  ]

  const enrollmentData = [
    { month: "Ene", estudiantes: 1100, profesores: 85 },
    { month: "Feb", estudiantes: 1150, profesores: 87 },
    { month: "Mar", estudiantes: 1200, profesores: 89 },
    { month: "Abr", estudiantes: 1234, profesores: 89 },
  ]

  const gradeDistribution = [
    { name: "1ro Básico", value: 220, color: "#0ea5e9" },
    { name: "2do Básico", value: 210, color: "#3b82f6" },
    { name: "3ro Básico", value: 205, color: "#6366f1" },
    { name: "4to Básico", value: 200, color: "#8b5cf6" },
    { name: "5to Básico", value: 199, color: "#a855f7" },
    { name: "6to Básico", value: 200, color: "#d946ef" },
  ]

  const attendanceData = [
    { day: "Lun", asistencia: 96 },
    { day: "Mar", asistencia: 94 },
    { day: "Mié", asistencia: 95 },
    { day: "Jue", asistencia: 93 },
    { day: "Vie", asistencia: 92 },
  ]

  const recentActivities = [
    {
      id: 1,
      type: "student",
      title: "Nuevo estudiante registrado",
      description: "María González - 3ro Básico A",
      time: "Hace 5 min",
      priority: "normal",
    },
    {
      id: 2,
      type: "report",
      title: "Reporte de asistencia generado",
      description: "Paralelo 2do Básico B",
      time: "Hace 15 min",
      priority: "normal",
    },
    {
      id: 3,
      type: "alert",
      title: "Alerta: Baja asistencia",
      description: "Paralelo 4to Básico C - 78% esta semana",
      time: "Hace 30 min",
      priority: "high",
    },
    {
      id: 4,
      type: "message",
      title: "Plantilla WhatsApp actualizada",
      description: "Recordatorio de reunión",
      time: "Hace 1 hora",
      priority: "low",
    },
  ]

  const upcomingEvents = [
    {
      id: 1,
      title: "Reunión de padres",
      date: "Mañana",
      time: "14:00",
      type: "meeting",
      participants: 45,
    },
    {
      id: 2,
      title: "Evaluación trimestral",
      date: "Viernes",
      time: "09:00",
      type: "exam",
      participants: 234,
    },
    {
      id: 3,
      title: "Capacitación docente",
      date: "Lunes",
      time: "16:00",
      type: "training",
      participants: 89,
    },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "student":
        return <Users className="h-4 w-4 text-blue-500" />
      case "report":
        return <FileText className="h-4 w-4 text-green-500" />
      case "alert":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "message":
        return <MessageSquare className="h-4 w-4 text-purple-500" />
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50"
      case "normal":
        return "border-l-blue-500 bg-blue-50"
      case "low":
        return "border-l-gray-500 bg-gray-50"
      default:
        return "border-l-gray-500 bg-gray-50"
    }
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header mejorado */}
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
            <p className="text-slate-600">Bienvenido al sistema de gestión educativa</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="border-slate-200 text-slate-700">
            Período Académico 2025
          </Badge>
          <Button className="bg-primary hover:bg-navy-700">
            <TrendingUp className="mr-2 h-4 w-4" />
            Ver Reportes
          </Button>
        </div>
      </div>

      {/* Stats Cards mejoradas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-slate-100 hover:shadow-lg transition-all duration-200 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">{stat.title}</CardTitle>
              <div className="flex items-center space-x-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <Badge
                  variant="secondary"
                  className={`text-xs ${
                    stat.trend === "up"
                      ? "bg-green-100 text-green-700"
                      : stat.trend === "down"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {stat.change}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <p className="text-xs text-slate-600 mt-1">{stat.description}</p>
              <Progress value={75} className="mt-2 h-1" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Enrollment Trend */}
        <Card className="col-span-2 border-slate-100">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-navy-600" />
              Tendencia de Matrícula
            </CardTitle>
            <CardDescription className="text-slate-600">Evolución de estudiantes y profesores por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="estudiantes"
                  stackId="1"
                  stroke="#0ea5e9"
                  fill="#0ea5e9"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="profesores"
                  stackId="1"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card className="border-slate-100">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-navy-600" />
              Distribución por Grado
            </CardTitle>
            <CardDescription className="text-slate-600">Estudiantes por nivel educativo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {gradeDistribution.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs text-slate-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Attendance Chart */}
      <Card className="border-slate-100">
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-navy-600" />
            Asistencia Semanal
          </CardTitle>
          <CardDescription className="text-slate-600">Porcentaje de asistencia por día</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" domain={[85, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="asistencia" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Activity Feed and Events */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activities */}
        <Card className="border-slate-100">
          <CardHeader>
            <CardTitle className="text-slate-900">Actividades Recientes</CardTitle>
            <CardDescription className="text-slate-600">Últimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-start space-x-4 p-3 rounded-lg border-l-4 transition-all hover:shadow-sm ${getPriorityColor(
                  activity.priority,
                )}`}
              >
                <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                  <p className="text-xs text-slate-600 truncate">{activity.description}</p>
                </div>
                <span className="text-xs text-slate-500 flex-shrink-0">{activity.time}</span>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              Ver todas las actividades
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="border-slate-100">
          <CardHeader>
            <CardTitle className="text-slate-900">Próximos Eventos</CardTitle>
            <CardDescription className="text-slate-600">Agenda de la semana</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-3 h-3 bg-navy-500 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{event.title}</p>
                  <p className="text-xs text-slate-600">
                    {event.date} • {event.time}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {event.participants} personas
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              Ver calendario completo
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-slate-100">
        <CardHeader>
          <CardTitle className="text-slate-900">Acciones Rápidas</CardTitle>
          <CardDescription className="text-slate-600">Tareas frecuentes del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col space-y-2 hover:bg-navy-50 hover:border-navy-200">
              <Users className="h-6 w-6 text-navy-600" />
              <span className="text-sm">Registrar Estudiante</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 hover:bg-navy-50 hover:border-navy-200">
              <FileText className="h-6 w-6 text-navy-600" />
              <span className="text-sm">Crear Reporte</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 hover:bg-navy-50 hover:border-navy-200">
              <Calendar className="h-6 w-6 text-navy-600" />
              <span className="text-sm">Tomar Asistencia</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 hover:bg-navy-50 hover:border-navy-200">
              <MessageSquare className="h-6 w-6 text-navy-600" />
              <span className="text-sm">Enviar Mensaje</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      <WhatsAppQr />
    </div>
  )
}
