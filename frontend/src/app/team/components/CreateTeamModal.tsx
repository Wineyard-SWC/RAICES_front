"use client";

import { useState, useEffect } from "react";
import { useTeams } from "@/contexts/teamscontext";
import { X, Search, Plus, User } from "lucide-react";
import { useSearchUsersProject } from "@/hooks/useSearchUsersProject";
import type { User as UserType } from "@/hooks/useUsers";
import { useProjectUsers } from "@/contexts/ProjectusersContext"
import AvatarProfileIcon from "@/components/Avatar/AvatarDisplay"
import { printError } from "@/utils/debugLogger";


interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ 
  isOpen, 
  onClose, 
  projectId 
}) => {
  const { createTeam } = useTeams();
  const { users, loading, searchUsers } = useSearchUsersProject();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentProjectId, setCurrentProjectId] = useState<string>("");
  const { loadUsersIfNeeded, getUsersForProject } = useProjectUsers();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Obtener el ID del proyecto actual
  useEffect(() => {
    const storedProjectId = localStorage.getItem("currentProjectId");
    if (storedProjectId) {
      setCurrentProjectId(storedProjectId);
      // Cargar usuarios del proyecto
      loadUsersIfNeeded(storedProjectId);
    }
  }, [loadUsersIfNeeded]);
  
  // Obtener la lista de miembros del proyecto
  const projectMembers = getUsersForProject(currentProjectId);

  // Crea una función para combinar los usuarios buscados con los datos del proyecto
  const getEnrichedUsers = (searchedUsers: UserType[]) => {
    // console.log('--- getEnrichedUsers ---');
    // console.log('Project Members:', projectMembers);
    // console.log('Searched Users:', searchedUsers);
    
    return searchedUsers.map(user => {
      const projectMember = projectMembers.find(member => member.userRef === user.id);
      const enrichedUser = {
        ...user,
        photoURL: projectMember?.avatarUrl || user.photoURL,
      };
      
      // console.log(`User ${user.id} (${user.name}) - Merged data:`, {
      //   originalPhoto: user.photoURL,
      //   projectAvatar: projectMember?.avatarUrl,
      //   finalPhoto: enrichedUser.photoURL
      // });
      
      return enrichedUser;
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    searchUsers(value, projectId);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Team name is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (selectedUsers.length === 0) newErrors.members = "At least one member is required";
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await createTeam(
        { 
          name, 
          description, 
          projectId 
        }, 
        selectedUsers.map(user => user.id)
      );
      onClose();
      setName("");
      setDescription("");
      setSelectedUsers([]);
    } catch (err) {
      printError("Error creating team:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-[#ebe5eb]">
          <h2 className="text-xl font-semibold text-[#4a2b4a]">Create New Team</h2>
          <button onClick={onClose} className="text-[#694969] hover:text-[#4a2b4a]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#4a2b4a] mb-1">
                Team Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full p-2 border ${
                  errors.name ? "border-red-500" : "border-[#ebe5eb]"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a2b4a]`}
                placeholder="Enter the team name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4a2b4a] mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full p-2 border ${
                  errors.description ? "border-red-500" : "border-[#ebe5eb]"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a2b4a] min-h-[100px]`}
                placeholder="Describe the team's purpose"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4a2b4a] mb-1">
                Team Members
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
                    <div className="p-3 text-center text-[#694969]">
                      Searching users...
                    </div>
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
                    <div className="p-3 text-center text-[#694969]">
                      No users found
                    </div>
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
              {errors.members && (
                <p className="text-red-500 text-xs mt-1">{errors.members}</p>
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
              {isSubmitting ? "Creating..." : "Create Team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};