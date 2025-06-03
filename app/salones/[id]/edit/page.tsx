"use client";

import { useState, useEffect, use } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditarSalonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const idSalon = id as Id<"salones">;
  const router = useRouter();
  const salon = useQuery(api.salon.obtenerSalonPorId, { id: idSalon });
  const actualizarSalon = useMutation(api.salon.actualizarSalon);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    numero: "",
    edificio: "",
    planta: ""
  });
  
  // Cargar datos del salón cuando estén disponibles
  useEffect(() => {
    if (salon) {
      setFormData({
        numero: salon.numero,
        edificio: salon.edificio,
        planta: salon.planta
      });
    }
  }, [salon]);
  
  if (salon === undefined) {
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

  if (!salon) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Salón no encontrado</h1>
        </div>
        <p>No se pudo encontrar el Salón con el ID proporcionado.</p>
      </div>
    );
  }
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await actualizarSalon({
        id: salon._id,
        datos: {
          numero: formData.numero,
          edificio: formData.edificio,
          planta: formData.planta
        }
      });
      router.push(`/salones/${id}`);
    } catch (error) {
      console.error("Error al actualizar salón:", error);
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
        <h1 className="text-3xl font-bold">Editar Salón</h1>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="font-semibold text-center">Modificar información del Salón {salon.numero}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="numero">Número de Salón</Label>
              <Select 
                onValueChange={(value) => handleSelectChange("numero", value)}
                value={formData.numero}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el número de salón" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edificio">Edificio</Label>
              <Select 
                onValueChange={(value) => handleSelectChange("edificio", value)}
                value={formData.edificio}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el edificio" />
                </SelectTrigger>
                <SelectContent>
                  {["A", "B", "C", "D"].map((edificio) => (
                    <SelectItem key={edificio} value={edificio}>
                      Edificio {edificio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="planta">Planta</Label>
              <Select 
                onValueChange={(value) => handleSelectChange("planta", value)}
                value={formData.planta}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la planta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planta Alta">Planta Alta</SelectItem>
                  <SelectItem value="Planta Baja">Planta Baja</SelectItem>
                </SelectContent>
              </Select>
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
              disabled={isSubmitting || !formData.numero || !formData.edificio || !formData.planta}
              className="flex items-center gap-2"
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