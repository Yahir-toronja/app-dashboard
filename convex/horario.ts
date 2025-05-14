// convex/horarios.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Tipos para horarios
export type Horario = {
  columnas: string;
};

// CREATE - Crear un nuevo horario
export const crearHorario = mutation({
  args: {
    columnas: v.string(),
  },
  handler: async (ctx, args) => {
    const horarioId = await ctx.db.insert("horario", {
      columnas: args.columnas,
    });
    return horarioId;
  },
});

// READ - Obtener todos los horarios
export const obtenerHorarios = query({
  handler: async (ctx) => {
    return await ctx.db.query("horario").collect();
  },
});

// READ - Obtener un horario por ID
export const obtenerHorarioPorId = query({
  args: { id: v.id("horario") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// UPDATE - Actualizar un horario
export const actualizarHorario = mutation({
  args: {
    id: v.id("horario"),
    columnas: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { columnas: args.columnas });
    return args.id;
  },
});

// DELETE - Eliminar un horario
export const eliminarHorario = mutation({
  args: { id: v.id("horario") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});