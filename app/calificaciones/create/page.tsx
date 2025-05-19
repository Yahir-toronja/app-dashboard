"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

export default function CrearCalificacionPage() {
    const router = useRouter();
    const crearCalificacion = useMutation(api.calificaciones.crearCalificacion);
    const materias = useQuery(api.materia.obtenerMaterias) || [];

    const [formData, setFormData] = useState({
        estudianteId: "" as unknown as Id<"estudiantes">,
        materiaId: "" as unknown as Id<"materia">,
        nota: 0,
        semestre: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ 
            ...prev, 
            [name]: name === "nota" ? Number(value) : value 
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await crearCalificacion({
                estudianteId: formData.estudianteId,
                materiaId: formData.materiaId,
                nota: formData.nota,
                semestre: formData.semestre
            });
            router.push("/calificaciones");
        } catch (error) {
            console.error("Error al crear calificación:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                            <Label htmlFor="estudianteId">Nombre del Estudiante</Label>
                            <Input
                                id="estudianteId"
                                name="estudianteId"
                                value={formData.estudianteId as string}
                                onChange={handleChange}
                                placeholder="Nombre completo del estudiante"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="materiaId">Materia</Label>
                            <Select
                                value={formData.materiaId as string}
                                onValueChange={(value) => handleSelectChange("materiaId", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una materia" />
                                </SelectTrigger>
                                <SelectContent>
                                    {materias.map((materia) => (
                                        <SelectItem key={materia._id} value={materia._id}>
                                            {materia.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="nota">Calificación</Label>
                            <Input
                                id="nota"
                                name="nota"
                                type="number"
                                value={formData.nota}
                                onChange={handleChange}
                                placeholder="8.5"
                                min="0"
                                max="10"
                                step="0.1"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="semestre">Semestre</Label>
                            <Select
                                value={formData.semestre}
                                onValueChange={(value) => handleSelectChange("semestre", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un semestre" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2023-1">2023-1</SelectItem>
                                    <SelectItem value="2023-2">2023-2</SelectItem>
                                    <SelectItem value="2024-1">2024-1</SelectItem>
                                    <SelectItem value="2024-2">2024-2</SelectItem>
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
                            disabled={isSubmitting}
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