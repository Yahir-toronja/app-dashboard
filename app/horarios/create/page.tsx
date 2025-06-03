"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

export default function CrearHorarioPage() {
    const router = useRouter();
    const crearHorario = useMutation(api.horario.crearHorario);

    const [formData, setFormData] = useState({
        periodo: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Definimos los periodos disponibles de 8am a 2pm con intervalos de 1 hora
    const periodos = [
        "8:00 AM - 9:00 AM",
        "9:00 AM - 10:00 AM",
        "10:00 AM - 11:00 AM",
        "11:00 AM - 12:00 PM",
        "12:00 PM - 1:00 PM",
        "1:00 PM - 2:00 PM"
    ];

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await crearHorario(formData);
            router.push("/horarios");
        } catch (error) {
            console.error("Error al crear horario:", error);
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
                        Crear Nuevo Horario
                    </h1>
                </div>
            </div>

            <Card className="w-full max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle className="font-semibold text-center">Información del Horario</CardTitle>
                    </CardHeader>

                    <CardContent className="grid grid-cols-1 gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="periodo">Periodo</Label>
                            <Select 
                                onValueChange={(value) => handleSelectChange("periodo", value)}
                                value={formData.periodo}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona el periodo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {periodos.map((periodo) => (
                                        <SelectItem key={periodo} value={periodo}>
                                            {periodo}
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
                            disabled={isSubmitting || !formData.periodo}
                            className="w-full sm:w-auto"
                        >
                            {isSubmitting ? "Creando..." : "Crear Horario"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}