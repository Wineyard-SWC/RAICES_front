"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/settings/components/ui/table"
import { Badge } from "@/app/settings/components/ui/badge"
import { predefinedRoles } from "@/lib/permissions"


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

export default function MembersTab() {
  const [roles, setRoles] = useState([...predefinedRoles])
  const [members, setMembers] = useState([...teamMembers])
  
  // Aquí podrías agregar funciones para cargar los miembros del proyecto actual
  useEffect(() => {
    const currentProjectId = localStorage.getItem("currentProjectId")
    if (currentProjectId) {
      // Cargar miembros desde la API
      console.log(`Cargando miembros para el proyecto: ${currentProjectId}`)
    }
  }, [])
  
  return (
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
            {members.map((member) => {
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
  )
}