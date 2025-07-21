// src/views/academico/ParaleloEstudiantePage/components/StudentList.tsx
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Student {
  id: number;
  name: string;
  currentParallel?: string;
}

interface Props {
  title: string;
  students: Student[];
  countLabel?: string;
  // búsqueda
  searchTerm?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // selección (solo en Sin Asignar)
  selectedIds?: number[];
  onToggle?: (id: number) => void;
  onSelectAll?: () => void;
  showAssignBar?: boolean;
  onAssignClick?: () => void;
  // remoción (solo en Asignados)
  onRemove?: (id: number) => void;
}

export function StudentList({
  title,
  students,
  countLabel,
  searchTerm,
  onSearchChange,
  selectedIds = [],
  onToggle,
  onSelectAll,
  showAssignBar,
  onAssignClick,
  onRemove,
}: Props) {
  const isUnassignedList = typeof onSearchChange === "function";
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isUnassignedList ? <AlertCircle className="h-5 w-5 text-yellow-600" /> : <CheckCircle className="h-5 w-5 text-green-600" />}
          {title} {countLabel ? `(${countLabel})` : `(${students.length})`}
        </CardTitle>
        <CardDescription>
          {isUnassignedList ? "Busca y selecciona" : "Revisa o desasigna"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isUnassignedList && (
          <div className="flex mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar..."
                className="pl-8"
                value={searchTerm}
                onChange={onSearchChange}
              />
            </div>
          </div>
        )}

        {isUnassignedList && showAssignBar && (
          <div className="flex justify-between p-3 mb-4 bg-navy-50 border rounded-lg">
            <span>{selectedIds.length} seleccionado(s)</span>
            <Button size="sm" onClick={onAssignClick}>
              <Users className="mr-2 h-4 w-4" />
              Asignar
            </Button>
          </div>
        )}

        {isUnassignedList && (
          <div className="border-b py-2 flex items-center">
            <Checkbox
              checked={
                students.length > 0 && selectedIds.length === students.length
              }
              onCheckedChange={onSelectAll}
            />
            <span className="ml-2">Seleccionar todos</span>
          </div>
        )}

        <div className="space-y-2 max-h-[400px] overflow-auto mt-2">
          {students.map((u) => (
            <div
              key={u.id}
              className={`flex items-center justify-between p-3 border rounded-lg ${
                selectedIds.includes(u.id) ? "bg-navy-50 border-navy-200" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                {isUnassignedList ? (
                  <Checkbox
                    checked={selectedIds.includes(u.id)}
                    onCheckedChange={() => onToggle?.(u.id)}
                  />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                <div>{u.name}</div>
              </div>
              <div className="flex items-center space-x-2">
                {isUnassignedList ? (
                  <Badge
                    variant="outline"
                    className="border-yellow-200 text-yellow-700"
                  >
                    Sin asignar
                  </Badge>
                ) : (
                  <>
                    <Badge
                      variant="outline"
                      className="border-green-200 text-green-700"
                    >
                      {u.currentParallel}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onRemove?.(u.id)}
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
          {students.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              {isUnassignedList ? (
                <>
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>¡Todos asignados!</p>
                </>
              ) : (
                <>
                  <Users className="h-12 w-12 mx-auto mb-4" />
                  <p>No hay asignados aún</p>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
