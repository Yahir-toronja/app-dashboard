"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
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
import { ArrowLeft } from "lucide-react";

export default function CrearEstudiantePage() {
    const router = useRouter();
    const crearEstudiante = useMutation(api.estudiantes.crearEstudiante);

    const [formData, setFormData] = useState({
        matricula: "",
        nombre: "",
        correo: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await crearEstudiante({
                matricula: formData.matricula,
                nombre: formData.nombre,
                correo: formData.correo
            });
            router.push("/estudiantes");
        } catch (error) {
            console.error("Error al crear estudiante:", error);
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
                        Crear Nuevo Estudiante
                    </h1>
                </div>
            </div>

            <Card className="w-full max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle className="font-semibold text-center">Información del Estudiante</CardTitle>
                    </CardHeader>

                    <CardContent className="grid grid-cols-1 gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="matricula">Número de Matrícula</Label>
                            <Input
                                id="matricula"
                                name="matricula"
                                value={formData.matricula}
                                onChange={handleChange}
                                placeholder="Ej: A12345"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="nombre">Nombre Completo</Label>
                            <Input
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Nombre del estudiante"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="correo">Correo Electrónico</Label>
                            <Input
                                id="correo"
                                name="correo"
                                type="email"
                                value={formData.correo}
                                onChange={handleChange}
                                placeholder="correo@ejemplo.com"
                                required
                            />
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
                            {isSubmitting ? "Creando..." : "Crear Estudiante"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>

    );
}
