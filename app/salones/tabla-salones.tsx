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

type Salon = {
  _id: Id<"salones">;
  numero: number;
  edificio: string;
  planta: string;
};

export function TablaSalonesExpandible() {
  const router = useRouter();
  const salones = useQuery(api.salon.obtenerSalones);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  if (salones === undefined) {
    return <div>Cargando salones...</div>;
  }

  const handleVerSalon = (id: Id<"salones">) => {
    router.push(`/salones/${id}`);
  };

  const handleCrear = () => {
    router.push("/salones/create");
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
        <h2 className="text-xl font-semibold">Lista de Salones</h2>
        <Button onClick={handleCrear} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Salón
        </Button>
      </div>
      
      <Table>
        <TableCaption>Lista de salones registrados</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="w-[100px]">Número</TableHead>
            <TableHead>Edificio</TableHead>
            <TableHead>Planta</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {salones.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No hay salones registrados
              </TableCell>
            </TableRow>
          ) : (
            salones.map((salon) => (
              <React.Fragment key={salon._id}>
                <TableRow 
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => toggleRow(salon._id)}
                    >
                      {expandedRows[salon._id] ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                  <TableCell 
                    className="font-medium"
                    onClick={() => handleVerSalon(salon._id)}
                  >
                    {salon.numero}
                  </TableCell>
                  <TableCell onClick={() => handleVerSalon(salon._id)}>
                    {salon.edificio}
                  </TableCell>
                  <TableCell onClick={() => handleVerSalon(salon._id)}>
                    {salon.planta}
                  </TableCell>
                </TableRow>
                {expandedRows[salon._id] && (
                  <TableRow key={`expanded-${salon._id}`}>
                    <TableCell colSpan={4} className="p-0">
                      <DetallesSalon salonId={salon._id} />
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

function DetallesSalon({ salonId }: { salonId: Id<"salones"> }) {
  return (
    <Card className="m-2 border-0 shadow-none bg-muted/30">
      <CardContent className="p-4 text-foreground">
        <h3 className="text-sm font-medium mb-2">Detalles del Salón</h3>
        <div className="grid grid-cols-1 gap-2">
          <div className="bg-card p-3 rounded-md shadow-sm border border-border">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Capacidad:</span>
                <span className="text-sm">30 estudiantes</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Estado:</span>
                <span className="text-sm">Disponible</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}