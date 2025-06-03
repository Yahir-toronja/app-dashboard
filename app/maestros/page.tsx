import { TablaMaestros } from "@/app/maestros/tabla-maestros";

export default function MaestrosPage() {
  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Sistema de Maestros</h1>
      <p className="text-muted-foreground mb-6">
        Haz clic en cualquier maestro para ver sus detalles completos, 
        editarlo o eliminarlo. Para crear un nuevo maestro, usa el botón 
        Nuevo Maestro.
      </p>
      <TablaMaestros />
    </main>
  );
}