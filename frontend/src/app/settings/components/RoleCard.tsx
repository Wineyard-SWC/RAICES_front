"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card"
import { Badge } from "./ui/badge"
import { ChevronDown, ChevronRight, Edit, Trash2 } from "lucide-react"
import { permissions } from "@/lib/permissions"

interface FrontendRole {
  id: string;
  name: string;
  description: string;
  bitmask: number;
  isDefault: boolean;
}

interface RoleCardProps {
  role: FrontendRole
  isExpanded: boolean
  onToggleExpand: () => void
  onEdit: () => void
  onDelete: () => void
  hasPermission: (bitmask: number, bit: number) => boolean
  isSubmitting?: boolean
}

export default function RoleCard({
  role,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  hasPermission,
  isSubmitting = false
}: RoleCardProps) {

  return (
    <Card>
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
              onClick={onToggleExpand}
            >
              {isExpanded ? (
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
                  onClick={onEdit}
                  disabled={isSubmitting}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={onDelete}
                  disabled={isSubmitting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
        <CardDescription>{role.description}</CardDescription>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {permissions.map((permission) => (
              <div
                key={permission.id}
                className={`flex items-center gap-2 rounded-md p-2 ${
                  hasPermission(role.bitmask, permission.bit) 
                    ? "bg-green-50" 
                    : "bg-gray-50 text-gray-500"
                }`}
              >
                <div
                  className={`h-2 w-2 rounded-full ${
                    hasPermission(role.bitmask, permission.bit) 
                      ? "bg-green-500" 
                      : "bg-gray-300"
                  }`}
                />
                <div>
                  <p className="text-xs font-medium">{permission.name}</p>
                  <p className="text-xs">{permission.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}