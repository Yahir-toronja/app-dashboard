// convex/functions/user.ts
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Nueva mutación para guardar usuario (llamada desde la API Route de Next.js)
export const saveUser = mutation({
  args: {
    clerkUserId: v.string(), // Se renombra a clerkUserId para mayor claridad
    nombre: v.string(),
    correo: v.string(),
    rol: v.string(), // Se incluye el rol
  },
  handler: async (ctx, { clerkUserId, nombre, correo, rol }) => {
    // Aquí no hay validación de unicidad de correo porque la API Route se encarga de eso con Clerk.
    // Asumimos que si llega aquí, ya pasó las validaciones previas.
    const userId = await ctx.db.insert("usuarios", {
      clerkId: clerkUserId,
      nombre: nombre,
      correo: correo,
      estado: "activo", // Por defecto, activo al crearse
      fechaCreacion: Date.now(),
      rol: rol, // Guarda el rol
    });
    return { userId };
  },
});

// Mutación para actualizar usuario (llamada desde la API Route de Next.js)
export const updateUser = mutation({
  args: {
    id: v.id("usuarios"), // El ID de Convex para el documento de usuario
    nombre: v.optional(v.string()),
    correo: v.optional(v.string()),
    estado: v.optional(v.union(v.literal("activo"), v.literal("bloqueado"))),
    rol: v.optional(v.string()), // Permite actualizar el rol
  },
  handler: async (ctx, { id, ...updates }) => {
    await ctx.db.patch(id, updates);
  },
});

// Mutación para eliminar usuario (llamada desde la API Route de Next.js)
export const deleteUser = mutation({
  args: {
    id: v.id("usuarios"), // El ID de Convex para el documento de usuario
  },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// Query para obtener un usuario por Clerk ID (sigue siendo útil para la API Route y la página de admin)
export const getUsuarioPorClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("usuarios")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    return user;
  },
});

// Query para obtener un usuario por correo (útil para validaciones previas si se mantiene alguna en Convex)
export const getUsuarioPorCorreo = query({
  args: { correo: v.string() },
  handler: async (ctx, { correo }) => {
    return await ctx.db
      .query("usuarios")
      .withIndex("by_correo", (q) => q.eq("correo", correo))
      .first();
  },
});

// Query para consultar usuarios (se mantiene igual para la página de admin)
export const getUsuarios = query({
  args: {
    estado: v.optional(v.union(v.literal("activo"), v.literal("bloqueado"))),
    busqueda: v.optional(v.string()),
  },
  handler: async (ctx, { estado, busqueda }) => {
    let usersQuery = ctx.db.query("usuarios");

    if (estado) {
      usersQuery = usersQuery.filter((q) => q.eq(q.field("estado"), estado));
    }

    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      usersQuery = usersQuery.filter((q) =>
        q.or(
          q.eq(q.field("nombre"), searchLower),
          q.eq(q.field("correo"), searchLower)
        )
      );
    }
    const usuarios = await usersQuery.order("desc").collect();
    return usuarios;
  },
});