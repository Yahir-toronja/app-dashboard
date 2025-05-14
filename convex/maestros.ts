// convex/maestros.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Tipos para maestros
export type Maestro = {
  n_empelado: string;
  nombre: string;
  correo: string;
};

// CREATE - Crear un nuevo maestro
export const crearMaestro = mutation({
  args: {
    n_empleado: v.string(),
    nombre: v.string(),
    correo: v.string(),
  },
  handler: async (ctx, args) => {
    const maestroId = await ctx.db.insert("maestros", {
      n_empelado: args.n_empleado,
      nombre: args.nombre,
      correo: args.correo,
    });
    return maestroId;
  },
});

// READ - Obtener todos los maestros
export const obtenerMaestros = query({
  handler: async (ctx) => {
    return await ctx.db.query("maestros").collect();
  },
});

// READ - Obtener un maestro por ID
export const obtenerMaestroPorN = query({
  args: { n_empelado: v.string() },
  handler: async (ctx, args) => {
      return await ctx.db
        .query("maestros")
        .filter((q) => q.eq(q.field("n_empelado"), args.n_empelado))
        .collect();
    },
});



// UPDATE - Actualizar un maestro
export const actualizarMaestro = mutation({
  args: {
    id: v.id("maestros"),
    datos: v.object({
      n_empelado: v.optional(v.string()),
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

// DELETE - Eliminar un maestro
export const eliminarMaestro = mutation({
  args: { id: v.id("maestros") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});