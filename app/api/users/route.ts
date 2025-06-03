// app/api/users/route.ts
"use server";

import { NextResponse } from "next/server";
import { createClerkClient } from "@clerk/backend";
import { Resend } from "resend";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
const resend = new Resend(process.env.RESEND_API_KEY!);

interface ClerkError {
  code: string;
  message: string;
  longMessage?: string;
}

interface ErrorWithClerkErrors {
  errors: ClerkError[];
  message?: string;
  status?: number;
}

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
  subject: "¡Bienvenido a nuestra plataforma! Tus credenciales de acceso",
  html: `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenido a nuestra plataforma</title>
      <style>
        /* Estilos base */
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          background-color: #f5f7fa;
          color: #333;
        }
        
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .header {
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          padding: 30px 20px;
          text-align: center;
        }
        
        .logo {
          max-width: 180px;
          margin: 0 auto 15px;
          display: block;
        }
        
        h1 {
          color: white;
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        
        .content {
          padding: 30px;
        }
        
        .welcome-gif {
          width: 100%;
          max-width: 400px;
          height: auto;
          display: block;
          margin: 0 auto 25px;
          border-radius: 8px;
        }
        
        .credentials-box {
          background-color: #f8f9ff;
          border-left: 4px solid #2575fc;
          padding: 15px 20px;
          margin: 25px 0;
          border-radius: 0 6px 6px 0;
        }
        
        .credentials-box p {
          margin: 8px 0;
        }
        
        .highlight {
          background-color: #e6f0ff;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 600;
          display: inline-block;
        }
        
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          color: white !important;
          text-decoration: none;
          padding: 14px 30px;
          border-radius: 50px;
          font-weight: 600;
          margin: 25px 0;
          text-align: center;
          box-shadow: 0 4px 15px rgba(37, 117, 252, 0.3);
          transition: all 0.3s ease;
        }
        
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(37, 117, 252, 0.4);
        }
        
        .footer {
          text-align: center;
          padding: 25px 20px;
          background-color: #f5f7fa;
          color: #6c757d;
          font-size: 14px;
        }
        
        .social-icons {
          margin: 15px 0;
        }
        
        .social-icons a {
          display: inline-block;
          margin: 0 8px;
        }
        
        @media (max-width: 480px) {
          .content {
            padding: 20px;
          }
          
          .header {
            padding: 20px 15px;
          }
          
          h1 {
            font-size: 24px;
          }
          
          .btn {
            display: block;
            margin: 20px auto;
            width: 90%;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>¡Bienvenido, ${nombre}!</h1>
        </div>
        
        <div class="content">
          <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDg1aGJmY3V4a3d2YzBmOWp5bWQ5dXJ1c2N3dHl0dHl0c3J4b2VnMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l378zKVk7Eh3yHoJi/giphy.gif" 
               alt="Bienvenida animada" class="welcome-gif">
          
          <p>Gracias por registrarte en nuestra plataforma. Estamos encantados de tenerte con nosotros.</p>
          
          <div class="credentials-box">
            <p><strong>Tus credenciales de acceso:</strong></p>
            <p><strong>Correo:</strong> <span class="highlight">${correo}</span></p>
            <p><strong>Contraseña temporal:</strong> <span class="highlight">${password}</span></p>
          </div>
          
          <p>Por favor, usa esta contraseña para iniciar sesión y te recomendamos cambiarla en tu perfil por seguridad.</p>
          
          <p>Haz clic en el siguiente botón para acceder a la plataforma:</p>
          
          <a href="${loginUrl}" class="btn">Iniciar Sesión</a>
          
          <p>Si tienes problemas con el botón, copia y pega esta URL en tu navegador:</p>
          <p><a href="${loginUrl}" style="word-break: break-all;">${loginUrl}</a></p>
          
          <p>¡Esperamos que disfrutes de nuestra plataforma!</p>
        </div>
        
        <div class="footer">
          <p>¿Necesitas ayuda? Contáctanos en <a href="mailto:soporte@tuempresa.com">soporte@tuempresa.com</a></p>
          <div class="social-icons">
            <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" width="24"></a>
            <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" width="24"></a>
            <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" width="24"></a>
          </div>
          <p>© ${new Date().getFullYear()} Tu Empresa. Todos los derechos reservados.</p>
          <p><small>Este es un correo automático, por favor no respondas a este mensaje.</small></p>
        </div>
      </div>
    </body>
    </html>
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
      console.error("Clerk errors:", (error as ErrorWithClerkErrors).errors);
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