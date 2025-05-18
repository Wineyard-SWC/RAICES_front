"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"


import {
  User,
  Mail,
  Lock,
  Save,
  ChevronLeft,
  Shield,
  Users,
  Plus,
  Trash2,
  Edit,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/card"
import { Label } from "./components/ui/label"

import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
 } from "./components/ui/dialog"

import { Badge } from "./components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Navbar from "@/components/NavBar"

// Permission definitions
const permissions = [
  {
    id: 0,
    code: "PROJECT_ADMIN",
    description: "Delete or edit project general configuration",
    bit: 1 << 0,
  },
  {
    id: 1,
    code: "MEMBER_MANAGE",
    description: "Invite/remove members and edit their roles",
    bit: 1 << 1,
  },
  {
    id: 2,
    code: "REQ_MANAGE",
    description: "Create/edit/delete Epics, User Stories and tasks (generated or manual)",
    bit: 1 << 2,
  },
  {
    id: 3,
    code: "SPRINT_PLAN",
    description: "Define what goes into each sprint and assign members",
    bit: 1 << 3,
  },
  {
    id: 4,
    code: "MEETING_MANAGE",
    description: "Schedule and conduct meetings",
    bit: 1 << 4,
  },
  {
    id: 5,
    code: "ITEM_REVIEW",
    description: "Reject/accept items or bugs (includes moving to review)",
    bit: 1 << 5,
  },
  {
    id: 6,
    code: "FORCE_DONE",
    description: "Move an item directly to 'Done' without going through review",
    bit: 1 << 6,
  },
  {
    id: 7,
    code: "ROADMAP_EDIT",
    description: "Order or reconfigure the roadmap",
    bit: 1 << 7,
  },
  {
    id: 8,
    code: "TEAM_MANAGE",
    description: "Create/edit/delete teams within the project",
    bit: 1 << 8,
  },
  {
    id: 9,
    code: "BIOMETRIC_SESSION",
    description: "Start and manage sessions with biometric devices",
    bit: 1 << 9,
  },
]

// Predefined roles
const predefinedRoles = [
  {
    id: "owner",
    name: "Owner",
    description: "Full access to all project functions",
    bitmask: 0b1111111111, // All permissions
    isDefault: true,
  },
  {
    id: "admin",
    name: "Admin",
    description: "General project administration without the ability to delete it",
    bitmask: 0b0111111110, // As specified
    isDefault: true,
  },
  {
    id: "developer",
    name: "Developer",
    description: "Task development and sprint management",
    bitmask: 0b0000100100, // As specified
    isDefault: true,
  },
]

