// Importamos los módulos necesarios
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { ConvexError } from 'convex/values';
import { defineTable } from 'convex/server';
import { Doc, Id } from './_generated/dataModel';

// Definimos la tabla de usuarios directamente en este archivo
export const usuarios = defineTable({
  id_clerk: v.string(),
  nombre: v.string(),
  email: v.string(),
  rol: v.string(),
  password: v.string(),
});

// CREATE - Crear un nuevo usuario
export const createUsuario = mutation({
  // Definimos los argumentos que se deben pasar a la función
  args: {
    id_clerk: v.string(),
    nombre: v.string(),
    email: v.string(),
    rol: v.string(),
    password: v.string(),
  },
  // La función para crear un usuario
  handler: async (ctx, args) => {
    // Verificamos si ya existe un usuario con el mismo email o id_clerk
    const existingUserByEmail = await ctx.db
      .query("usuarios")
      .filter((q) => q.eq(q.field('email'), args.email))
      .first();
    
    const existingUserById = await ctx.db
      .query("usuarios")
      .filter((q) => q.eq(q.field('id_clerk'), args.id_clerk))
      .first();
      
    if (existingUserByEmail) {
      throw new ConvexError('Ya existe un usuario con este email');
    }
    
    if (existingUserById) {
      throw new ConvexError('Ya existe un usuario con este ID de Clerk');
    }
    
    // Insertamos el nuevo usuario en la base de datos
    const id = await ctx.db.insert("usuarios", {
      id_clerk: args.id_clerk,
      nombre: args.nombre,
      email: args.email,
      rol: args.rol,
      password: args.password, // Nota: En producción, asegúrate de nunca almacenar contraseñas en texto plano
    });
    
    return {
      id,
      ...args,
    };
  },
});

// READ - Obtener todos los usuarios
export const getAllUsuarios = query({
  handler: async (ctx) => {
    // Obtenemos todos los usuarios de la base de datos
    const allUsers = await ctx.db.query("usuarios").collect();
    return allUsers;
  },
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
  },
});

// READ - Buscar usuario por email
export const getUsuarioByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // Buscamos el usuario por su email
    const user = await ctx.db
      .query("usuarios")
      .filter((q) => q.eq(q.field('email'), args.email))
      .first();
    
    if (!user) {
      throw new ConvexError('Usuario no encontrado');
    }
    
    return user;
  },
});

// READ - Buscar usuario por id_clerk
export const getUsuarioByClerkId = query({
  args: { id_clerk: v.string() },
  handler: async (ctx, args) => {
    // Buscamos el usuario por su id de Clerk
    const user = await ctx.db
      .query("usuarios")
      .filter((q) => q.eq(q.field('id_clerk'), args.id_clerk))
      .first();
    
    if (!user) {
      throw new ConvexError('Usuario no encontrado');
    }
    
    return user;
  },
});

// UPDATE - Actualizar un usuario
export const updateUsuario = mutation({
  args: {
    id: v.id("usuarios"),
    nombre: v.optional(v.string()),
    email: v.optional(v.string()),
    rol: v.optional(v.string()),
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verificamos que el usuario exista
    const existingUser = await ctx.db.get(args.id);
    
    if (!existingUser) {
      throw new ConvexError('Usuario no encontrado');
    }
    
    // Si se actualiza el email, verificamos que no exista otro usuario con ese email
    if (args.email && args.email !== existingUser.email) {
      const userWithEmail = await ctx.db
        .query("usuarios")
        .filter((q) => q.eq(q.field('email'), args.email))
        .first();
        
      if (userWithEmail) {
        throw new ConvexError('Ya existe un usuario con este email');
      }
    }
    
    // Creamos un objeto con los campos a actualizar
    const fieldsToUpdate: Partial<typeof existingUser> = {};
    
    if (args.nombre !== undefined) fieldsToUpdate.nombre = args.nombre;
    if (args.email !== undefined) fieldsToUpdate.email = args.email;
    if (args.rol !== undefined) fieldsToUpdate.rol = args.rol;
    if (args.password !== undefined) fieldsToUpdate.password = args.password;
    
    // Actualizamos el usuario
    await ctx.db.patch(args.id, fieldsToUpdate);
    
    // Devolvemos el usuario actualizado
    return {
      ...existingUser,
      ...fieldsToUpdate,
    };
  },
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
  },
});