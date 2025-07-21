// src/pages/asistencias/hook/useAttendance.ts
import {
  getAttendance,
  getAttendanceHistory,
  saveAttendance,
  type AttendanceRecord,
  type SaveAttendancePayload,
} from "@/api/attendanceApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// 1) Carga de una sesión concreta
export function useAttendance(date: string, paraleloId: string) {
  return useQuery<AttendanceRecord, Error>({
    queryKey: ["attendance", date, paraleloId],
    queryFn: () => getAttendance(date, paraleloId),
    enabled: Boolean(date && paraleloId),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// 2) Historial de sesiones
export function useAttendanceHistory() {
  return useQuery<AttendanceRecord[], Error>({
    queryKey: ["attendanceHistory"],
    queryFn: getAttendanceHistory,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// 3) Guardar / actualizar asistencia
export function useSaveAttendance() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, SaveAttendancePayload>({
    mutationFn: saveAttendance,
    onSuccess: (_data, variables) => {
      // invalidar la sesión actual y el historial
      queryClient.invalidateQueries({ queryKey: ["attendance", variables.date, variables.paralelo_id] });
      queryClient.invalidateQueries({ queryKey: ["attendanceHistory"] });
    },
  });
}
