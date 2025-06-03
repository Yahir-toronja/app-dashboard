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

export default function CrearSalonPage() {
    const router = useRouter();
    const crearSalon = useMutation(api.salon.crearSalon);
    const [formData, setFormData] = useState({
        numero: "",
        edificio: "",
        planta: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Convertir numero a number antes de enviar
            await crearSalon({
                numero: formData.numero,
                edificio: formData.edificio,
                planta: formData.planta,
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
                        <CardTitle className="font-semibold text-center">
                            Información del Salón
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="numero">Número del Salón</Label>
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
                        
                        <div className="grid gap-2">
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
                        
                        <div className="grid gap-2">
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
                            disabled={isSubmitting || !formData.numero || !formData.edificio || !formData.planta}
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