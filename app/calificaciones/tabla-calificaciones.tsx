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

type Calificacion = {
  _id: Id<"calificaciones">;
  nota: number;
  estudianteId: Id<"estudiantes">;
  materiaId: Id<"materia">;
  semestre: string;
};

export function TablaCalificacionesExpandible() {
  const router = useRouter();
  const calificaciones = useQuery(api.calificaciones.obtenerCalificaciones);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  if (calificaciones === undefined) {
    return <div>Cargando calificaciones...</div>;
  }

  const handleVerCalificacion = (id: Id<"calificaciones">) => {
    router.push(`/calificaciones/${id}`);
  };

  const handleCrear = () => {
    router.push("/calificaciones/create");
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
        <h2 className="text-xl font-semibold">Lista de Calificaciones</h2>
        <Button onClick={handleCrear} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Calificación
        </Button>
      </div>
      
      <Table>
        <TableCaption>Lista de calificaciones registradas</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Estudiante ID</TableHead>
            <TableHead>Materia ID</TableHead>
            <TableHead>Semestre</TableHead>
            <TableHead className="w-[100px]">Nota</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calificaciones.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No hay calificaciones registradas
              </TableCell>
            </TableRow>
          ) : (
            calificaciones.map((calificacion) => (
              <React.Fragment key={calificacion._id}>
                <TableRow 
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => toggleRow(calificacion._id)}
                    >
                      {expandedRows[calificacion._id] ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                  <TableCell 
                    onClick={() => handleVerCalificacion(calificacion._id)}
                  >
                    {calificacion.estudianteId}
                  </TableCell>
                  <TableCell onClick={() => handleVerCalificacion(calificacion._id)}>
                    {calificacion.materiaId}
                  </TableCell>
                  <TableCell onClick={() => handleVerCalificacion(calificacion._id)}>
                    {calificacion.semestre}
                  </TableCell>
                  <TableCell 
                    className={`font-bold ${calificacion.nota >= 7 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
                    onClick={() => handleVerCalificacion(calificacion._id)}
                  >
                    {calificacion.nota}
                  </TableCell>
                </TableRow>
                {expandedRows[calificacion._id] && (
                  <TableRow key={`expanded-${calificacion._id}`}>
                    <TableCell colSpan={5} className="p-0">
                      <DetallesCalificacion calificacionId={calificacion._id} />
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

function DetallesCalificacion({ calificacionId }: { calificacionId: Id<"calificaciones"> }) {
  const calificacion = useQuery(api.calificaciones.obtenerCalificacionPorId, { id: calificacionId });
  
  if (!calificacion) {
    return (
      <div className="p-4 bg-muted/30 text-foreground">
        <p>Cargando detalles...</p>
      </div>
    );
  }

  return (
    <Card className="m-2 border-0 shadow-none bg-muted/30">
      <CardContent className="p-4 text-foreground">
        <h3 className="text-sm font-medium mb-2">Detalles de la Calificación</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="bg-card p-3 rounded-md shadow-sm border border-border">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Estado:</span>
                <span className={`text-sm font-bold ${calificacion.nota >= 7 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {calificacion.nota >= 7 ? 'Aprobado' : 'Reprobado'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Fecha de registro:</span>
                <span className="text-sm">{new Date(calificacion._creationTime).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}