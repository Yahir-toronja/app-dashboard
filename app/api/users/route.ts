import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { clerkClient } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { Id } from "@/convex/_generated/dataModel";

// Inicializar Resend para envío de emails
const resend = new Resend(process.env.RESEND_API_KEY);

// Interfaces para tipar mejor el código
interface ClerkError {
  errors?: Array<{
    code: string;
    message: string;
  }>;
  status?: number;
}

interface ConvexUpdates {
  nombre?: string;
  correo?: string;
  password?: string;
  rol?: string;
  estado?: string;
}

// Función para validar formato de email
function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Función para validar contraseña
function isValidPassword(password: string) {
  return password.length >= 8; // Mínimo 8 caracteres
}

// Función para enviar email de bienvenida
async function sendWelcomeEmail(email: string, nombre: string, password: string) {
  try {
    await resend.emails.send({
      from: "noreply@example.com", // Cambiar por dominio propio si está configurado
      to: email,
      subject: "Bienvenido a la plataforma",
      html: `
        <h1>Bienvenido, ${nombre}!</h1>
        <p>Tu cuenta ha sido creada exitosamente.</p>
        <p>Tus credenciales temporales son:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Contraseña:</strong> ${password}</p>
        <p>Te recomendamos cambiar tu contraseña después del primer inicio de sesión.</p>
      `,
    });
    console.log("Email de bienvenida enviado a", email);
    return true;
  } catch (error) {
    console.error("Error al enviar email de bienvenida:", error);
    return false;
  }
}

