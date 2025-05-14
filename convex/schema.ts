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
export const calificaciones = defineTable(
    v.object({
        valor: v.number(),
        estudiante_id: v.id("estudiantes"),
        descripcion: v.string(),
    })
);

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

export default defineSchema({
    estudiantes,
    maestros,
    materia,
    salones,
    horario,
    calificaciones,
})