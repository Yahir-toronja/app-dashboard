"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function TablaHorarios() {
  const router = useRouter();
  const horarios = useQuery(api.horario.obtenerHorarios);

  if (horarios === undefined) {
    return <div>Cargando horarios...</div>;
  }

  const handleVerHorario = (id: string) => {
    router.push(`/horarios/${id}`);
  };

  const handleCrear = () => {
    router.push("/horarios/create");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Lista de Horarios</h2>
        <Button onClick={handleCrear} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo horario
        </Button>
      </div>
      
      <Table>
        <TableCaption>Lista de horarios registrados</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Periodo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {horarios.length === 0 ? (
            <TableRow>
              <TableCell className="text-center">
                No hay horarios registrados
              </TableCell>
            </TableRow>
          ) : (
            horarios.map((horario) => (
              <TableRow 
                key={horario._id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleVerHorario(horario._id)}
              >
                <TableCell>{horario.periodo}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}