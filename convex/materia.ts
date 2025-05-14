// convex/materias.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Tipos para materias
export type Materia = {
  id_m: string;
  nombre: string;
};

// CREATE - Crear una nueva materia
export const crearMateria = mutation({
  args: {
    id_m: v.string(),
    nombre: v.string(),
  },
  handler: async (ctx, args) => {
    const materiaId = await ctx.db.insert("materia", {
      id_m: args.id_m,
      nombre: args.nombre,
    });
    return materiaId;
  },
});

// READ - Obtener todas las materias
export const obtenerMaterias = query({
  handler: async (ctx) => {
    return await ctx.db.query("materia").collect();
  },
});

// READ - Obtener una materia por ID
export const obtenerMateriaPorId = query({
  args: { id: v.id("materia") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// UPDATE - Actualizar una materia
export const actualizarMateria = mutation({
  args: {
    id: v.id("materia"),
    datos: v.object({
      id_m: v.optional(v.string()),
      nombre: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { id, datos } = args;
    await ctx.db.patch(id, datos);
    return id;
  },
});

// DELETE - Eliminar una materia
export const eliminarMateria = mutation({
  args: { id: v.id("materia") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});