// POST: Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, correo, rol, password } = body;

    // Validaciones básicas
    if (!nombre || !correo || !rol || !password) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    if (!isValidEmail(correo)) {
      return NextResponse.json(
        { error: "Formato de correo inválido" },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

    // Inicializar cliente de Clerk con await
    const clerk = await clerkClient();

    // Verificar si el correo ya existe en Clerk
    try {
      const existingUsers = await clerk.users.getUserList({
        emailAddress: [correo],
      });

      if (existingUsers.data.length > 0) {
        return NextResponse.json(
          { error: "El correo electrónico ya está registrado" },
          { status: 409 }
        );
      }
    } catch (error) {
      console.error("Error al verificar usuario en Clerk:", error);
      return NextResponse.json(
        { error: "Error al verificar usuario" },
        { status: 500 }
      );
    }

    // Crear usuario en Clerk
    let clerkUser;
    try {
      clerkUser = await clerk.users.createUser({
        emailAddress: [correo],
        password,
        firstName: nombre,
        lastName: "",
      });
    } catch (error) {
      console.error("Error al crear usuario en Clerk:", error);

      // Manejar errores específicos de Clerk
      const clerkError = error as ClerkError;
      if (clerkError.errors && clerkError.errors.length > 0) {
        const specificError = clerkError.errors[0];
        if (specificError.code === "form_identifier_exists") {
          return NextResponse.json(
            { error: "El correo electrónico ya está registrado" },
            { status: 409 }
          );
        }
      }

      return NextResponse.json(
        { error: "Error al crear usuario en Clerk" },
        { status: 500 }
      );
    }

    // Guardar usuario en Convex
    try {
      await fetchMutation(api.functions.user.saveUser, {
        clerkUserId: clerkUser.id,
        nombre,
        correo,
        password, // Guardamos la contraseña para poder incluirla en el email
        rol,
      });
    } catch (error) {
      console.error("Error al guardar usuario en Convex:", error);

      // Intentar eliminar el usuario de Clerk si falla Convex
      try {
        await clerk.users.deleteUser(clerkUser.id);
      } catch (deleteError) {
        console.error(
          "Error al eliminar usuario de Clerk después de fallo en Convex:",
          deleteError
        );
      }

      return NextResponse.json(
        { error: "Error al guardar usuario en la base de datos" },
        { status: 500 }
      );
    }

    // Enviar email de bienvenida
    await sendWelcomeEmail(correo, nombre, password);

    return NextResponse.json(
      { message: "Usuario creado exitosamente", userId: clerkUser.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error general al crear usuario:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}

// PATCH: Actualizar usuario existente
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, clerkId, nombre, correo, rol, password, estado } = body;

    if (!id || !clerkId) {
      return NextResponse.json(
        { error: "Se requiere ID de usuario" },
        { status: 400 }
      );
    }

    // Inicializar cliente de Clerk con await
    const clerk = await clerkClient();

    // Obtener usuario actual de Convex para comparaciones
    const currentUser = await fetchQuery(api.functions.user.getUsuarioPorClerkId, {
      clerkId,
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Preparar actualizaciones para Convex
    const convexUpdates: ConvexUpdates = {};
    
    // Actualizar nombre si se proporciona
    if (nombre !== undefined) {
      convexUpdates.nombre = nombre;
    }

    // Actualizar rol si se proporciona
    if (rol !== undefined) {
      convexUpdates.rol = rol;
    }

    // Actualizar estado si se proporciona (bloqueo/desbloqueo)
    if (estado !== undefined) {
      convexUpdates.estado = estado;
      
      // Si el usuario está bloqueado, también bloquearlo en Clerk
      try {
        if (estado === "bloqueado") {
          await clerk.users.updateUser(clerkId, {
            publicMetadata: { blocked: true },
          });
        } else if (estado === "activo") {
          await clerk.users.updateUser(clerkId, {
            publicMetadata: { blocked: false },
          });
        }
      } catch (error) {
        console.error("Error al actualizar estado en Clerk:", error);
        return NextResponse.json(
          { error: "Error al actualizar estado del usuario en Clerk" },
          { status: 500 }
        );
      }
    }

    // Actualizar correo si se proporciona
    if (correo !== undefined && correo !== currentUser.correo) {
      // Validar formato de correo
      if (!isValidEmail(correo)) {
        return NextResponse.json(
          { error: "Formato de correo inválido" },
          { status: 400 }
        );
      }

      // Verificar si el nuevo correo ya existe en Clerk
      try {
        const existingUsers = await clerk.users.getUserList({
          emailAddress: [correo],
        });

        const userWithSameEmail = existingUsers.data.find(
          (user: { id: string }) => user.id !== clerkId
        );

        if (userWithSameEmail) {
          return NextResponse.json(
            { error: "El correo electrónico ya está registrado" },
            { status: 409 }
          );
        }
      } catch (error) {
        console.error("Error al verificar correo en Clerk:", error);
        return NextResponse.json(
          { error: "Error al verificar correo" },
          { status: 500 }
        );
      }

      // Actualizar correo en Clerk
      try {
        // Crear nueva dirección de correo
        await clerk.emailAddresses.createEmailAddress({
          userId: clerkId,
          emailAddress: correo,
          verified: true,
          primary: true
        });
        
        // Añadir correo a las actualizaciones de Convex
        convexUpdates.correo = correo;
      } catch (error) {
        console.error("Error al actualizar correo en Clerk:", error);
        return NextResponse.json(
          { error: "Error al actualizar correo en Clerk" },
          { status: 500 }
        );
      }
    }

    // Actualizar contraseña si se proporciona
    if (password !== undefined && password.trim() !== "") {
      // Validar contraseña
      if (!isValidPassword(password)) {
        return NextResponse.json(
          { error: "La contraseña debe tener al menos 8 caracteres" },
          { status: 400 }
        );
      }

      // Actualizar contraseña en Clerk
      try {
        await clerk.users.updateUser(clerkId, {
          password,
        });

        // Añadir contraseña a las actualizaciones de Convex
        convexUpdates.password = password;
      } catch (error) {
        console.error("Error al actualizar contraseña en Clerk:", error);
        return NextResponse.json(
          { error: "Error al actualizar contraseña en Clerk" },
          { status: 500 }
        );
      }
    }

    // Aplicar actualizaciones en Convex si hay cambios
    if (Object.keys(convexUpdates).length > 0) {
      try {
        await fetchMutation(api.functions.user.updateUser, {
          id: id as Id<"usuarios">,
          ...convexUpdates,
        });
      } catch (error) {
        console.error("Error al actualizar usuario en Convex:", error);
        return NextResponse.json(
          { error: "Error al actualizar usuario en la base de datos" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { message: "Usuario actualizado exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error general al actualizar usuario:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar usuario
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const clerkId = searchParams.get("clerkId");

    if (!id || !clerkId) {
      return NextResponse.json(
        { error: "Se requieren ID de usuario" },
        { status: 400 }
      );
    }

    // Inicializar cliente de Clerk con await
    const clerk = await clerkClient();

    // Eliminar usuario de Clerk
    try {
      await clerk.users.deleteUser(clerkId);
    } catch (error) {
      // Si el error es que el usuario no existe en Clerk, continuamos con la eliminación en Convex
      const clerkError = error as ClerkError;
      if (clerkError.status !== 404) {
        console.error("Error al eliminar usuario de Clerk:", error);
        return NextResponse.json(
          { error: "Error al eliminar usuario de Clerk" },
          { status: 500 }
        );
      }
    }

    // Eliminar usuario de Convex
    try {
      await fetchMutation(api.functions.user.deleteUser, {
        id: id as Id<"usuarios">,
      });
    } catch (error) {
      console.error("Error al eliminar usuario de Convex:", error);
      return NextResponse.json(
        { error: "Error al eliminar usuario de la base de datos" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Usuario eliminado exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error general al eliminar usuario:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}