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

export default function CrearSalonPage() {
    const router = useRouter();
    const crearSalon = useMutation(api.salon.crearSalon);

    const [formData, setFormData] = useState({
        numero: "",
        edificio: "",
        capacidad: 0,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ 
            ...prev, 
            [name]: name === "capacidad" ? Number(value) : value 
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await crearSalon({
                numero: formData.numero,
                edificio: formData.edificio,
                capacidad: formData.capacidad
            });
            router.push("/salones");
        } catch (error) {
            console.error("Error al crear salón:", error);
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
                        Crear Nuevo Salón
                    </h1>
                </div>
            </div>

            <Card className="w-full max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle className="font-semibold text-center">Información del Salón</CardTitle>
                    </CardHeader>

                    <CardContent className="grid grid-cols-1 gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="numero">Número de Salón</Label>
                            <Input
                                id="numero"
                                name="numero"
                                value={formData.numero}
                                onChange={handleChange}
                                placeholder="Ej: 101"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edificio">Edificio</Label>
                            <Input
                                id="edificio"
                                name="edificio"
                                value={formData.edificio}
                                onChange={handleChange}
                                placeholder="Nombre del edificio"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="capacidad">Capacidad</Label>
                            <Input
                                id="capacidad"
                                name="capacidad"
                                type="number"
                                value={formData.capacidad}
                                onChange={handleChange}
                                placeholder="30"
                                min="1"
                                max="100"
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
                            {isSubmitting ? "Creando..." : "Crear Salón"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}