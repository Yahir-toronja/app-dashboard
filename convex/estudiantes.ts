// convex/estudiantes.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Tipos para estudiantes
export type Estudiante = {
  matricula: string;
  nombre: string;
  correo: string;
};

// CREATE - Crear un nuevo estudiante
export const crearEstudiante = mutation({
  args: {
    matricula: v.string(),
    nombre: v.string(),
    correo: v.string(),
  },
  handler: async (ctx, args) => {
    const estudianteId = await ctx.db.insert("estudiantes", {
      matricula: args.matricula,
      nombre: args.nombre,
      correo: args.correo,
    });
    return estudianteId;
  },
});

// READ - Obtener todos los estudiantes
export const obtenerEstudiantes = query({
  handler: async (ctx) => {
    return await ctx.db.query("estudiantes").collect();
  },
});

// READ - Obtener un estudiante por ID
export const obtenerEstudiantePorId = query({
  args: { id: v.id("estudiantes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// READ - Buscar estudiantes por matrícula
export const buscarEstudiantesPorMatricula = query({
  args: { matricula: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("estudiantes")
      .filter((q) => q.eq(q.field("matricula"), args.matricula))
      .collect();
  },
});

// UPDATE - Actualizar un estudiante
export const actualizarEstudiante = mutation({
  args: {
    id: v.id("estudiantes"),
    datos: v.object({
      matricula: v.optional(v.string()),
      nombre: v.optional(v.string()),
      correo: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { id, datos } = args;
    await ctx.db.patch(id, datos);
    return id;
  },
});

// DELETE - Eliminar un estudiante
export const eliminarEstudiante = mutation({
  args: { id: v.id("estudiantes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});