import { defineTable,defineSchema } from "convex/server";
import {v} from "convex/values";


//define la tabla de alumnos
export const estudiantes = defineTable(
    v.object({
        matricula: v.string(),
        nombre: v.string(),
        correo: v.string(),
    })
);

// define la tabla de calificaciones con relación a estudiantes
export const calificaciones = defineTable({
    estudianteId: v.id("estudiantes"), // Referencia al ID del estudiante
    materiaId: v.id("materia"),       // Referencia al ID de la materia
    nota: v.number(),                  // La calificación (valor numérico)
    semestre: v.string(),              // Semestre (ej: "2025-1")
  })


export const maestros = defineTable(
    v.object({
        n_empelado: v.string(),
        nombre: v.string(),
        correo: v.string(),
    })
);

export const materia = defineTable(
    v.object({
        id_m: v.string(),
        nombre: v.string()
    })
);


export const salones = defineTable(
    v.object({
        numero: v.number(),
        edificio: v.string(),
        planta: v.string()
    })
);

export const horario = defineTable(
    v.object({
        columnas: v.string(),
    })
);

export const usuarios = defineTable({
    clerkId: v.string(), // ID de usuario de Clerk
    nombre: v.string(),
    correo: v.string(),
    password: v.string(), // Contraseña del usuario
    rol: v.string(), // Nuevo campo para el rol del usuario (ej: "admin", "user", etc.)
})
    .index("by_clerkId", ["clerkId"]) // Índice para buscar por Clerk ID
    .index("by_correo", ["correo"]); 


export default defineSchema({
    estudiantes,
    maestros,
    materia,
    salones,
    horario,
    calificaciones,
    usuarios,
})