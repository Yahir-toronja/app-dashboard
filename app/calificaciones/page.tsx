import { TablaCalificaciones } from "@/app/calificaciones/tabla-calificaciones";

export default function CalificacionesPage() {
  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Sistema de Calificaciones</h1>
      <p className="text-muted-foreground mb-6">
        Haz clic en cualquier calificación para ver sus detalles completos, 
        editarla o eliminarla. Para crear una nueva calificación, usa el botón 
        Nueva Calificación.
      </p>
      <TablaCalificaciones />
    </main>
  );
}