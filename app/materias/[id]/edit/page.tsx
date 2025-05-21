"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditarMateriaPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const materiaId = id as Id<"materia">;
  const router = useRouter();
  const materia = useQuery(api.materia.obtenerMateriaPorId, { id: materiaId });
  const actualizarMateria = useMutation(api.materia.actualizarMateria);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id_m: "",
    nombre: ""
  });
  
  // Cargar datos de la materia cuando estén disponibles
  useEffect(() => {
    if (materia) {
      setFormData({
        id_m: materia.id_m,
        nombre: materia.nombre
      });
    }
  }, [materia]);
  
  if (materia === undefined) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-full mb-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24 mr-2" />
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!materia) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Materia no encontrada</h1>
        </div>
        <p>No se pudo encontrar la materia con el ID proporcionado.</p>
      </div>
    );
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: value 
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await actualizarMateria({
        id: materia._id,
        datos: formData,
      });
      router.push(`/materias/${id}`);
    } catch (error) {
      console.error("Error al actualizar materia:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Editar Materia</h1>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="font-semibold text-center">Modificar información de {materia.nombre}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="id_m">Código</Label>
              <Input
                id="id_m"
                name="id_m"
                value={formData.id_m}
                onChange={handleChange}
                placeholder="Ej: MAT101"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Nombre de la materia"
                required
              />
            </div>
            

          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2 mt-8"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}