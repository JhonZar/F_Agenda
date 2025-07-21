// src/views/academico/ParaleloEstudiantePage/components/ParallelsOverview.tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import type { Paralelo } from "@/api/paralelos";
// import React from "react";
const DEFAULT_CAPACITY = 50;
export function ParallelsOverview({
  paralelos,
  assignedCountById,
  getAvailability,
}: {
  paralelos: Paralelo[];
  assignedCountById: Record<number, number>;
  getAvailability: (p: Paralelo) => { color: string; text: string };
}) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Estado de Paralelos
        </CardTitle>
        <CardDescription>Capacidad y ocupación</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {paralelos.map((p) => {
            const current = assignedCountById[p.id] ?? 0;
            const capacity = DEFAULT_CAPACITY;
            const avail = getAvailability(p);
            const percent = (current / capacity) * 100;
            return (
              <div key={p.id} className="p-4 border rounded-lg">
                <div className="flex justify-between">
                  <h4 className="font-semibold">
                    {`${p.grade}-${p.section}`}
                  </h4>
                  <Badge
                    variant="outline"
                    className={`${avail.color
                      .replace("bg-", "border-")
                      .replace("bg-", "text-")}`}
                  >
                    {avail.text}
                  </Badge>
                </div>
                <div className="mt-2">
                  <Progress value={percent} className="h-2" />
                  <div className="flex justify-between text-xs mt-1">
                    <span>
                      {current}/{capacity}
                    </span>
                    <span>{p.teacher.name}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
