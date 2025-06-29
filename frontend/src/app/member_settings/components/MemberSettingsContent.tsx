"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/NavBar"
import MembersTabWrapper from "./MembersTabWrapper"
import { useRouter } from "next/navigation"
import { useUserRoles } from "@/contexts/userRolesContext"
import { useProjectUsers } from "@/contexts/ProjectusersContext"
import { print, printError } from "@/utils/debugLogger"

// Componente cliente que contiene toda la lógica de la página
export default function MemberSettingsContent() {
  const router = useRouter();
  const { loadUsersIfNeeded, isLoading: usersLoading } = useProjectUsers();
  const { fetchUserRoles, isLoading: rolesLoading } = useUserRoles();
  const [isLoading, setIsLoading] = useState(true);
  
  // Verificar si hay un proyecto seleccionado y cargar datos necesarios
  useEffect(() => {
    print("Efecto principal ejecutándose");
    const currentProjectId = localStorage.getItem("currentProjectId");
    
    if (!currentProjectId) {
      print("No hay proyecto seleccionado, redirigiendo...");
      router.push("/projects");
      return;
    }
    
    print("Proyecto ID encontrado:", currentProjectId);
    
    const loadData = async () => {
      try {
        print("Iniciando carga de datos");
        
        // Cargar roles de usuario
        print("Cargando roles de usuario...");
        await fetchUserRoles();
        print("Roles cargados exitosamente");
        
        // Cargar usuarios del proyecto
        print("Cargando usuarios del proyecto...");
        await loadUsersIfNeeded(currentProjectId);
        print("Usuarios cargados exitosamente");
        
        setIsLoading(false);
      } catch (error) {
        printError("Error cargando datos:", error);
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Limpieza al desmontar el componente
    return () => {
      print("Componente desmontado");
    };
  }, [router]); // No incluimos las funciones para evitar re-renderizados
  
  // Función para manejar el botón de regreso
  const handleGoBack = () => {
    router.back();
  };
  
  return (
    <div className="min-h-screen bg-[#ebe5eb]/30">
      <Navbar projectSelected={true} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#1e1e1e]">Member Settings</h1>
            <p className="mt-2 text-[#694969]">Manage project members and their roles</p>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleGoBack}
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-[#4a2b4a]" />
            <h2 className="text-2xl font-semibold text-[#4a2b4a]">Project Members</h2>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-[#4a2b4a] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <MembersTabWrapper />
          )}
        </div>
      </div>
    </div>
  );
}