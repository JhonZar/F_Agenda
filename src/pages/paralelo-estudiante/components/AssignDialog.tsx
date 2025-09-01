// src/views/academico/ParaleloEstudiantePage/components/AssignDialog.tsx
// import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ArrowRight, RefreshCw, UserPlus } from "lucide-react";
import type { Paralelo } from "@/api/paralelos";
const DEFAULT_CAPACITY = 50;
interface Props {
  open: boolean;
  onClose: () => void;
  paralelos: Paralelo[];
  assignedCountById: Record<number, number>;
  selectedCount: number;
  selectedParallel: string;
  onSelectParallel: (value: string) => void;
  onConfirm: () => void;
  loading: boolean;
}

export function AssignDialog({
  open,
  onClose,
  paralelos,
  assignedCountById,
  selectedCount,
  selectedParallel,
  onSelectParallel,
  onConfirm,
  loading,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-navy-600" />
            Asignar {selectedCount} estudiante(s)
          </DialogTitle>
          <DialogDescription>
            Elige el paralelo de destino
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <label className="block mb-1">Paralelo:</label>
            <Select
              value={selectedParallel}
              onValueChange={onSelectParallel}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona..." />
              </SelectTrigger>
              <SelectContent>
                {paralelos.map((p) => {
                  const current = assignedCountById[p.id] ?? 0;
                  const cap = DEFAULT_CAPACITY;
                  const hasRoom = current + selectedCount <= cap;
                  return (
                    <SelectItem
                      key={p.id}
                      value={p.id.toString()}
                      disabled={!hasRoom}
                      className={!hasRoom ? "opacity-50" : ""}
                    >
                      {`${p.grade}-${p.section}`} ({current}/{cap})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!selectedParallel || loading}
            className="bg-navy-600 hover:bg-navy-700 text-black"
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin mr-2 h-4 w-4" />
                Asignando...
              </>
            ) : (
              <>
                <ArrowRight className="mr-2 h-4 w-4" />
                Asignar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
