import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Consulta para obtener todas las calificaciones
export const obtenerCalificaciones = query({
  handler: async (ctx) => {
    // Obtenemos todas las calificaciones
    const calificaciones = await ctx.db.query("calificaciones").collect();
    
    // Para cada calificación, obtenemos los datos relacionados
    const calificacionesConDetalles = await Promise.all(
      calificaciones.map(async (calificacion) => {
        const estudiante = await ctx.db.get(calificacion.estudianteId);
        const materia = await ctx.db.get(calificacion.materiaId);
        
        return {
          ...calificacion,
          estudiante: estudiante ? {
            id: estudiante._id,
            nombre: estudiante.nombre,
            matricula: estudiante.matricula
          } : null,
          materia: materia ? {
            id: materia._id,
            nombre: materia.nombre,
            id_m: materia.id_m
          } : null
        };
      })
    );

    return calificacionesConDetalles;
  },
});

// Consulta para obtener una calificación por ID
export const obtenerCalificacionPorId = query({
  args: { id: v.id("calificaciones") },
  handler: async (ctx, args) => {
    const calificacion = await ctx.db.get(args.id);
    
    if (!calificacion) return null;
    
    // Obtenemos los datos relacionados
    const estudiante = await ctx.db.get(calificacion.estudianteId);
    const materia = await ctx.db.get(calificacion.materiaId);
    
    return {
      ...calificacion,
      estudiante: estudiante ? {
        id: estudiante._id,
        nombre: estudiante.nombre,
        matricula: estudiante.matricula
      } : null,
      materia: materia ? {
        id: materia._id,
        nombre: materia.nombre,
        id_m: materia.id_m
      } : null
    };
  },
});

// Mutación para crear una nueva calificación
export const crearCalificacion = mutation({
  args: {
    estudianteId: v.id("estudiantes"),
    materiaId: v.id("materia"),
    nota: v.number(),
    semestre: v.string(),
  },
  handler: async (ctx, args) => {
    const { estudianteId, materiaId, nota, semestre } = args;
    
    // Opcionalmente, podríamos validar que el estudiante y la materia existen
    const estudiante = await ctx.db.get(estudianteId);
    const materia = await ctx.db.get(materiaId);
    
    if (!estudiante) {
      throw new Error("El estudiante no existe");
    }
    
    if (!materia) {
      throw new Error("La materia no existe");
    }
    
    // Validación de la nota (por ejemplo, entre 0 y 10)
    if (nota < 0 || nota > 10) {
      throw new Error("La nota debe estar entre 0 y 10");
    }
    
    return await ctx.db.insert("calificaciones", {
      estudianteId,
      materiaId,
      nota,
      semestre,
    });
  },
});

// Mutación para actualizar una calificación existente
export const actualizarCalificacion = mutation({
  args: {
    id: v.id("calificaciones"),
    estudianteId: v.id("estudiantes"),
    materiaId: v.id("materia"),
    nota: v.number(),
    semestre: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, estudianteId, materiaId, nota, semestre } = args;
    
    // Validaciones
    const estudiante = await ctx.db.get(estudianteId);
    const materia = await ctx.db.get(materiaId);
    
    if (!estudiante) {
      throw new Error("El estudiante no existe");
    }
    
    if (!materia) {
      throw new Error("La materia no existe");
    }
    
    // Validación de la nota
    if (nota < 0 || nota > 10) {
      throw new Error("La nota debe estar entre 0 y 10");
    }
    
    return await ctx.db.patch(id, {
      estudianteId,
      materiaId,
      nota,
      semestre,
    });
  },
});

// Mutación para eliminar una calificación
export const eliminarCalificacion = mutation({
  args: {
    id: v.id("calificaciones"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Consulta para obtener todos los estudiantes (para selector)
export const obtenerEstudiantes = query({
  handler: async (ctx) => {
    return await ctx.db.query("estudiantes").collect();
  },
});

// Consulta para obtener todas las materia (para selector)
export const obtenerMaterias = query({
  handler: async (ctx) => {
    return await ctx.db.query("materia").collect();
  },
});