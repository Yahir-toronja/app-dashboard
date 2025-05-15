"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";

type Estudiante = {
  _id: Id<"estudiantes">;
  matricula: string;
  nombre: string;
  correo: string;
};

export function TablaEstudiantesExpandible() {
  const router = useRouter();
  const estudiantes = useQuery(api.estudiantes.obtenerEstudiantes);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  if (estudiantes === undefined) {
    return <div>Cargando estudiantes...</div>;
  }

  const handleVerEstudiante = (matricula: string) => {
    router.push(`/estudiantes/${matricula}`);
  };

  const handleCrear = () => {
    router.push("/estudiantes/create");
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Lista de Estudiantes</h2>
        <Button onClick={handleCrear} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Estudiante
        </Button>
      </div>
      
      <Table>
        <TableCaption>Lista de estudiantes registrados</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="w-[100px]">Matrícula</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Correo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {estudiantes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No hay estudiantes registrados
              </TableCell>
            </TableRow>
          ) : (
            estudiantes.map((estudiante) => (
              <React.Fragment key={estudiante._id}>
                <TableRow 
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => toggleRow(estudiante._id)}
                    >
                      {expandedRows[estudiante._id] ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                  <TableCell 
                    className="font-medium"
                    onClick={() => handleVerEstudiante(estudiante.matricula)}
                  >
                    {estudiante.matricula}
                  </TableCell>
                  <TableCell onClick={() => handleVerEstudiante(estudiante.matricula)}>
                    {estudiante.nombre}
                  </TableCell>
                  <TableCell onClick={() => handleVerEstudiante(estudiante.matricula)}>
                    {estudiante.correo}
                  </TableCell>
                </TableRow>
                {expandedRows[estudiante._id] && (
                  <TableRow key={`expanded-${estudiante._id}`}>
                    <TableCell colSpan={4} className="p-0">
                      <CalificacionesEstudiante estudianteId={estudiante._id} />
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

import { useCalificaciones } from "@/hooks/use-calificaciones"; // Importar el nuevo hook

function CalificacionesEstudiante({ estudianteId }: { estudianteId: Id<"estudiantes"> }) {
  const { calificaciones, isLoading: cargando, error } = useCalificaciones(estudianteId);

  if (cargando) {
    return (
      <div className="p-4 bg-muted/30 text-foreground">
        <p>Cargando calificaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-muted/30 text-destructive">
        <p>Error al cargar calificaciones: {error}</p>
      </div>
    );
  }

  return (
    <Card className="m-2 border-0 shadow-none bg-muted/30">
      <CardContent className="p-4 text-foreground">
        <h3 className="text-sm font-medium mb-2">Calificaciones</h3>
        {calificaciones.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay calificaciones registradas</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {calificaciones.map((calificacion) => (
              <div key={calificacion._id} className="bg-card p-3 rounded-md shadow-sm border border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{calificacion.descripcion}</span>
                  <span className={`text-sm font-bold ${calificacion.valor >= 7 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {calificacion.valor}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}