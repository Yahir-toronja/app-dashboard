// app/api/users/route.ts
"use server";

import { NextResponse } from "next/server";
import { createClerkClient } from "@clerk/backend";
import { Resend } from "resend";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: Request) {
  try {
    // AHORA RECIBIMOS LA CONTRASEÑA DIRECTAMENTE DEL FRONTEND
    const { nombre, correo, rol, password } = await request.json();

    // Validaciones básicas de la contraseña (opcional, pero buena práctica)
    if (!password || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "La contraseña debe tener al menos 8 caracteres." },
        { status: 400 }
      );
    }

    // 1. Validar unicidad del correo en Clerk antes de crear
    const existingClerkUsers = await clerk.users.getUserList({
      emailAddress: [correo],
    });

    if (existingClerkUsers.data.length > 0) {
      return NextResponse.json(
        { success: false, error: "El correo ya existe en Clerk." },
        { status: 409 }
      );
    }

    // 2. Crear usuario en Clerk CON LA CONTRASEÑA PROPORCIONADA
    const clerkUser = await clerk.users.createUser({
      firstName: nombre,
      emailAddress: [correo],
      password: password, // <-- USAMOS LA CONTRASEÑA DEL ADMINISTRADOR AQUÍ
      skipPasswordRequirement: false,
      skipPasswordChecks: false,
    });

    // 3. Almacenar en Convex
    const convexResult = await fetchMutation(api.functions.user.saveUser, {
      clerkUserId: clerkUser.id,
      nombre,
      correo,
      rol,
    });

    // 4. Enviar correo con Resend CON LA CONTRASEÑA Y UN ENLACE DE INICIO DE SESIÓN
    // o un enlace a una página donde puedan cambiarla (si eligen hacerlo).
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    // El enlace ya no es para "reset-password" de Clerk, sino una página de inicio de sesión o un dashboard.
    // Opcionalmente, podrías apuntar a una página personalizada como /initial-setup donde el usuario podría cambiar la contraseña.
    const loginUrl = `${baseUrl}/sign-in`; // Página de inicio de sesión estándar de Clerk
    // const changePasswordUrl = `${baseUrl}/change-password`; // Una página personalizada para cambiarla si quieres.

    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: correo,
      subject: "¡Bienvenido! Tus credenciales de acceso a la plataforma",
      html: `
        <h1>Hola, ${nombre}!</h1>
        <p>Gracias por registrarte en nuestra plataforma.</p>
        <p>Tus credenciales de acceso son:</p>
        <p><strong>Correo:</strong> ${correo}</p>
        <p><strong>Contraseña temporal:</strong> <code>${password}</code></p>
        <p>Por favor, usa esta contraseña para iniciar sesión y te recomendamos cambiarla en tu perfil por seguridad.</p>
        <p>Haz clic aquí para iniciar sesión:</p>
        <a href="${loginUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
          Iniciar Sesión
        </a>
        <p>Si tienes problemas, copia y pega esta URL en tu navegador: <br/> ${loginUrl}</p>
        <p>Atentamente,<br/>El Equipo</p>
      `,
    });

    if (emailError) {
      console.error('Error sending welcome email from API route:', emailError);
      return NextResponse.json(
        {
          success: true,
          clerkUserId: clerkUser.id,
          convexUserId: convexResult.userId,
          message: `Usuario creado, pero hubo un problema al enviar el correo de bienvenida: ${emailError.message}`,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      clerkUserId: clerkUser.id,
      convexUserId: convexResult.userId,
      emailId: emailResult?.id,
      message: "Usuario creado y credenciales enviadas por correo.",
    });

  } catch (error: unknown) {
    console.error("Full error creating user:", error);

    let message = "Error desconocido al crear el usuario.";
    let status = 500;

    if (typeof error === "object" && error !== null) {
      if ("message" in error && typeof (error as { message?: unknown }).message === "string") {
        message = (error as { message: string }).message;
      }
      if ("status" in error && typeof (error as { status?: unknown }).status === "number") {
        status = (error as { status: number }).status;
      }
      if ("errors" in error && Array.isArray((error as { errors?: unknown }).errors)) {
        const clerkErrors = (error as { errors: Array<{ code: string; message: string }> }).errors;
        if (clerkErrors.length > 0) {
          if (clerkErrors[0].code === 'form_identifier_exists') {
            message = 'El correo electrónico ya está en uso por otro usuario en Clerk.';
            status = 409;
          } else {
            message = `Clerk Error: ${clerkErrors[0].message}`;
            status = 400;
          }
        }
      }
    }
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, clerkUserId, nombre, correo, rol, estado } = await request.json(); // Recibe también 'estado' para bloquear/desbloquear

    // Validaciones básicas
    if (!id || !clerkUserId) { // 'id' es el ID de Convex
      return NextResponse.json(
        { error: "Missing required fields (Convex ID or Clerk ID)" },
        { status: 400 }
      );
    }

    // Obtener usuario actual de Clerk para comparar correos
    const currentUser = await clerk.users.getUser(clerkUserId);
    const currentPrimaryEmail = currentUser.emailAddresses.find(
      e => e.id === currentUser.primaryEmailAddressId
    );
    const currentPrimaryEmailAddress = currentPrimaryEmail?.emailAddress;

    const updatesClerk: { firstName?: string; primaryEmailAddressID?: string; } = {};
    const updatesConvex: { nombre?: string; correo?: string; estado?: "activo" | "bloqueado"; rol?: string; } = {};

    let newEmailCreatedId: string | null = null;
    // let newEmailAddressToSet: string | undefined = undefined;

    // 1. Manejar actualización de Nombre
    if (nombre !== undefined && nombre !== currentUser.firstName) {
      updatesClerk.firstName = nombre;
      updatesConvex.nombre = nombre;
    }

    // 2. Manejar actualización de Correo Electrónico (lógica robusta de tu compañero)
    if (correo !== undefined && correo !== currentPrimaryEmailAddress) {
      // Validar formato de correo
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        return NextResponse.json(
          { success: false, error: "Formato de correo electrónico inválido." },
          { status: 400 }
        );
      }

      // Verificar si el nuevo correo ya está en uso por otro usuario en Clerk
      const { data: existingUsersWithNewEmail } = await clerk.users.getUserList({
        emailAddress: [correo],
      });

      if (
        existingUsersWithNewEmail.length > 0 &&
        existingUsersWithNewEmail[0].id !== clerkUserId
      ) {
        return NextResponse.json(
          { success: false, error: "Este correo ya está en uso por otro usuario." },
          { status: 409 }
        );
      }

      // Si el correo ya existe como dirección secundaria del usuario, solo lo hacemos primario
      const existingEmailAddressInClerk = currentUser.emailAddresses?.find(ea => ea.emailAddress === correo);

      if (existingEmailAddressInClerk) {
        // Si ya existe, lo establecemos como primario (y verificado si es necesario)
        await clerk.emailAddresses.updateEmailAddress(existingEmailAddressInClerk.id, {
          verified: true, // Asumimos que el admin lo está actualizando, por lo que puede ser verificado
          primary: true,
        });
        updatesClerk.primaryEmailAddressID = existingEmailAddressInClerk.id;
        newEmailCreatedId = existingEmailAddressInClerk.id; // Para posible rollback
      } else {
        // Si no existe, la creamos
        const newEmailObject = await clerk.emailAddresses.createEmailAddress({
          userId: clerkUserId,
          emailAddress: correo,
        });
        newEmailCreatedId = newEmailObject.id; // Guarda el ID para el caso de fallo
        // newEmailAddressToSet = newEmailObject.emailAddress; // Guarda la dirección

        // Marcar como verificada y primaria inmediatamente (para admin)
        await clerk.emailAddresses.updateEmailAddress(newEmailObject.id, {
          verified: true,
          primary: true,
        });
        updatesClerk.primaryEmailAddressID = newEmailObject.id;
      }

      // Eliminar el correo anterior si es diferente y existía
      if (currentPrimaryEmail && currentPrimaryEmail.id !== newEmailCreatedId) {
        await clerk.emailAddresses.deleteEmailAddress(currentPrimaryEmail.id);
      }

      updatesConvex.correo = correo; // Actualiza el correo en Convex
    }

    // 3. Manejar actualización de Rol
    if (rol !== undefined) {
      updatesConvex.rol = rol;
      // Si usas roles públicos de Clerk, también podrías actualizar aquí:
      // await clerk.users.updateUser(clerkId, { publicMetadata: { role: rol } });
    }

    // 4. Manejar actualización de Estado (Bloquear/Desbloquear) - Solo en Convex si Clerk no maneja "estado" directamente
    if (estado !== undefined) {
        updatesConvex.estado = estado;
        // Si Clerk tiene un campo de "suspendido" o similar, podrías actualizarlo aquí:
        // await clerk.users.updateUser(clerkId, { publicMetadata: { status: estado } });
    }

    // Realizar actualizaciones en Clerk (si hay algo que actualizar)
    if (Object.keys(updatesClerk).length > 0) {
      await clerk.users.updateUser(clerkUserId, updatesClerk);
    }

    // Realizar actualizaciones en Convex (si hay algo que actualizar)
    if (Object.keys(updatesConvex).length > 0) {
      await fetchMutation(api.functions.user.updateUser, {
        id, // El ID de Convex
        ...updatesConvex,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Usuario actualizado exitosamente.",
      // Puedes devolver más detalles si es necesario
    });

  } catch (error: unknown) {
    console.error("Full error updating user:", error);

    let message = "Error desconocido al actualizar el usuario.";
    let status = 500;
    let clerkTraceId = "";

    if (typeof error === "object" && error !== null) {
      if ("message" in error && typeof (error as { message?: unknown }).message === "string") {
        message = (error as { message: string }).message;
      }
      if ("status" in error && typeof (error as { status?: unknown }).status === "number") {
        status = (error as { status: number }).status;
      }
      if ("clerkTraceId" in error && typeof (error as { clerkTraceId?: unknown }).clerkTraceId === "string") {
        clerkTraceId = (error as { clerkTraceId: string }).clerkTraceId;
      }

      if ("errors" in error && Array.isArray((error as { errors?: unknown }).errors)) {
        const clerkErrors = (error as { errors: Array<{ code: string; message: string }> }).errors;
        if (clerkErrors.length > 0) {
          if (clerkErrors[0].code === 'form_identifier_exists') {
            message = 'El nuevo correo electrónico ya está en uso por otro usuario en Clerk.';
            status = 409; // Conflict
          } else {
            message = `Clerk Error: ${clerkErrors[0].message}`;
            status = 400; // Bad Request
          }
        }
      }
    }

    // Rollback para el correo (si se creó un nuevo email en Clerk pero falló algo después)
    // Esto es muy complejo de hacer de forma robusta sin webhooks de Clerk o un sistema de colas.
    // Por ahora, se asume que los errores en Clerk son detectados y manejados inmediatamente.
    // Si la actualización en Convex falla después de Clerk, el estado será inconsistente.

    return NextResponse.json(
      { success: false, error: message, clerkTraceId },
      { status }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { clerkUserId, convexUserId } = await request.json(); // Esperamos ambos IDs

    if (!clerkUserId || !convexUserId) {
        return NextResponse.json({ error: "Missing Clerk ID or Convex ID" }, { status: 400 });
    }

    // 1. Eliminar usuario en Clerk
    await clerk.users.deleteUser(clerkUserId);

    // 2. Eliminar usuario en Convex
    await fetchMutation(api.functions.user.deleteUser, {
      id: convexUserId,
    });

    return NextResponse.json({ success: true, message: "Usuario eliminado correctamente" });
  } catch (error: unknown) {
    console.error("Error eliminando usuario:", error);

    let message = "Error desconocido al eliminar el usuario.";
    let status = 500;

    if (typeof error === "object" && error !== null) {
      if ("message" in error && typeof (error as { message?: unknown }).message === "string") {
        message = (error as { message: string }).message;
      }
      if ("status" in error && typeof (error as { status?: unknown }).status === "number") {
        status = (error as { status: number }).status;
      }
      if ("errors" in error && Array.isArray((error as { errors?: unknown }).errors)) {
        const clerkErrors = (error as { errors: Array<{ code: string; message: string }> }).errors;
        if (clerkErrors.length > 0) {
            message = `Clerk Error: ${clerkErrors[0].message}`;
            status = 400;
        }
      }
    }

    return NextResponse.json({ success: false, error: message }, { status });
  }
}