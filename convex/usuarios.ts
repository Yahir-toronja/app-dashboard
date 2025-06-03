// Importamos los módulos necesarios
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { ConvexError } from 'convex/values';
import { defineTable } from 'convex/server';
import { Doc, Id } from './_generated/dataModel';

// La tabla de usuarios ahora se define en schema.ts
// Aquí solo usamos la definición importada

// CREATE - Crear un nuevo usuario
export const createUsuario = mutation({
  // Definimos los argumentos que se deben pasar a la función
  args: {
    clerkId: v.string(),
    nombre: v.string(),
    correo: v.string(),
    rol: v.string(),
  },
  // La función para crear un usuario
  handler: async (ctx, args) => {
    // Verificamos si ya existe un usuario con el mismo correo o clerkId
    const existingUserByEmail = await ctx.db
      .query("usuarios")
      .filter((q) => q.eq(q.field('correo'), args.correo))
      .first();
    
    const existingUserById = await ctx.db
      .query("usuarios")
      .filter((q) => q.eq(q.field('clerkId'), args.clerkId))
      .first();
      
    if (existingUserByEmail) {
      throw new ConvexError('Ya existe un usuario con este correo');
    }
    
    if (existingUserById) {
      throw new ConvexError('Ya existe un usuario con este ID de Clerk');
    }
    
    // Insertamos el nuevo usuario en la base de datos
    const id = await ctx.db.insert("usuarios", {
      clerkId: args.clerkId,
      nombre: args.nombre,
      correo: args.correo,
      rol: args.rol,
      estado: "activo", // Por defecto, el usuario está activo
      fechaCreacion: Date.now(), // Añadimos la fecha de creación
    });
    
    return {
      id,
      clerkId: args.clerkId,
      nombre: args.nombre,
      correo: args.correo,
      rol: args.rol,
      estado: "activo",
      fechaCreacion: Date.now(),
    };
  }
});

// READ - Obtener todos los usuarios
export const getAllUsuarios = query({
  handler: async (ctx) => {
    // Obtenemos todos los usuarios de la base de datos
    const allUsers = await ctx.db.query("usuarios").collect();
    return allUsers;
  }
});

// READ - Obtener un usuario por su ID
export const getUsuarioById = query({
  args: { id: v.id("usuarios") },
  handler: async (ctx, args) => {
    // Obtenemos el usuario por su ID
    const user = await ctx.db.get(args.id);
    
    if (!user) {
      throw new ConvexError('Usuario no encontrado');
    }
    
    return user;
  }
});

// READ - Obtener un usuario por su correo
export const getUsuarioByEmail = query({
  args: { correo: v.string() },
  handler: async (ctx, args) => {
    // Buscamos el usuario por su correo
    const user = await ctx.db
      .query("usuarios")
      .filter((q) => q.eq(q.field('correo'), args.correo))
      .first();
    
    if (!user) {
      throw new ConvexError('Usuario no encontrado');
    }
    
    return user;
  }
});

// READ - Obtener un usuario por su ID de Clerk
export const getUsuarioByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    // Buscamos el usuario por su id de Clerk
    const user = await ctx.db
      .query("usuarios")
      .filter((q) => q.eq(q.field('clerkId'), args.clerkId))
      .first();
    
    if (!user) {
      throw new ConvexError('Usuario no encontrado');
    }
    
    return user;
  }
});

// UPDATE - Actualizar un usuario
export const updateUsuario = mutation({
  args: {
    id: v.id("usuarios"),
    nombre: v.optional(v.string()),
    correo: v.optional(v.string()),
    rol: v.optional(v.string()),
    estado: v.optional(v.union(v.literal("activo"), v.literal("bloqueado"))),
    fechaCreacion: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verificamos que el usuario exista
    const existingUser = await ctx.db.get(args.id);
    
    if (!existingUser) {
      throw new ConvexError('Usuario no encontrado');
    }
    
    // Si se actualiza el correo, verificamos que no exista otro usuario con ese correo
    if (args.correo && args.correo !== existingUser.correo) {
      const userWithEmail = await ctx.db
        .query("usuarios")
        .filter((q) => q.eq(q.field('correo'), args.correo))
        .first();
        
      if (userWithEmail) {
        throw new ConvexError('Ya existe un usuario con este correo');
      }
    }
    
    // Creamos un objeto con los campos a actualizar
    const fieldsToUpdate: Partial<typeof existingUser> = {};
    
    if (args.nombre !== undefined) fieldsToUpdate.nombre = args.nombre;
    if (args.correo !== undefined) fieldsToUpdate.correo = args.correo;
    if (args.rol !== undefined) fieldsToUpdate.rol = args.rol;
    if (args.estado !== undefined) fieldsToUpdate.estado = args.estado;
    if (args.fechaCreacion !== undefined) fieldsToUpdate.fechaCreacion = args.fechaCreacion;
    
    // Actualizamos el usuario
    await ctx.db.patch(args.id, fieldsToUpdate);
    
    return {
      success: true,
      updatedId: args.id,
    };
  }
});

// DELETE - Eliminar un usuario
export const deleteUsuario = mutation({
  args: { id: v.id("usuarios") },
  handler: async (ctx, args) => {
    // Verificamos que el usuario exista
    const existingUser = await ctx.db.get(args.id);
    
    if (!existingUser) {
      throw new ConvexError('Usuario no encontrado');
    }
    
    // Eliminamos el usuario
    await ctx.db.delete(args.id);
    
    return {
      success: true,
      deletedId: args.id,
    };
  }
});