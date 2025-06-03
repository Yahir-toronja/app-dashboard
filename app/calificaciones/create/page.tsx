"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Id } from "@/convex/_generated/dataModel";

export default function CrearCalificacionPage() {
    const router = useRouter();
    const crearCalificacion = useMutation(api.calificaciones.crearCalificacion);
    
    // Obtener listas de estudiantes y materias para los selectores
    const estudiantes = useQuery(api.calificaciones.obtenerEstudiantes) || [];
    const materias = useQuery(api.calificaciones.obtenerMaterias) || [];

    const [formData, setFormData] = useState({
        estudianteId: "",
        materiaId: "",
        nota: "",
        semestre: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Lista de semestres para el selector (ejemplo)
    const semestres = [
        "2024-1", "2024-2", "2025-1", "2025-2"
    ];

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await crearCalificacion({
                estudianteId: formData.estudianteId as Id<"estudiantes">,
                materiaId: formData.materiaId as Id<"materia">,
                nota: parseFloat(formData.nota),
                semestre: formData.semestre,
            });
            router.push("/calificaciones");
        } catch (error: unknown) {
            console.error("Error al crear calificación:", error);
            let errorMessage = 'Desconocido';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            alert(`Error al crear calificación: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (estudiantes === undefined || materias === undefined) {
        return <div className="container mx-auto py-10">Cargando datos...</div>;
    }

    const formIsValid = 
        formData.estudianteId && 
        formData.materiaId && 
        formData.nota && 
        !isNaN(parseFloat(formData.nota)) &&
        parseFloat(formData.nota) >= 0 && 
        parseFloat(formData.nota) <= 10 &&
        formData.semestre;

    return (
        <div className="container px-4 sm:px-6 lg:px-8 py-10 mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl sm:text-3xl font-bold">
                        Crear Nueva Calificación
                    </h1>
                </div>
            </div>

            <Card className="w-full max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle className="font-semibold text-center">Información de la Calificación</CardTitle>
                    </CardHeader>

                    <CardContent className="grid grid-cols-1 gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="estudianteId">Estudiante</Label>
                            <Select 
                                onValueChange={(value) => handleSelectChange("estudianteId", value)}
                                value={formData.estudianteId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona el estudiante" />
                                </SelectTrigger>
                                <SelectContent>
                                    {estudiantes.map((estudiante) => (
                                        <SelectItem key={estudiante._id} value={estudiante._id}>
                                            {estudiante.matricula} - {estudiante.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="materiaId">Materia</Label>
                            <Select 
                                onValueChange={(value) => handleSelectChange("materiaId", value)}
                                value={formData.materiaId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona la materia" />
                                </SelectTrigger>
                                <SelectContent>
                                    {materias.map((materia) => (
                                        <SelectItem key={materia._id} value={materia._id}>
                                            {materia.id_m} - {materia.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="nota">Nota (0-10)</Label>
                            <Input
                                id="nota"
                                name="nota"
                                type="number"
                                step="0.1"
                                min="0"
                                max="10"
                                value={formData.nota}
                                onChange={handleInputChange}
                                placeholder="Ej: 8.5"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="semestre">Semestre</Label>
                            <Select 
                                onValueChange={(value) => handleSelectChange("semestre", value)}
                                value={formData.semestre}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona el semestre" />
                                </SelectTrigger>
                                <SelectContent>
                                    {semestres.map((semestre) => (
                                        <SelectItem key={semestre} value={semestre}>
                                            {semestre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !formIsValid}
                            className="w-full sm:w-auto"
                        >
                            {isSubmitting ? "Creando..." : "Crear Calificación"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}