import { TablaHorarios } from "@/app/horarios/tabla-horarios";

export default function HorariosPage() {
  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Sistema de Horarios</h1>
      <p className="text-muted-foreground mb-6">
        Haz clic en cualquier horario para ver sus detalles completos, 
        editarlo o eliminarlo. Para crear un nuevo horario, usa el botón 
        Nuevo Horario.
      </p>
      <TablaHorarios />
    </main>
  );
}