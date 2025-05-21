"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";

// Configuración de la página para Next.js 15
export const dynamic = 'force-dynamic';
export const fetchCache = 'default-no-store';
export const revalidate = 0;

export default function DetalleCalificacion({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const calificacionId = id as Id<"calificaciones">;
  
  const calificaciones = useQuery(api.calificaciones.obtenerCalificaciones);
  const calificacion = calificaciones?.find(c => c._id === calificacionId);
  const estudiantes = useQuery(api.estudiantes.obtenerEstudiantes);
  const materias = useQuery(api.materia.obtenerMaterias);
  
  if (!calificacion || !estudiantes || !materias) {
    return <div>Cargando...</div>;
  }
  
  const estudiante = estudiantes.find(e => e._id === calificacion.estudianteId);
  const materia = materias.find(m => m._id === calificacion.materiaId);
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.push("/calificaciones")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Detalle de Calificación</h1>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Información de la Calificación</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => router.push(`/calificaciones/${id}/edit`)}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-sm">Estudiante</h3>
              <p>{estudiante ? `${estudiante.nombre} (${estudiante.matricula})` : "No disponible"}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-sm">Materia</h3>
              <p>{materia ? `${materia.nombre} (${materia.id_m})` : "No disponible"}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-sm">Calificación</h3>
              <p className={`font-bold ${calificacion.nota >= 7 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {calificacion.nota}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-sm">Periodo</h3>
              <p>{calificacion.semestre}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-sm">Estado</h3>
              <p className={`font-bold ${calificacion.nota >= 7 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {calificacion.nota >= 7 ? "Aprobado" : "Reprobado"}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-sm">Fecha de registro</h3>
              <p>{new Date(calificacion._creationTime).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}