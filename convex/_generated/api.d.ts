/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as calificaciones from "../calificaciones.js";
import type * as estudiantes from "../estudiantes.js";
import type * as horario from "../horario.js";
import type * as maestros from "../maestros.js";
import type * as materia from "../materia.js";
import type * as salon from "../salon.js";
import type * as usuarios from "../usuarios.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  calificaciones: typeof calificaciones;
  estudiantes: typeof estudiantes;
  horario: typeof horario;
  maestros: typeof maestros;
  materia: typeof materia;
  salon: typeof salon;
  usuarios: typeof usuarios;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
