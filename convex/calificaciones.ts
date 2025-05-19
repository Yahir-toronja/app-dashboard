// convex/calificaciones.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Tipos para calificaciones
export type Calificacion = {
  nota: number;
  estudianteId: string;
  materiaId: string;
  semestre: string;
};

// CREATE - Crear una nueva calificación
export const crearCalificacion = mutation({
  args: {
    nota: v.number(),
    estudianteId: v.id("estudiantes"),
    materiaId: v.id("materia"),
    semestre: v.string(),
  }, 
  handler: async (ctx, args) => {
    // Validar que la calificación esté entre 5 y 10
    if (args.nota < 5 || args.nota > 10) {
      throw new Error("La calificación debe estar entre 5 y 10");
    }
    
    const calificacionId = await ctx.db.insert("calificaciones", {
      nota: args.nota,
      estudianteId: args.estudianteId,
      materiaId: args.materiaId,
      semestre: args.semestre,
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
      .filter((q) => q.eq(q.field("estudianteId"), args.estudiante_id))
      .collect();
  },
});

// UPDATE - Actualizar una calificación
export const actualizarCalificacion = mutation({
  args: {
    id: v.id("calificaciones"),
    datos: v.object({
      nota: v.optional(v.number()),
      materiaId: v.optional(v.id("materia")),
      semestre: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { id, datos } = args;
    
    // Validar que la calificación esté entre 5 y 10 si se está actualizando
    if (datos.nota !== undefined && (datos.nota < 5 || datos.nota > 10)) {
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