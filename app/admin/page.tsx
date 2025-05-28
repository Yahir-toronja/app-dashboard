"use client";

import { useState, useEffect } from "react";
import { useConvexAuth } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, Plus, Pencil, Trash, Lock, Unlock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Definir tipos para el usuario basado en la estructura real de Convex
interface Usuario {
  _id: Id<"usuarios">;
  _creationTime: number;
  clerkId: string;
  nombre: string;
  correo: string;
  rol: string;
  password: string;
  estado?: string;
  fechaCreacion?: number;
  fechaActualizacion?: number;
}

export default function AdminPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  // Estados para la creación de usuario
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("user");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para la edición de usuario
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editUserId, setEditUserId] = useState<Id<"usuarios"> | null>(null);
  const [editUserClerkId, setEditUserClerkId] = useState("");
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserRole, setEditUserRole] = useState("");
  const [editUserPassword, setEditUserPassword] = useState("");

  // Estado para la búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<Usuario[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Obtener usuarios desde Convex
  const users = useQuery(api.functions.user.getUsuarios, {
    busqueda: "",
    estado: statusFilter || undefined,
  });

  // Filtrar usuarios según el término de búsqueda
  useEffect(() => {
    if (users) {
      if (searchTerm.trim() === "") {
        setFilteredUsers(users);
      } else {
        const filtered = users.filter(
          (user) =>
            user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.correo.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(filtered);
      }
    }
  }, [users, searchTerm]);

  // Redireccionar si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/sign-in");
    }
  }, [isAuthenticated, isLoading, router]);

  // Función para crear un nuevo usuario
  const handleCreateUser = async () => {
    if (!newUserName || !newUserEmail || !newUserPassword || !newUserRole) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: newUserName,
          correo: newUserEmail,
          password: newUserPassword,
          rol: newUserRole,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Usuario creado exitosamente");
        setIsCreatingUser(false);
        setNewUserName("");
        setNewUserEmail("");
        setNewUserPassword("");
        setNewUserRole("user");
      } else {
        toast.error(`Error: ${data.error || "No se pudo crear el usuario"}`);
      }
    } catch (error) {
      console.error("Error al crear usuario:", error);
      toast.error("Error al crear usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para abrir el diálogo de edición
  const handleEditUserClick = (user: Usuario) => {
    setEditUserId(user._id);
    setEditUserClerkId(user.clerkId);
    setEditUserName(user.nombre);
    setEditUserEmail(user.correo);
    setEditUserRole(user.rol);
    setEditUserPassword(""); // Resetear contraseña
    setIsEditingUser(true);
  };

  // Función para guardar los cambios de un usuario
  const handleSaveEditedUser = async () => {
    if (!editUserId || !editUserName || !editUserEmail || !editUserRole) {
      toast.error("Nombre, correo y rol son obligatorios");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editUserId,
          clerkId: editUserClerkId,
          nombre: editUserName,
          correo: editUserEmail,
          rol: editUserRole,
          password: editUserPassword || undefined, // Solo enviar si se proporcionó
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Usuario actualizado exitosamente");
        setIsEditingUser(false);
      } else {
        toast.error(`Error: ${data.error || "No se pudo actualizar el usuario"}`);
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      toast.error("Error al actualizar usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para eliminar un usuario
  const handleDeleteUser = async (userId: Id<"usuarios">, clerkId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      return;
    }

    try {
      const response = await fetch(`/api/users?id=${userId}&clerkId=${clerkId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Usuario eliminado exitosamente");
      } else {
        toast.error(`Error: ${data.error || "No se pudo eliminar el usuario"}`);
      }
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      toast.error("Error al eliminar usuario");
    }
  };

  // Función para bloquear/desbloquear un usuario
  const handleToggleUserStatus = async (userId: Id<"usuarios">, clerkId: string, currentStatus: string) => {
    const newStatus = currentStatus === "activo" ? "bloqueado" : "activo";
    const actionText = newStatus === "bloqueado" ? "bloquear" : "desbloquear";
    
    if (!confirm(`¿Estás seguro de que deseas ${actionText} este usuario?`)) {
      return;
    }

    try {
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: userId,
          clerkId: clerkId,
          estado: newStatus,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Usuario ${newStatus === "bloqueado" ? "bloqueado" : "desbloqueado"} exitosamente`);
      } else {
        toast.error(`Error: ${data.error || `No se pudo ${actionText} el usuario`}`);
      }
    } catch (error) {
      console.error(`Error al ${actionText} usuario:`, error);
      toast.error(`Error al ${actionText} usuario`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Administración de Usuarios</h1>

      {/* Sección de búsqueda y filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nombre o correo..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter || ""}
          onValueChange={(value) => setStatusFilter(value || null)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="activo">Activos</SelectItem>
            <SelectItem value="bloqueado">Bloqueados</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => setIsCreatingUser(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Nuevo Usuario
        </Button>
      </div>

      {/* Tabla de usuarios */}
      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="py-3 px-4 text-left font-medium">Nombre</th>
              <th className="py-3 px-4 text-left font-medium">Correo</th>
              <th className="py-3 px-4 text-left font-medium">Rol</th>
              <th className="py-3 px-4 text-left font-medium">Estado</th>
              <th className="py-3 px-4 text-left font-medium">Fecha Creación</th>
              <th className="py-3 px-4 text-center font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers && filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user._id} className="border-t hover:bg-muted/50">
                  <td className="py-3 px-4">{user.nombre}</td>
                  <td className="py-3 px-4">{user.correo}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline">{user.rol}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={user.estado === "activo" ? "success" : "destructive"}
                      className="capitalize"
                    >
                      {user.estado || "activo"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    {user.fechaCreacion
                      ? format(new Date(user.fechaCreacion), "dd/MM/yyyy HH:mm", {
                          locale: es,
                        })
                      : "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditUserClick(user)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleUserStatus(user._id, user.clerkId, user.estado || "activo")}
                        title={user.estado === "bloqueado" ? "Desbloquear" : "Bloquear"}
                      >
                        {user.estado === "bloqueado" ? (
                          <Unlock className="h-4 w-4 text-green-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-amber-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUser(user._id, user.clerkId)}
                        title="Eliminar"
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-6 text-center text-muted-foreground">
                  {users && users.length === 0
                    ? "No hay usuarios registrados"
                    : "No se encontraron resultados"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Diálogo para crear usuario */}
      <Dialog open={isCreatingUser} onOpenChange={setIsCreatingUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nombre
              </label>
              <Input
                id="name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Nombre completo"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Correo Electrónico
              </label>
              <Input
                id="email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Rol
              </label>
              <Select
                value={newUserRole}
                onValueChange={(value) => setNewUserRole(value)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="user">Usuario</SelectItem>
                  <SelectItem value="teacher">Maestro</SelectItem>
                  <SelectItem value="student">Estudiante</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreatingUser(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Usuario"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar usuario */}
      <Dialog open={isEditingUser} onOpenChange={setIsEditingUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">
                Nombre
              </label>
              <Input
                id="edit-name"
                value={editUserName}
                onChange={(e) => setEditUserName(e.target.value)}
                placeholder="Nombre completo"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-email" className="text-sm font-medium">
                Correo Electrónico
              </label>
              <Input
                id="edit-email"
                type="email"
                value={editUserEmail}
                onChange={(e) => setEditUserEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-password" className="text-sm font-medium">
                Contraseña (dejar en blanco para no cambiar)
              </label>
              <Input
                id="edit-password"
                type="password"
                value={editUserPassword}
                onChange={(e) => setEditUserPassword(e.target.value)}
                placeholder="Nueva contraseña (opcional)"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-role" className="text-sm font-medium">
                Rol
              </label>
              <Select
                value={editUserRole}
                onValueChange={(value) => setEditUserRole(value)}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="user">Usuario</SelectItem>
                  <SelectItem value="teacher">Maestro</SelectItem>
                  <SelectItem value="student">Estudiante</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditingUser(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveEditedUser} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}