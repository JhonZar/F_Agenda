// src/views/academico/ParaleloEstudiantePage/components/StatsCards.tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Users } from "lucide-react";
import { CheckCircle, AlertCircle } from "lucide-react";
// import React from "react";

export function StatsCards({
  totalStudents,
  totalUnassigned,
  totalAssigned,
  totalParallels,
}: {
  totalStudents: number;
  totalUnassigned: number;
  totalAssigned: number;
  totalParallels: number;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-4 mt-6">
      {/* Total Estudiantes */}
      <Card>
        <CardHeader className="flex justify-between">
          <CardTitle>Total Estudiantes</CardTitle>
          <Users className="h-5 w-5" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStudents}</div>
          <p className="text-xs">Registrados</p>
        </CardContent>
      </Card>

      {/* Sin Asignar */}
      <Card>
        <CardHeader className="flex justify-between">
          <CardTitle>Sin Asignar</CardTitle>
          <AlertCircle className="h-5 w-5 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUnassigned}</div>
          <p className="text-xs">Requieren asignación</p>
        </CardContent>
      </Card>

      {/* Asignados */}
      <Card>
        <CardHeader className="flex justify-between">
          <CardTitle>Asignados</CardTitle>
          <CheckCircle className="h-5 w-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAssigned}</div>
          <p className="text-xs">Ya tienen paralelo</p>
        </CardContent>
      </Card>

      {/* Paralelos */}
      <Card>
        <CardHeader className="flex justify-between">
          <CardTitle>Paralelos</CardTitle>
          <Users className="h-5 w-5" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalParallels}</div>
          <p className="text-xs">Disponibles</p>
        </CardContent>
      </Card>
    </div>
  );
}
