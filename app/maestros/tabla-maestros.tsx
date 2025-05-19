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

// type Maestro = {
//   _id: Id<"maestros">;
//   n_empelado: string;
//   nombre: string;
//   correo: string;
// };

export function TablaMaestrosExpandible() {
  const router = useRouter();
  const maestros = useQuery(api.maestros.obtenerMaestros);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  if (maestros === undefined) {
    return <div>Cargando maestros...</div>;
  }

  const handleVerMaestro = (n_empleado: string) => {
    router.push(`/maestros/${n_empleado}`);
  };

  const handleCrear = () => {
    router.push("/maestros/create");
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
        <h2 className="text-xl font-semibold">Lista de Maestros</h2>
        <Button onClick={handleCrear} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Maestro
        </Button>
      </div>
      
      <Table>
        <TableCaption>Lista de maestros registrados</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="w-[100px]">Número de Empleado</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Correo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {maestros.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No hay maestros registrados
              </TableCell>
            </TableRow>
          ) : (
            maestros.map((maestro) => (
              <React.Fragment key={maestro._id}>
                <TableRow 
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => toggleRow(maestro._id)}
                    >
                      {expandedRows[maestro._id] ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                  <TableCell 
                    className="font-medium"
                    onClick={() => handleVerMaestro(maestro.n_empelado)}
                  >
                    {maestro.n_empelado}
                  </TableCell>
                  <TableCell onClick={() => handleVerMaestro(maestro.n_empelado)}>
                    {maestro.nombre}
                  </TableCell>
                  <TableCell onClick={() => handleVerMaestro(maestro.n_empelado)}>
                    {maestro.correo}
                  </TableCell>
                </TableRow>
                {expandedRows[maestro._id] && (
                  <TableRow key={`expanded-${maestro._id}`}>
                    <TableCell colSpan={4} className="p-0">
                      <DetallesMaestro maestroId={maestro._id} />
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

function DetallesMaestro({ maestroId }: { maestroId: Id<"maestros"> }) {
  return (
    <Card className="m-2 border-0 shadow-none bg-muted/30">
      <CardContent className="p-4 text-foreground">
        <h3 className="text-sm font-medium mb-2">Detalles del Maestro</h3>
        <div className="grid grid-cols-1 gap-2">
          <div className="bg-card p-3 rounded-md shadow-sm border border-border">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Información adicional:</span>
                <span className="text-sm">Maestro activo en el sistema</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}