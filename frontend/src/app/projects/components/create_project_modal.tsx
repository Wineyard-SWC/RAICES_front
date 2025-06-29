"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { X, Search, Plus, User } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import type { User as UserType } from "@/hooks/useUsers";
import { useProjectUsers } from "@/contexts/ProjectusersContext"
import AvatarProfileIcon from "@/components/Avatar/AvatarDisplay"
import { useCreateProjectUsers } from "@/hooks/useCreateProjectUsers";
import { print, printError } from "@/utils/debugLogger";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectData: any) => Promise<string | null>;
}

const CreateProjectModal = ({
  isOpen,
  onClose,
  onCreateProject,
}: CreateProjectModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");
  const [priority, setPriority] = useState("Medium");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { users, loading, searchUsers } = useUsers();
  const { getAllUsers, getAllUsersFromCache } = useProjectUsers();
  const { createProjectUsers, loading: creatingRelations } =
    useCreateProjectUsers();

  // Cargar todos los usuarios al montar el componente
  useEffect(() => {
    const loadUsers = async () => {
      await getAllUsers();
    };
    loadUsers();
  }, [getAllUsers]);

  // Inicializar fechas con valores por defecto
  useEffect(() => {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);

    setStartDate(today.toISOString().split("T")[0]);
    setEndDate(nextMonth.toISOString().split("T")[0]);
  }, []);

  // Manejar búsqueda de usuarios
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      searchUsers(value);
    },
    [searchUsers]
  );

  // Función para enriquecer usuarios con datos de avatar
  const getEnrichedUsers = (searchedUsers: UserType[]) => {
    const cachedUsers = getAllUsersFromCache();
    
    return searchedUsers.map(user => {
      // Buscar usuario en caché para obtener datos adicionales
      const cachedUser = cachedUsers.find(u => u.id === user.id);
      
      return {
        ...user,
        photoURL: cachedUser?.avatarUrl || user.photoURL || null
      };
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim())
      newErrors.description = "Description is required";
    if (!startDate) newErrors.startDate = "Start date is required";
    if (!endDate) newErrors.endDate = "End date is required";

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddUser = (user: UserType) => {
    if (!selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchTerm("");
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
  };

  const generateInvitationCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const projectData = {
        title,
        description,
        status,
        priority,
        startDate,
        endDate,
        invitationCode: generateInvitationCode(),
        progress: 0,
        tasksCompleted: 0,
        totalTasks: 0,
        team: title.substring(0, 3).toUpperCase() + "-TEAM",
        teamSize: selectedUsers.length + 1, // +1 para incluir al creador
        members: selectedUsers.map((user) => user.id),
      };

      // print("[CREATE PROJECT MODAL] Project data to create:", projectData);

      // Llamar a onCreateProject y obtener el projectId
      const projectId = await onCreateProject(projectData);

      if (projectId) {
        // print("[CREATE PROJECT MODAL] Project created with ID:", projectId);

        // Crear relaciones con los usuarios seleccionados
        const usersWithRoles = selectedUsers.map((user) => ({
          id: user.id,
          role: "Developer", // Ajusta el rol según sea necesario
        }));

        // print("[CREATE PROJECT MODAL] Users to create relations for:", usersWithRoles);

        const success = await createProjectUsers(projectId, usersWithRoles);

        if (!success) {
          printError("Failed to create project-user relations");
        } else {
          print("All project-user relations created successfully.");
        }
      } else {
        printError("Failed to create project or get projectId.");
      }

      // Resetear el formulario
      setTitle("");
      setDescription("");
      setStatus("Active");
      setPriority("Medium");
      setSelectedUsers([]);
      onClose();
    } catch (error) {
      printError("[CREATE PROJECT MODAL] Error creating project:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-[#ebe5eb]">
          <h2 className="text-xl font-semibold text-[#4a2b4a]">
            Create New Project
          </h2>
          <button onClick={onClose} className="text-[#694969] hover:text-[#4a2b4a]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#4a2b4a] mb-1">
                Project Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full p-2 border ${
                  errors.title ? "border-red-500" : "border-[#ebe5eb]"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a2b4a]`}
                placeholder="Enter the project title"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#4a2b4a] mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full p-2 border ${
                  errors.description ? "border-red-500" : "border-[#ebe5eb]"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a2b4a] min-h-[100px]`}
                placeholder="Describe the project"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4a2b4a] mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 border border-[#ebe5eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a2b4a]"
              >
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4a2b4a] mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2 border border-[#ebe5eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a2b4a]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4a2b4a] mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full p-2 border ${
                  errors.startDate ? "border-red-500" : "border-[#ebe5eb]"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a2b4a]`}
              />
              {errors.startDate && (
                <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4a2b4a] mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full p-2 border ${
                  errors.endDate ? "border-red-500" : "border-[#ebe5eb]"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a2b4a]`}
              />
              {errors.endDate && (
                <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#4a2b4a] mb-1">
                Invite Members
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full p-2 pl-10 border border-[#ebe5eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a2b4a]"
                  placeholder="Search users by name or email"
                />
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#694969]"
                  size={16}
                />
              </div>

              {/* Search results */}
              {searchTerm.length >= 2 && (
                <div className="mt-2 border border-[#ebe5eb] rounded-md max-h-[200px] overflow-y-auto">
                  {loading ? (
                    <div className="p-3 text-center text-[#694969]">Searching users...</div>
                  ) : users.length > 0 ? (
                    <ul>
                      {getEnrichedUsers(users).filter(user => !selectedUsers.some(u => u.id === user.id)).map((user) => (
                        <li
                          key={user.id}
                          className="p-2 hover:bg-[#ebe5eb] cursor-pointer flex items-center"
                          onClick={() => handleAddUser(user)}
                        >
                          <div className="h-8 w-8 rounded-full bg-[#ebe5eb] overflow-hidden mr-3">
                            {user.photoURL ? (
                              <AvatarProfileIcon 
                                avatarUrl={user.photoURL} 
                                size={32} 
                                borderWidth={2}
                                borderColor="#4a2b4a"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-[#4a2b4a] text-white">
                                {user?.name?.charAt(0).toUpperCase() || <User size={16} />}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-[#4a2b4a] font-medium">{user.name}</p>
                            <p className="text-xs text-[#694969]">{user.email}</p>
                          </div>
                          <Plus size={16} className="ml-auto text-[#4a2b4a]" />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-3 text-center text-[#694969]">No users found</div>
                  )}
                </div>
              )}

              {/* Selected members */}
              {selectedUsers.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-[#4a2b4a] mb-2">
                    Selected Members
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center bg-[#ebe5eb] rounded-full pl-2 pr-1 py-1"
                      >
                        <div className="h-8 w-8 rounded-full bg-[#ebe5eb] overflow-hidden mr-3">
                          {user.photoURL ? (
                            <AvatarProfileIcon 
                              avatarUrl={user.photoURL} 
                              size={32} 
                              borderWidth={2}
                              borderColor="#4a2b4a"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-[#4a2b4a] text-white">
                              {user?.name?.charAt(0).toUpperCase() || <User size={16} />}
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-[#4a2b4a]">
                          {user.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveUser(user.id)}
                          className="ml-1 p-1 rounded-full hover:bg-[#d1c6d1]"
                        >
                          <X size={14} className="text-[#694969]" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#ebe5eb] rounded-md text-[#694969] hover:bg-[#ebe5eb]"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#4a2b4a] text-white rounded-md hover:bg-[#694969] disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
