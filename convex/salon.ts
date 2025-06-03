// convex/salones.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Tipos para salones
export type Salon = {
  numero: number;
  edificio: string;
  planta: string;
};

// CREATE - Crear un nuevo salón
export const crearSalon = mutation({
  args: {
    numero: v.string(),
    edificio: v.string(),
    planta: v.string(),
  },
  handler: async (ctx, args) => {
    const salonId = await ctx.db.insert("salones", {
      numero: args.numero,
      edificio: args.edificio,
      planta: args.planta,
    });
    return salonId;
  },
});

// READ - Obtener todos los salones
export const obtenerSalones = query({
  handler: async (ctx) => {
    return await ctx.db.query("salones").collect();
  },
});

// READ - Obtener un salón por ID
export const obtenerSalonPorId = query({
  args: { id: v.id("salones") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// READ - Buscar salones por edificio
export const buscarSalonesPorEdificio = query({
  args: { edificio: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("salones")
      .filter((q) => q.eq(q.field("edificio"), args.edificio))
      .collect();
  },
});

// UPDATE - Actualizar un salón
export const actualizarSalon = mutation({
  args: {
    id: v.id("salones"),
    datos: v.object({
      numero: v.optional(v.string()),
      edificio: v.optional(v.string()),
      planta: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { id, datos } = args;
    await ctx.db.patch(id, datos);
    return id;
  },
});

// DELETE - Eliminar un salón
export const eliminarSalon = mutation({
  args: { id: v.id("salones") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});