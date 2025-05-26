'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function DetalleSalonPage() {
  const params = useParams();
  const id = params?.id as string;
  const salonId = id as Id<"salones">;
  const router = useRouter();

  const salon = useQuery(api.salon.obtenerSalonPorId, {
    id: salonId,
  });
  const eliminarSalon = useMutation(api.salon.eliminarSalon);

  const [modalEliminar, setModalEliminar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        <p>No se pudo encontrar el salón con el ID proporcionado.</p>
      </div>
    );
  }

  const handleEditar = () => {
    router.push(`/salones/${id}/edit`);
  };

  const handleEliminar = async () => {
    setIsSubmitting(true);
    try {
      await eliminarSalon({ id: salon._id });
      router.push("/salones");
    } catch (error) {
      console.error("Error al eliminar salón:", error);
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
        <h1 className="text-3xl font-bold">Salón {salon.numero}</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Detalles del Salón</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Número</h3>
            <p className="text-lg">{salon.numero}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Edificio</h3>
            <p className="text-lg">{salon.edificio}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Planta</h3>
            <p className="text-lg">{salon.planta}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleEditar}
            className="flex items-center gap-1"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            onClick={() => setModalEliminar(true)}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={modalEliminar} onOpenChange={setModalEliminar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este salón? Esta acción no se puede deshacer.
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