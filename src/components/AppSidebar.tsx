// src/components/AppSidebar.tsx
"use client";

import * as React from "react";
import {
  BookOpen,
  ChevronUp,
  FileText,
  GraduationCap,
  Home,
  MessageSquare,
  Settings,
  User,
  Users,
  UserCheck,
  ClipboardList,
  School,
  CalendarDays,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Si no hay user, redirige a login
  React.useEffect(() => {
    if (!user) navigate("/login", { replace: true });
  }, [user, navigate]);

  const navMain = [{ title: "Dashboard", url: "/", icon: Home }];

  const navGroups = [
    {
      title: "Gestión de Usuarios",
      items: [
        {
          title: "Administradores",
          url: "/usuarios/administradores",
          icon: Settings,
        },
        {
          title: "Profesores",
          url: "/usuarios/profesores",
          icon: GraduationCap,
        },
        { title: "Estudiantes", url: "/usuarios/estudiantes", icon: Users },
        { title: "Padres de Familia", url: "/usuarios/padres", icon: User },
      ],
    },
    {
      title: "Gestión Académica",
      items: [
        { title: "Materias", url: "/academico/materias", icon: BookOpen },
        { title: "Paralelos", url: "/academico/paralelos", icon: School },
        {
          title: "Paralelo Curso Materia",
          url: "/academico/paralelo-curso-materia",
          icon: ClipboardList,
        },
        {
          title: "Asistencias",
          url: "/academico/asistencias",
          icon: UserCheck,
        },
        {
          title: "Asignacion Estudiantes a Paralelos",
          url: "/academico/paralelo-estudiantes",
          icon: ClipboardList,
        },
      ],
    },
    {
      title: "Reportes y Comunicación",
      items: [
        { title: "Reportes", url: "/reportes", icon: FileText },
        {
          title: "Categorías de Reportes",
          url: "/reportes/categorias",
          icon: FileText,
        },
        {
          title: "Plantillas WhatsApp",
          url: "/whatsapp/plantillas",
          icon: MessageSquare,
        },
      ],
    },
    {
      title: "Planificación",
      items: [{ title: "Agenda", url: "/agenda", icon: CalendarDays }],
    },
  ];

  return (
    <Sidebar variant="inset" {...props} className="border-slate-200">
      <SidebarHeader className="bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-navy-600 ">
            <GraduationCap className="size-4 " />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-slate-900">
              Sistema Educativo
            </span>
            <span className="truncate text-xs text-slate-600">
              Unidad Educativa Holanda
            </span>
            <span className="truncate text-xs text-slate-600">
              {user?.role || "–"}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-slate-50 data-[active=true]:bg-slate-100 data-[active=true]:text-slate-900"
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="text-slate-600" />
                      <span className="text-slate-700">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {navGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-slate-800 font-medium">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className="hover:bg-slate-50 data-[active=true]:bg-slate-100 data-[active=true]:text-slate-900"
                    >
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="text-slate-600" />
                        <span className="text-slate-700">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="bg-slate-50 border-t border-slate-200">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-slate-100 hover:bg-slate-100"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-navy-600 text-white text-sm">
                    {user
                      ? user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      : ""}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-slate-900">
                      {user?.name}
                    </span>
                    <span className="truncate text-xs text-slate-600">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4 text-slate-600" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem className="hover:bg-slate-50">
                  <span className="text-slate-700">Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-slate-50">
                  <span className="text-slate-700">Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    logout();
                  }}
                >
                  <span className="text-slate-700">Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
