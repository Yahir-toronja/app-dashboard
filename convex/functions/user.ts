// convex/functions/user.ts
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Nueva mutación para guardar usuario (llamada desde la API Route de Next.js o webhook)
export const saveUser = mutation({
  args: {
    clerkUserId: v.string(), // Se renombra a clerkUserId para mayor claridad
    nombre: v.string(),
    correo: v.string(),
    password: v.optional(v.string()), // Contraseña opcional (puede no estar disponible en webhook)
    rol: v.string(), // Se incluye el rol
  },
  handler: async (ctx, { clerkUserId, nombre, correo, password, rol }) => {
    // Aquí no hay validación de unicidad de correo porque la API Route se encarga de eso con Clerk.
    // Asumimos que si llega aquí, ya pasó las validaciones previas.
    const userId = await ctx.db.insert("usuarios", {
      clerkId: clerkUserId,
      nombre: nombre,
      correo: correo,
      password: password || "", // Valor por defecto si no se proporciona
      rol: rol,
      estado: "activo", // Por defecto, el usuario está activo
      fechaCreacion: Date.now(),
      fechaActualizacion: Date.now(),
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
    password: v.optional(v.string()), // Permite actualizar la contraseña
    rol: v.optional(v.string()), // Permite actualizar el rol
    estado: v.optional(v.string()), // Permite actualizar el estado
  },
  handler: async (ctx, { id, ...updates }) => {
    // Verificar que el usuario existe
    const user = await ctx.db.get(id);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Añadir timestamp de actualización
    const updatesWithTimestamp = {
      ...updates,
      fechaActualizacion: Date.now(),
    };

    await ctx.db.patch(id, updatesWithTimestamp);
    return { success: true, id };
  },
});

// Mutación para bloquear/desbloquear usuario
export const toggleUserStatus = mutation({
  args: {
    id: v.id("usuarios"), // El ID de Convex para el documento de usuario
    estado: v.string(), // "activo" o "bloqueado"
  },
  handler: async (ctx, { id, estado }) => {
    // Verificar que el usuario existe
    const user = await ctx.db.get(id);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Actualizar el estado y el timestamp
    await ctx.db.patch(id, {
      estado,
      fechaActualizacion: Date.now(),
    });

    return { success: true, id, estado };
  },
});

// Mutación para eliminar usuario (llamada desde la API Route de Next.js)
export const deleteUser = mutation({
  args: {
    id: v.id("usuarios"), // El ID de Convex para el documento de usuario
  },
  handler: async (ctx, { id }) => {
    // Verificar que el usuario existe
    const user = await ctx.db.get(id);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    await ctx.db.delete(id);
    return { success: true, id };
  },
});

// Query para obtener un usuario por Clerk ID
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

// Query para obtener un usuario por correo
export const getUsuarioPorCorreo = query({
  args: { correo: v.string() },
  handler: async (ctx, { correo }) => {
    return await ctx.db
      .query("usuarios")
      .withIndex("by_correo", (q) => q.eq("correo", correo))
      .first();
  },
});

// Query para consultar usuarios con filtros
export const getUsuarios = query({
  args: {
    busqueda: v.optional(v.string()),
    estado: v.optional(v.string()), // Filtro por estado
  },
  handler: async (ctx, { busqueda, estado }) => {
    let usuarios = await ctx.db.query("usuarios").collect();
    
    // Filtrar por estado si se proporciona
    if (estado) {
      usuarios = usuarios.filter(usuario => usuario.estado === estado);
    }
    
    // Filtrar por búsqueda si se proporciona
    if (busqueda && busqueda.trim() !== "") {
      const searchLower = busqueda.toLowerCase();
      usuarios = usuarios.filter(usuario => {
        const nombreLower = usuario.nombre.toLowerCase();
        const correoLower = usuario.correo.toLowerCase();
        return nombreLower.includes(searchLower) || correoLower.includes(searchLower);
      });
    }
    
    return usuarios;
  },
});

// Query para verificar usuarios huérfanos (en Convex pero no en Clerk)
export const getOrphanedUsers = query({
  args: {
    clerkUserIds: v.array(v.string()), // Lista de IDs de usuarios de Clerk
  },
  handler: async (ctx, { clerkUserIds }) => {
    // Obtener todos los usuarios de Convex
    const convexUsers = await ctx.db.query("usuarios").collect();
    
    // Filtrar los usuarios que no están en la lista de Clerk
    const orphanedUsers = convexUsers.filter(
      user => !clerkUserIds.includes(user.clerkId)
    );
    
    return orphanedUsers;
  },
});