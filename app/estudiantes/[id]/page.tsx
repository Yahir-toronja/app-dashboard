"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function DetalleEstudiantePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { id: numMatricula } = resolvedParams;
    const router = useRouter();
    
    // La función devuelve un array, no un objeto individual
    const estudiantesArray = useQuery(api.estudiantes.buscarEstudiantesPorMatricula, { matricula: numMatricula });
    const eliminarEstudiante = useMutation(api.estudiantes.eliminarEstudiante);

    const [modalEliminar, setModalEliminar] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Extraer el primer estudiante del array (asumiendo que la matrícula es única)
    const estudiante = estudiantesArray?.[0];

    if (estudiantesArray === undefined) {
        return (
            <div className="container mx-auto py-10">
                <div className="flex items-center gap-2 mb-6">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold">Cargando...</h1>
                </div>
            </div>
        );
    }

    if (!estudiante) {
        return (
            <div className="container mx-auto py-10">
                <div className="flex items-center gap-2 mb-6">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold">Estudiante no encontrado</h1>
                </div>
                <p>No se pudo encontrar el estudiante con la matrícula: {numMatricula}</p>
            </div>
        );
    }

    const handleEditar = () => {
        router.push(`/estudiantes/${numMatricula}/edit`);
    };

    const handleEliminar = async () => {
        setIsSubmitting(true);
        try {
            // Usar la propiedad 'id' en lugar de '_id'
            if (estudiante?._id) {
                await eliminarEstudiante({ id: estudiante._id });
                router.push("/estudiantes");
            } else {
                console.error("No se encontró el id del estudiante para eliminar.");
            }
        } catch (error) {
            console.error("Error al eliminar estudiante:", error);
        } finally {
            setIsSubmitting(false);
            setModalEliminar(false);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <div className="flex items-center gap-2 mb-6">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold">Detalle del Estudiante</h1>
            </div>

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl">
                            {estudiante.nombre}
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleEditar}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setModalEliminar(true)}
                                className="text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-1">Número de Matrícula</h3>
                        <div className="p-2 bg-muted rounded-md">{estudiante.matricula}</div>
                    </div>

                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-1">Nombre Completo</h3>
                        <div className="p-2 bg-muted rounded-md">{estudiante.nombre}</div>
                    </div>

                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-1">Correo Electrónico</h3>
                        <div className="p-2 bg-muted rounded-md">{estudiante.correo}</div>
                    </div>
                </CardContent>
            </Card>

            {/* Modal de confirmación para eliminar */}
            <Dialog open={modalEliminar} onOpenChange={setModalEliminar}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Estás completamente seguro?</DialogTitle>
                        <DialogDescription>
                            Esta acción no se puede deshacer. El estudiante será eliminado permanentemente
                            de la base de datos.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setModalEliminar(false)}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleEliminar}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Eliminando..." : "Eliminar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}