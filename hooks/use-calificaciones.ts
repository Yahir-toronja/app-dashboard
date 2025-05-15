import { useMutation } from "convex/react";
import { useQuery } from "convex/react";
import { useConvex } from "convex/react"; // Usar useConvex en lugar de useContext
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";

export interface Calificacion {
  _id: Id<"calificaciones">;
  _creationTime: number;
  estudiante_id: Id<"estudiantes">;
  valor: number;
  descripcion: string; // No es opcional según el schema
  fecha?: string; // Este campo no está en el schema pero lo mantenemos para compatibilidad
}

export const useCalificaciones = (estudianteId: Id<"estudiantes"> | "skip") => {
  // Usar useConvex en lugar de useContext
  const convex = useConvex();
  const crearCalificacion = useMutation(api.calificaciones.crearCalificacion);
  const actualizarCalificacion = useMutation(api.calificaciones.actualizarCalificacion);
  const eliminarCalificacion = useMutation(api.calificaciones.eliminarCalificacion);

  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarCalificaciones = useCallback(async () => {
    if (estudianteId === "skip") {
      setCalificaciones([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await convex.query(api.calificaciones.obtenerCalificacionesPorEstudiante, { estudiante_id: estudianteId });
      setCalificaciones(result as Calificacion[]); // Asegurar el tipado
    } catch (e) {
      console.error("Error al cargar calificaciones:", e);
      setError("Error al cargar calificaciones.");
      toast.error("Error al cargar calificaciones.");
    } finally {
      setIsLoading(false);
    }
  }, [convex, estudianteId]);

  useEffect(() => {
    cargarCalificaciones();
  }, [cargarCalificaciones]);

  // Memoizar las calificaciones para evitar re-renders innecesarios
  const memoizedCalificaciones = useMemo(() => calificaciones, [calificaciones]);

  const agregarCalificacion = async (datos: { valor: number; descripcion: string; fecha?: string }) => {
    if (estudianteId === "skip") {
      toast.error("ID de estudiante no válido para agregar calificación.");
      return;
    }
    setIsLoading(true);
    try {
      await crearCalificacion({
        estudiante_id: estudianteId,
        valor: datos.valor,
        descripcion: datos.descripcion, // Ahora es obligatorio
      });
      toast.success("Calificación agregada con éxito");
      await cargarCalificaciones(); // Recargar calificaciones
    } catch (e) {
      console.error("Error al agregar calificación:", e);
      setError("Error al agregar calificación.");
      toast.error("Error al agregar calificación.");
    } finally {
      setIsLoading(false);
    }
  };

  const modificarCalificacion = async (idCalificacion: Id<"calificaciones">, datos: { valor?: number; descripcion?: string; fecha?: string }) => {
    setIsLoading(true);
    try {
      // Aquí está la corrección, ahora los parámetros están estructurados correctamente
      await actualizarCalificacion({
        id: idCalificacion,
        datos: { // Envolvemos los datos en un objeto 'datos'
          valor: datos.valor,
          descripcion: datos.descripcion,
          fecha: datos.fecha,
        }
      });
      toast.success("Calificación actualizada con éxito");
      await cargarCalificaciones(); // Recargar calificaciones
    } catch (e) {
      console.error("Error al actualizar calificación:", e);
      setError("Error al actualizar calificación.");
      toast.error("Error al actualizar calificación.");
    } finally {
      setIsLoading(false);
    }
  };

  const removerCalificacion = async (idCalificacion: Id<"calificaciones">) => {
    setIsLoading(true);
    try {
      await eliminarCalificacion({ id: idCalificacion });
      toast.success("Calificación eliminada con éxito");
      await cargarCalificaciones(); // Recargar calificaciones
    } catch (e) {
      console.error("Error al eliminar calificación:", e);
      setError("Error al eliminar calificación.");
      toast.error("Error al eliminar calificación.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    calificaciones: memoizedCalificaciones,
    isLoading,
    error,
    cargarCalificaciones, // Exponer para recarga manual si es necesario
    agregarCalificacion,
    modificarCalificacion,
    removerCalificacion,
  };
};