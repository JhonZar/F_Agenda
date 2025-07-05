import { useState, useMemo } from "react";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import type { Profesor } from "@/api/profesores";
import { useProfesores } from "../hook/useProfesores";
// import { useProfesores, Profesor } from "@/hooks/useProfesores";

interface ProfesorSearchProps {
  onSelect: (prof: Profesor) => void;
}

export function ProfesorSearch({ onSelect }: ProfesorSearchProps) {
  const { profesores, loading, error } = useProfesores();
  const [query, setQuery] = useState("");

  // Filtrar localmente
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return profesores.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
    );
  }, [profesores, query]);

  return (
    <div className="w-full max-w-sm">
      <Command>
        {/* Input integrado */}
        <CommandInput
          placeholder="Buscar profesor..."
          value={query}
          onValueChange={setQuery}
        />

        {/* Mensaje de carga o error */}
        {loading && <div className="p-2 text-sm">Cargando...</div>}
        {error && <div className="p-2 text-sm text-red-500">{error}</div>}

        {/* Si no hay resultados */}
        <CommandEmpty>No se encontraron profesores.</CommandEmpty>

        {/* Lista de resultados */}
        <CommandGroup>
          {filtered.map((prof) => (
            <CommandItem
              key={prof.id}
              value={prof.name}
              onSelect={() => onSelect(prof)}
            >
              <span>{prof.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {prof.email}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </Command>
    </div>
  );
}