// Team members (example data)
const teamMembers = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "owner",
  },
  {
    id: 2,
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "admin",
  },
  {
    id: 3,
    name: "Emma Wilson",
    email: "emma.wilson@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "developer",
  },
  {
    id: 4,
    name: "John Smith",
    email: "john.smith@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "developer",
  },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [roles, setRoles] = useState([...predefinedRoles])
  const [newRoleName, setNewRoleName] = useState("")
  const [newRoleDescription, setNewRoleDescription] = useState("")
  const [newRolePermissions, setNewRolePermissions] = useState(0)
  const [isNewRoleDialogOpen, setIsNewRoleDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<string | null>(null)
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({})

  // User profile data (simulated)
  const [profile, setProfile] = useState({
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    avatar: "/placeholder.svg?height=200&width=200",
  })

  // Function to toggle role expansion
  const toggleRoleExpansion = (roleId: string) => {
    setExpandedRoles((prev) => ({
      ...prev,
      [roleId]: !prev[roleId],
    }))
  }

  // Function to handle permission changes for a new role
  const handlePermissionChange = (permissionBit: number, checked: boolean) => {
    if (checked) {
      setNewRolePermissions(newRolePermissions | permissionBit)
    } else {
      setNewRolePermissions(newRolePermissions & ~permissionBit)
    }
  }

  // Function to create a new role
  const handleCreateRole = () => {
    if (!newRoleName.trim()) return

    const newRole = {
      id: `role-${Date.now()}`,
      name: newRoleName,
      description: newRoleDescription,
      bitmask: newRolePermissions,
      isDefault: false,
    }

    setRoles([...roles, newRole])
    setNewRoleName("")
    setNewRoleDescription("")
    setNewRolePermissions(0)
    setIsNewRoleDialogOpen(false)
  }

  // Function to delete a role
  const handleDeleteRole = (roleId: string) => {
    setRoles(roles.filter((role) => role.id !== roleId))
  }

  // Function to edit an existing role
  const handleEditRole = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId)
    if (role) {
      setNewRoleName(role.name)
      setNewRoleDescription(role.description)
      setNewRolePermissions(role.bitmask)
      setEditingRole(roleId)
      setIsNewRoleDialogOpen(true)
    }
  }

  // Function to save an edited role
  const handleSaveEditedRole = () => {
    if (!editingRole || !newRoleName.trim()) return

    const updatedRoles = roles.map((role) => {
      if (role.id === editingRole) {
        return {
          ...role,
          name: newRoleName,
          description: newRoleDescription,
          bitmask: newRolePermissions,
        }
      }
      return role
    })

    setRoles(updatedRoles)
    setNewRoleName("")
    setNewRoleDescription("")
    setNewRolePermissions(0)
    setEditingRole(null)
    setIsNewRoleDialogOpen(false)
  }

  // Function to format bitmask as binary
  const formatBitmask = (bitmask: number) => {
    return `0b${bitmask.toString(2).padStart(10, "0")}`
  }

  // Check if a permission is active in a bitmask
  const hasPermission = (bitmask: number, permissionBit: number) => {
    return (bitmask & permissionBit) === permissionBit
  }

  return (
    <div className="min-h-screen bg-[#ebe5eb]/30">
      <Navbar projectSelected={true} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#1e1e1e]">Settings</h1>
            <p className="mt-2 text-[#694969]">Manage your profile and project roles</p>
          </div>
          <Link href="/" passHref>
            <Button variant="outline" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="text-[#4a2b4a]">
              <User className="mr-2 h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="roles" className="text-[#4a2b4a]">
              <Shield className="mr-2 h-4 w-4" /> Roles
            </TabsTrigger>
            <TabsTrigger value="members" className="text-[#4a2b4a]">
              <Users className="mr-2 h-4 w-4" /> Members
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Avatar */}
              <Card>
                <CardHeader>
                  <CardTitle>Avatar</CardTitle>
                  <CardDescription>Your profile image in the project</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <Image
                      src={profile.avatar || "/placeholder.svg"}
                      alt="Avatar"
                      width={200}
                      height={200}
                      className="rounded-full"
                    />
                    <Link href="/avatar-creator" passHref>
                      <Button
                        className="absolute bottom-0 right-0 rounded-full bg-[#4a2b4a] p-2 text-white hover:bg-[#694969]"
                        size="icon"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <Link href="/avatar-creator" passHref>
                    <Button className="w-full bg-[#4a2b4a] text-white hover:bg-[#694969]">Edit Avatar</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="bg-[#4a2b4a] text-white hover:bg-[#694969]">
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </CardFooter>
              </Card>

              {/* Password Change */}
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input id="current-password" type="password" className="pl-10" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                        <Input id="new-password" type="password" className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                        <Input id="confirm-password" type="password" className="pl-10" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Security requirements:</p>
                      <ul className="mt-1 list-inside list-disc">
                        <li>Minimum 8 characters</li>
                        <li>At least one uppercase letter</li>
                        <li>At least one number</li>
                        <li>At least one special character</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="bg-[#4a2b4a] text-white hover:bg-[#694969]">
                    <Lock className="mr-2 h-4 w-4" /> Update Password
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Project Roles</h2>
                <Dialog open={isNewRoleDialogOpen} onOpenChange={setIsNewRoleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#4a2b4a] text-white hover:bg-[#694969]">
                      <Plus className="mr-2 h-4 w-4" /> New Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>{editingRole ? "Edit Role" : "Create New Role"}</DialogTitle>
                      <DialogDescription>
                        {editingRole
                          ? "Modify the role details and permissions"
                          : "Define a new role with specific permissions"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="role-name">Role Name</Label>
                        <Input
                          id="role-name"
                          value={newRoleName}
                          onChange={(e) => setNewRoleName(e.target.value)}
                          placeholder="E.g., Project Manager"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role-description">Description</Label>
                        <Input
                          id="role-description"
                          value={newRoleDescription}
                          onChange={(e) => setNewRoleDescription(e.target.value)}
                          placeholder="E.g., Manages the project and coordinates the team"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Permissions</Label>
                        <div className="rounded-md border border-gray-200 p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium">Bitmask:</span>
                            <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                              {formatBitmask(newRolePermissions)}
                            </code>
                          </div>
                          <div className="space-y-2">
                            {permissions.map((permission) => (
                              <div key={permission.id} className="flex items-start space-x-2">
                                <Checkbox
                                  id={`permission-${permission.id}`}
                                  checked={hasPermission(newRolePermissions, permission.bit)}
                                  onCheckedChange={(checked) =>
                                    handlePermissionChange(permission.bit, checked === true)
                                  }
                                />
                                <div className="grid gap-1.5 leading-none">
                                  <Label htmlFor={`permission-${permission.id}`} className="text-sm font-medium">
                                    {permission.code}
                                  </Label>
                                  <p className="text-xs text-gray-500">{permission.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsNewRoleDialogOpen(false)
                          setEditingRole(null)
                          setNewRoleName("")
                          setNewRoleDescription("")
                          setNewRolePermissions(0)
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-[#4a2b4a] text-white hover:bg-[#694969]"
                        onClick={editingRole ? handleSaveEditedRole : handleCreateRole}
                      >
                        {editingRole ? "Save Changes" : "Create Role"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {roles.map((role) => (
                  <Card key={role.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle>{role.name}</CardTitle>
                          {role.isDefault && (
                            <Badge variant="outline" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-500"
                            onClick={() => toggleRoleExpansion(role.id)}
                          >
                            {expandedRoles[role.id] ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                          {!role.isDefault && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-500"
                                onClick={() => handleEditRole(role.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                                onClick={() => handleDeleteRole(role.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <CardDescription>{role.description}</CardDescription>
                      <div className="mt-1">
                        <code className="rounded bg-gray-100 px-2 py-1 text-xs">{formatBitmask(role.bitmask)}</code>
                      </div>
                    </CardHeader>
                    {expandedRoles[role.id] && (
                      <CardContent>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          {permissions.map((permission) => (
                            <div
                              key={permission.id}
                              className={`flex items-center gap-2 rounded-md p-2 ${
                                hasPermission(role.bitmask, permission.bit) ? "bg-green-50" : "bg-gray-50 text-gray-500"
                              }`}
                            >
                              <div
                                className={`h-2 w-2 rounded-full ${
                                  hasPermission(role.bitmask, permission.bit) ? "bg-green-500" : "bg-gray-300"
                                }`}
                              />
                              <div>
                                <p className="text-xs font-medium">{permission.code}</p>
                                <p className="text-xs">{permission.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Project Members</CardTitle>
                <CardDescription>Manage members and their assigned roles</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member) => {
                      const memberRole = roles.find((role) => role.id === member.role)
                      return (
                        <TableRow key={member.id}>
                          <TableCell>
                            <Image
                              src={member.avatar || "/placeholder.svg"}
                              alt={member.name}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{member.name}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                member.role === "owner"
                                  ? "bg-purple-100 text-purple-800"
                                  : member.role === "admin"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                              }
                            >
                              {memberRole?.name || member.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Invite Member</Button>
                <Button className="bg-[#4a2b4a] text-white hover:bg-[#694969]">Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
