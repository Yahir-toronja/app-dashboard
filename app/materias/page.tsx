'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import TablaMaterias from './tabla-materias';

export default function MateriasPage() {
  const materias = useQuery(api.materia.obtenerMaterias);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Materias</h1>
        <Button asChild>
          <Link href="/materias/create">
            <Plus className="mr-2 h-4 w-4" /> Agregar Materia
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Materias</CardTitle>
        </CardHeader>
        <CardContent>
          <TablaMaterias materias={materias || []} />
        </CardContent>
      </Card>
    </div>
  );
}