// src/views/academico/ParaleloEstudiantePage/components/Header.tsx
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
// import React from "react";

export function Header({
  onRefresh,
}: {
  onRefresh: () => void;
}) {
  return (
    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center space-x-2">
        <SidebarTrigger />
        <div>
          <h2 className="text-3xl font-bold">
            Asignar Estudiantes a Paralelos
          </h2>
          <p className="text-sm text-slate-600">Gestiona asignaciones</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Exportar asignaciones</p>
          </TooltipContent>
        </Tooltip>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Actualizar
        </Button>
      </div>
    </div>
  );
}
