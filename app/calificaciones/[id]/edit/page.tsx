"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function EditarCalificacion({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = params.id as Id<"calificaciones">;
  
  const calificaciones = useQuery(api.calificaciones.obtenerCalificaciones);
  const calificacion = calificaciones?.find(c => c._id === id);
  const estudiantes = useQuery(api.estudiantes.obtenerEstudiantes);
  const materias = useQuery(api.materia.obtenerMaterias);
  
  const actualizarCalificacion = useMutation(api.calificaciones.actualizarCalificacion);
  
  const [formData, setFormData] = useState({
    estudiante_id: "",
    materia_id: "",
    calificacion: "",
    periodo: ""
  });
  
  useEffect(() => {
    if (calificacion) {
      setFormData({
        estudiante_id: calificacion.estudianteId,
        materia_id: calificacion.materiaId,
        calificacion: calificacion.nota.toString(),
        periodo: calificacion.semestre
      });
    }
  }, [calificacion]);
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await actualizarCalificacion({
        id,
        datos: {
          materiaId: formData.materia_id as Id<"materia">,
          nota: parseFloat(formData.calificacion),
          semestre: formData.periodo
        }
      });
      // Nota: No se incluye estudianteId porque según la API no se puede modificar
      
      toast.success("La calificación ha sido actualizada exitosamente.");
      
      router.push("/calificaciones");
    } catch (_error) {
      toast.error("Ocurrió un error al actualizar la calificación.");
    }
  };
  
  if (!calificacion || !estudiantes || !materias) {
    return <div>Cargando...</div>;
  }
  
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Editar Calificación</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="estudiante">Estudiante</Label>
              <Select 
                value={formData.estudiante_id} 
                onValueChange={(value) => handleChange("estudiante_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estudiante" />
                </SelectTrigger>
                <SelectContent>
                  {estudiantes.map((estudiante) => (
                    <SelectItem key={estudiante._id} value={estudiante._id}>
                      {estudiante.nombre} - {estudiante.matricula}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="materia">Materia</Label>
              <Select 
                value={formData.materia_id} 
                onValueChange={(value) => handleChange("materia_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar materia" />
                </SelectTrigger>
                <SelectContent>
                  {materias.map((materia) => (
                    <SelectItem key={materia._id} value={materia._id}>
                      {materia.nombre} - {materia.id_m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="calificacion">Calificación</Label>
              <Input
                id="calificacion"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.calificacion}
                onChange={(e) => handleChange("calificacion", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="periodo">Periodo</Label>
              <Select 
                value={formData.periodo} 
                onValueChange={(value) => handleChange("periodo", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar periodo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Primer parcial">Primer parcial</SelectItem>
                  <SelectItem value="Segundo parcial">Segundo parcial</SelectItem>
                  <SelectItem value="Tercer parcial">Tercer parcial</SelectItem>
                  <SelectItem value="Final">Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push("/calificaciones")}
              >
                Cancelar
              </Button>
              <Button type="submit">Guardar cambios</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}