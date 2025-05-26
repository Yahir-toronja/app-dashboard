'use client';

import { useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useForm } from 'react-hook-form';

interface FormValues {
  numero: number;
  edificio: string;
  planta: string;
}

export default function EditSalonPage() {
  const params = useParams();
  const id = params?.id as string;
  const salonId = id as Id<"salones">;
  const router = useRouter();

  const salon = useQuery(api.salon.obtenerSalonPorId, {
    id: salonId,
  });
  const actualizarSalon = useMutation(api.salon.actualizarSalon);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>();

  useEffect(() => {
    if (salon) {
      setValue('numero', salon.numero);
      setValue('edificio', salon.edificio);
      setValue('planta', salon.planta);
    }
  }, [salon, setValue]);

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

  const onSubmit = async (data: FormValues) => {
    try {
      await actualizarSalon({
        id: salon._id,
        datos: {
          numero: Number(data.numero),
          edificio: data.edificio,
          planta: data.planta
        }
      });
      router.push(`/salones/${id}`);
    } catch (error) {
      console.error("Error al actualizar salón:", error);
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
        <CardHeader>
          <CardTitle>Editar información del salón</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                type="number"
                {...register('numero', {
                  required: 'El número es obligatorio',
                  valueAsNumber: true,
                  min: { value: 1, message: 'El número debe ser mayor a 0' },
                })}
              />
              {errors.numero && (
                <p className="text-sm text-red-500">{errors.numero.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edificio">Edificio</Label>
              <Input
                id="edificio"
                {...register('edificio', { required: 'El edificio es obligatorio' })}
              />
              {errors.edificio && (
                <p className="text-sm text-red-500">{errors.edificio.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="planta">Planta</Label>
              <Input
                id="planta"
                {...register('planta', { required: 'La planta es obligatoria' })}
              />
              {errors.planta && (
                <p className="text-sm text-red-500">{errors.planta.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}