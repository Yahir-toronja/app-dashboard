// convex/calificaciones.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Tipos para calificaciones
export type Calificacion = {
  valor: number;
  estudiante_id: string;
  descripcion: string;
};

// CREATE - Crear una nueva calificación
export const crearCalificacion = mutation({
  args: {
    valor: v.number(),
    estudiante_id: v.id("estudiantes"),
    descripcion: v.string(),
  },
  handler: async (ctx, args) => {
    // Validar que la calificación esté entre 5 y 10
    if (args.valor < 5 || args.valor > 10) {
      throw new Error("La calificación debe estar entre 5 y 10");
    }
    
    const calificacionId = await ctx.db.insert("calificaciones", {
      valor: args.valor,
      estudiante_id: args.estudiante_id,
      descripcion: args.descripcion,
    });
    return calificacionId;
  },
});

// READ - Obtener todas las calificaciones
export const obtenerCalificaciones = query({
  handler: async (ctx) => {
    return await ctx.db.query("calificaciones").collect();
  },
});

// READ - Obtener calificaciones por ID de estudiante
export const obtenerCalificacionesPorEstudiante = query({
  args: { estudiante_id: v.id("estudiantes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("calificaciones")
      .filter((q) => q.eq(q.field("estudiante_id"), args.estudiante_id))
      .collect();
  },
});

// UPDATE - Actualizar una calificación
export const actualizarCalificacion = mutation({
  args: {
    id: v.id("calificaciones"),
    datos: v.object({
      valor: v.optional(v.number()),
      descripcion: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { id, datos } = args;
    
    // Validar que la calificación esté entre 5 y 10 si se está actualizando
    if (datos.valor !== undefined && (datos.valor < 5 || datos.valor > 10)) {
      throw new Error("La calificación debe estar entre 5 y 10");
    }
    
    await ctx.db.patch(id, datos);
    return id;
  },
});

// DELETE - Eliminar una calificación
export const eliminarCalificacion = mutation({
  args: { id: v.id("calificaciones") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});