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

type Materia = {
  _id: Id<"materia">;
  nombre: string;
  id_m: string;
};

export function TablaMateriaExpandible() {
  const router = useRouter();
  const materias = useQuery(api.materia.obtenerMaterias);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  if (materias === undefined) {
    return <div>Cargando materias...</div>;
  }

  const handleVerMateria = (id: Id<"materia">) => {
    router.push(`/materias/${id}`);
  };

  const handleCrear = () => {
    router.push("/materias/create");
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
        <h2 className="text-xl font-semibold">Lista de Materias</h2>
        <Button onClick={handleCrear} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Materia
        </Button>
      </div>
      
      <Table>
        <TableCaption>Lista de materias registradas</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="w-[100px]">Código</TableHead>
            <TableHead>Nombre</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materias.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                No hay materias registradas
              </TableCell>
            </TableRow>
          ) : (
            materias.map((materia) => (
              <React.Fragment key={materia._id}>
                <TableRow 
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => toggleRow(materia._id)}
                    >
                      {expandedRows[materia._id] ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                  <TableCell 
                    className="font-medium"
                    onClick={() => handleVerMateria(materia._id)}
                  >
                    {materia.id_m}
                  </TableCell>
                  <TableCell onClick={() => handleVerMateria(materia._id)}>
                    {materia.nombre}
                  </TableCell>
                </TableRow>
                {expandedRows[materia._id] && (
                  <TableRow key={`expanded-${materia._id}`}>
                    <TableCell colSpan={3} className="p-0">
                      <DetallesMateria materiaId={materia._id} />
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

function DetallesMateria({ materiaId }: { materiaId: Id<"materia"> }) {
  return (
    <Card className="m-2 border-0 shadow-none bg-muted/30">
      <CardContent className="p-4 text-foreground">
        <h3 className="text-sm font-medium mb-2">Detalles de la Materia</h3>
        <div className="grid grid-cols-1 gap-2">
          <div className="bg-card p-3 rounded-md shadow-sm border border-border">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Información adicional:</span>
                <span className="text-sm">Esta materia está disponible para inscripción</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}