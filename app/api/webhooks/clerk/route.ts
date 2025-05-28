// app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export async function POST(req: Request) {
  // Obtener la firma del encabezado
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // Si falta algún encabezado necesario, devolver un error
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: encabezados de webhook faltantes", {
      status: 400,
    });
  }

  // Obtener el cuerpo de la solicitud
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Crear una nueva instancia de Webhook con el secreto de Clerk
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let evt: WebhookEvent;

  // Verificar la firma del webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error al verificar webhook:", err);
    return new Response("Error al verificar webhook", {
      status: 400,
    });
  }

  // Extraer el tipo y los datos del evento
  const { type, data } = evt;

  // Manejar diferentes tipos de eventos
  switch (type) {
    case "user.created":
      // Cuando se crea un usuario en Clerk, guardarlo en Convex
      try {
        // Extraer los datos necesarios del usuario
        const clerkUserId = data.id;
        const nombre = data.first_name || "";
        const correo = data.email_addresses?.[0]?.email_address || "";
        const password = ""; // No tenemos acceso a la contraseña desde el webhook
        const rol = "user"; // Rol por defecto

        // Verificar si el usuario ya existe en Convex
        const existingUser = await fetchQuery(api.functions.user.getUsuarioPorClerkId, {
          clerkId: clerkUserId,
        });

        if (existingUser) {
          console.log(`Usuario con clerkId ${clerkUserId} ya existe en Convex.`);
          return NextResponse.json({
            success: true,
            message: "Usuario ya existe en Convex",
          });
        }

        // Guardar el usuario en Convex con estado activo y timestamps
        await fetchMutation(api.functions.user.saveUser, {
          clerkUserId,
          nombre,
          correo,
          password,
          rol,
          // Los valores por defecto (estado, fechaCreacion, fechaActualizacion) se manejan en la mutación
        });

        console.log(`Usuario ${clerkUserId} guardado en Convex.`);
        return NextResponse.json({
          success: true,
          message: "Usuario guardado en Convex",
        });
      } catch (error) {
        console.error("Error al guardar usuario en Convex:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Error al guardar usuario en Convex",
          },
          { status: 500 }
        );
      }

    case "user.updated":
      // Cuando se actualiza un usuario en Clerk, actualizar en Convex
      try {
        // Extraer los datos necesarios del usuario
        const clerkUserId = data.id;
        const nombre = data.first_name || '';
        const correo = data.email_addresses?.[0]?.email_address || '';
        
        // Verificar si el usuario está bloqueado en Clerk
        const isBlocked = data.public_metadata && typeof data.public_metadata === 'object' && 'blocked' in data.public_metadata ? 
          data.public_metadata.blocked === true : false;
        
        // Obtener el usuario de Convex por su clerkId
        const existingUser = await fetchQuery(api.functions.user.getUsuarioPorClerkId, {
          clerkId: clerkUserId,
        });

        if (!existingUser) {
          console.log(`Usuario con clerkId ${clerkUserId} no encontrado en Convex.`);
          return NextResponse.json(
            {
              success: false,
              error: "Usuario no encontrado en Convex",
            },
            { status: 404 }
          );
        }

        // Preparar las actualizaciones
        const updates: { nombre?: string; correo?: string; estado?: string } = {};
        if (nombre !== undefined && nombre !== '' && nombre !== existingUser.nombre) {
          updates.nombre = nombre;
        }
        if (correo !== undefined && correo !== '' && correo !== existingUser.correo) {
          updates.correo = correo;
        }
        
        // Actualizar estado si cambió
        if (isBlocked !== undefined) {
          const nuevoEstado = isBlocked ? "bloqueado" : "activo";
          if (nuevoEstado !== existingUser.estado) {
            updates.estado = nuevoEstado;
          }
        }

        // Si hay actualizaciones, aplicarlas
        if (Object.keys(updates).length > 0) {
          await fetchMutation(api.functions.user.updateUser, {
            id: existingUser._id as Id<"usuarios">,
            ...updates,
          });

          console.log(`Usuario ${clerkUserId} actualizado en Convex.`);
        } else {
          console.log(`No hay cambios para el usuario ${clerkUserId}.`);
        }

        return NextResponse.json({
          success: true,
          message: "Usuario actualizado en Convex",
        });
      } catch (error) {
        console.error("Error al actualizar usuario en Convex:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Error al actualizar usuario en Convex",
          },
          { status: 500 }
        );
      }

    case "user.deleted":
      // Cuando se elimina un usuario en Clerk, eliminarlo de Convex
      try {
        // Extraer el ID del usuario
        const clerkUserId = data.id;
        
        if (!clerkUserId) {
          console.log('ID de usuario de Clerk no encontrado en el evento');
          return NextResponse.json({
            success: false,
            message: "ID de usuario de Clerk no encontrado",
          });
        }

        // Obtener el usuario de Convex por su clerkId
        const existingUser = await fetchQuery(api.functions.user.getUsuarioPorClerkId, {
          clerkId: clerkUserId,
        });

        if (!existingUser) {
          console.log(`Usuario con clerkId ${clerkUserId} no encontrado en Convex.`);
          return NextResponse.json({
            success: true,
            message: "Usuario no encontrado en Convex",
          });
        }

        // Eliminar el usuario de Convex
        await fetchMutation(api.functions.user.deleteUser, {
          id: existingUser._id as Id<"usuarios">,
        });

        console.log(`Usuario ${clerkUserId} eliminado de Convex.`);
        return NextResponse.json({
          success: true,
          message: "Usuario eliminado de Convex",
        });
      } catch (error) {
        console.error("Error al eliminar usuario en Convex:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Error al eliminar usuario en Convex",
          },
          { status: 500 }
        );
      }

    default:
      // Para otros tipos de eventos, simplemente devolver una respuesta exitosa
      return NextResponse.json({
        success: true,
        message: `Evento ${type} recibido pero no procesado específicamente`,
      });
  }
}