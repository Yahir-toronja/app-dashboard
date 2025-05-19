import { TablaCalificacionesExpandible } from "./tabla-calificaciones";

export default function CalificacionesPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Calificaciones</h1>
      <TablaCalificacionesExpandible />
    </div>
  );
}