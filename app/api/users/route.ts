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
    const { nombre, correo, rol, password } = await request.json();

    // Validaciones más estrictas
    if (!password || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "La contraseña debe tener al menos 8 caracteres." },
        { status: 400 }
      );
    }

    // Validar formato de email
    if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return NextResponse.json(
        { success: false, error: "Formato de correo electrónico inválido." },
        { status: 400 }
      );
    }

    // Validar que la contraseña tenga al menos una mayúscula, una minúscula y un número
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      return NextResponse.json(
        { success: false, error: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número." },
        { status: 400 }
      );
    }

    // 1. Validar unicidad del correo en Clerk
    const existingClerkUsers = await clerk.users.getUserList({
      emailAddress: [correo],
    });

    if (existingClerkUsers.data.length > 0) {
      return NextResponse.json(
        { success: false, error: "El correo ya existe en Clerk." },
        { status: 409 }
      );
    }

    // 2. Crear usuario en Clerk con formato correcto
    console.log('Intentando crear usuario con:', { nombre, correo, passwordLength: password.length });
    
    // Generar un username único basado en el nombre y un número aleatorio
    const baseUsername = nombre.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    const randomSuffix = Math.floor(Math.random() * 10000);
    const username = `${baseUsername}${randomSuffix}`;
    
    const clerkUser = await clerk.users.createUser({
      firstName: nombre,
      emailAddress: [correo],
      username: username, // Agregar el username requerido
      password: password,
    });

    // 3. Almacenar en Convex
    const convexResult = await fetchMutation(api.functions.user.saveUser, {
      clerkUserId: clerkUser.id,
      nombre,
      correo,
      rol,
    });

    // 4. Enviar correo con Resend
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yahir.korian-labs.net/';
    const loginUrl = `${baseUrl}/sign-in`;

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

    // Logging más detallado del error de Clerk
    if (typeof error === "object" && error !== null && "errors" in error) {
      console.error("Clerk errors:", (error as any).errors);
    }

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
        const clerkErrors = (error as { errors: Array<{ code: string; message: string; longMessage?: string }> }).errors;
        if (clerkErrors.length > 0) {
          console.error("Detailed Clerk error:", clerkErrors[0]);
          if (clerkErrors[0].code === 'form_identifier_exists') {
            message = 'El correo electrónico ya está en uso por otro usuario en Clerk.';
            status = 409;
          } else if (clerkErrors[0].code === 'form_password_pwned') {
            message = 'La contraseña es muy común. Por favor, usa una contraseña más segura.';
            status = 400;
          } else if (clerkErrors[0].code === 'form_password_length_too_short') {
            message = 'La contraseña es muy corta. Debe tener al menos 8 caracteres.';
            status = 400;
          } else if (clerkErrors[0].code === 'form_password_validation_failed') {
            message = 'La contraseña no cumple con los requisitos de seguridad. Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.';
            status = 400;
          } else {
            message = `Error de Clerk: ${clerkErrors[0].longMessage || clerkErrors[0].message}`;
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
    const { id, clerkUserId, nombre, correo, rol, estado } = await request.json();

    // Validaciones básicas
    if (!id || !clerkUserId) {
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

    // 1. Manejar actualización de Nombre
    if (nombre !== undefined && nombre !== currentUser.firstName) {
      updatesClerk.firstName = nombre;
      updatesConvex.nombre = nombre;
    }

    // 2. Manejar actualización de Correo Electrónico
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
        // Si ya existe, lo establecemos como primario
        await clerk.emailAddresses.updateEmailAddress(existingEmailAddressInClerk.id, {
          verified: true,
          primary: true,
        });
        updatesClerk.primaryEmailAddressID = existingEmailAddressInClerk.id;
        newEmailCreatedId = existingEmailAddressInClerk.id;
      } else {
        // Si no existe, la creamos
        const newEmailObject = await clerk.emailAddresses.createEmailAddress({
          userId: clerkUserId,
          emailAddress: correo,
        });
        newEmailCreatedId = newEmailObject.id;

        // Marcar como verificada y primaria inmediatamente
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

      updatesConvex.correo = correo;
    }

    // 3. Manejar actualización de Rol
    if (rol !== undefined) {
      updatesConvex.rol = rol;
    }

    // 4. Manejar actualización de Estado
    if (estado !== undefined) {
      updatesConvex.estado = estado;
    }

    // Realizar actualizaciones en Clerk
    if (Object.keys(updatesClerk).length > 0) {
      await clerk.users.updateUser(clerkUserId, updatesClerk);
    }

    // Realizar actualizaciones en Convex
    if (Object.keys(updatesConvex).length > 0) {
      await fetchMutation(api.functions.user.updateUser, {
        id,
        ...updatesConvex,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Usuario actualizado exitosamente.",
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
            status = 409;
          } else {
            message = `Clerk Error: ${clerkErrors[0].message}`;
            status = 400;
          }
        }
      }
    }

    return NextResponse.json(
      { success: false, error: message, clerkTraceId },
      { status }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { clerkUserId, convexUserId } = await request.json();

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