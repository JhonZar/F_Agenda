import { api } from "./client";

export interface ProfesorCursoMateria { id: number; name: string }

export interface ProfesorCurso {
  id: number;
  grade: string | number;
  section: string;
  teacher_id: number;
  students_count: number;
  materias: ProfesorCursoMateria[];
}

export interface ProfesorCursoDetalle extends ProfesorCurso {
  students: { id: number; name: string; email: string; phone: string }[];
}

export async function getProfesorCursos(): Promise<ProfesorCurso[]> {
  const res = await api.get("/profesor/cursos");
  return res.data as ProfesorCurso[];
}

export async function getProfesorCurso(id: number | string): Promise<ProfesorCursoDetalle> {
  const res = await api.get(`/profesor/cursos/${id}`);
  return res.data as ProfesorCursoDetalle;
}
