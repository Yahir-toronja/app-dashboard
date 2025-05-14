"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";


export default function DetalleEstudiantePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const idEstudiante = id as Id<"estudiantes">;
    const router = useRouter();
    const estudiantes = useQuery(api.estudiantes.buscarEstudiantesPorMatricula, { matricula: idEstudiante });
    const estudiante = estudiantes && estudiantes.length > 0 ? estudiantes[0] : null;
    const eliminarEstudiante = useMutation(api.estudiantes.eliminarEstudiante);
    const calificaciones = useQuery(api.calificaciones.obtenerCalificacionesPorEstudiante, 
        estudiante ? { estudiante_id: estudiante._id } : "skip");
    const crearCalificacion = useMutation(api.calificaciones.crearCalificacion);

    const [modalEliminar, setModalEliminar] = useState(false);
    const [modalCalificacion, setModalCalificacion] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [nuevaCalificacion, setNuevaCalificacion] = useState({
        valor: 5,
        descripcion: ""
    });

    if (estudiantes === undefined) {
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

    if (!estudiante || estudiantes.length === 0) {
        return (
            <div className="container mx-auto py-10">
                <div className="flex items-center gap-2 mb-6">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold">Estudiante no encontrado</h1>
                </div>
                <p>No se pudo encontrar el estudiante con el ID proporcionado.</p>
            </div>
        );
    }

    const handleEditar = () => {
        router.push(`/estudiantes/${id}/edit`);
    };

    const handleEliminar = async () => {
        setIsSubmitting(true);
        try {
            await eliminarEstudiante({ id: estudiante._id });
            router.push("/estudiantes");
        } catch (error) {
            console.error("Error al eliminar estudiante:", error);
        } finally {
            setIsSubmitting(false);
            setModalEliminar(false);
        }
    };

    const handleChangeCalificacion = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNuevaCalificacion(prev => ({
            ...prev,
            [name]: name === "valor" ? Number(value) : value
        }));
    };

    const handleGuardarCalificacion = async () => {
        if (!estudiante) return;
        
        setIsSubmitting(true);
        try {
            await crearCalificacion({
                valor: nuevaCalificacion.valor,
                estudiante_id: estudiante._id,
                descripcion: nuevaCalificacion.descripcion
            });
            setNuevaCalificacion({ valor: 5, descripcion: "" });
            setModalCalificacion(false);
        } catch (error) {
            console.error("Error al crear calificación:", error);
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

                    <Separator className="my-4" />
                    
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-medium">Calificaciones</h3>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setModalCalificacion(true)}
                                className="flex items-center gap-1"
                            >
                                <Plus className="h-3 w-3" />
                                Agregar
                            </Button>
                        </div>
                        
                        {calificaciones === undefined ? (
                            <div className="space-y-2">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ) : calificaciones.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No hay calificaciones registradas</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {calificaciones.map((calificacion) => (
                                    <div key={calificacion._id} className="bg-muted p-3 rounded-md">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">{calificacion.descripcion}</span>
                                            <span className={`font-bold ${calificacion.valor >= 7 ? 'text-green-600' : 'text-red-600'}`}>
                                                {calificacion.valor}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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

            {/* Modal para agregar calificación */}
            <Dialog open={modalCalificacion} onOpenChange={setModalCalificacion}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Agregar Calificación</DialogTitle>
                        <DialogDescription>
                            Ingresa los datos de la nueva calificación para {estudiante?.nombre}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="valor">Calificación (5-10)</Label>
                            <Input
                                id="valor"
                                name="valor"
                                type="number"
                                min="5"
                                max="10"
                                value={nuevaCalificacion.valor}
                                onChange={handleChangeCalificacion}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="descripcion">Descripción</Label>
                            <Input
                                id="descripcion"
                                name="descripcion"
                                value={nuevaCalificacion.descripcion}
                                onChange={handleChangeCalificacion}
                                placeholder="Ej: Examen parcial"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setModalCalificacion(false)}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleGuardarCalificacion}
                            disabled={isSubmitting || !nuevaCalificacion.descripcion}
                        >
                            {isSubmitting ? "Guardando..." : "Guardar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}