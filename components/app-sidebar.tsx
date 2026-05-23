"use client"

import { BarChart3, Wrench, Users, FileText, Settings, Activity, Cog, Calendar, ChevronLeft, Menu } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const menuItemsByRole = {
  administrador: [
    { title: "Dashboard", icon: BarChart3, id: "dashboard" },
    { title: "Gestión de equipos", icon: Wrench, id: "equipos" },
    { title: "Gestión de Usuarios", icon: Users, id: "tecnicos" },
    { title: "Órdenes de trabajo", icon: FileText, id: "ordenes" },
    { title: "Programar mantenimiento", icon: Settings, id: "mantenimiento" },
    { title: "Reportes", icon: BarChart3, id: "reportes" },
    { title: "Auditoría (Logs)", icon: Activity, id: "auditoria" },
    { title: "Configuración", icon: Cog, id: "configuracion" },
  ],
  supervisor: [
    { title: "Dashboard", icon: BarChart3, id: "dashboard" },
    { title: "Gestión de equipos", icon: Wrench, id: "equipos" },
    { title: "Órdenes de trabajo", icon: FileText, id: "ordenes" },
    { title: "Programar mantenimiento", icon: Settings, id: "mantenimiento" },
    { title: "Reportes", icon: BarChart3, id: "reportes" },
    { title: "Configuración", icon: Cog, id: "configuracion" },
  ],
  tecnico: [
    { title: "Órdenes de trabajo", icon: FileText, id: "ordenes" },
    { title: "Programar mantenimiento", icon: Settings, id: "mantenimiento" },
    { title: "Reportes", icon: BarChart3, id: "reportes" },
  ],
}

const roleLabels = {
  administrador: "Administrador",
  supervisor: "Supervisor",
  tecnico: "Técnico",
}

interface AppSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  userRole: "administrador" | "supervisor" | "tecnico"
  currentUser?: any
  hospitalLogo?: string
}

export function AppSidebar({ activeSection, onSectionChange, userRole, hospitalLogo }: AppSidebarProps) {
  // Normalize role to lowercase to handle different input formats
  const normalizedRole = (userRole?.toLowerCase() as "administrador" | "supervisor" | "tecnico") || "administrador"
  
  // Ensure the normalized role is one of the valid roles
  const validRoles: ("administrador" | "supervisor" | "tecnico")[] = ["administrador", "supervisor", "tecnico"]
  const isValidRole = validRoles.includes(normalizedRole)
  const finalRole = isValidRole ? normalizedRole : "administrador"
  
  const menuItems = menuItemsByRole[finalRole]
  const { toggleSidebar, state } = useSidebar()

  return (
    <Sidebar collapsible="icon" className="border-r bg-white">
      <SidebarHeader className="border-b px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <img
              src={hospitalLogo || "/placeholder.svg?height=40&width=40"}
              alt="Hospital Dr Beningo Sánchez"
              className="object-contain shrink-0 w-10 h-10"
            />
            <div className="flex flex-col group-data-[collapsible=icon]:hidden flex-1 min-w-0">
              <span className="text-sm font-semibold text-gray-900 break-words">Hospital Dr Beningo Sánchez</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-9 w-9 shrink-0 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors"
            title={state === 'expanded' ? 'Colapsar menú' : 'Expandir menú'}
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </Button>
        </div>
        <div className="group-data-[collapsible=icon]:hidden mt-3 pt-3 border-t">
          <div className="text-xs text-gray-600">Rol actual:</div>
          <div className="text-sm font-semibold text-blue-600">{roleLabels[finalRole]}</div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(item.id)}
                    isActive={activeSection === item.id}
                    tooltip={item.title}
                    className="w-full justify-start gap-3 px-4 py-2.5 text-gray-700 hover:bg-blue-100 hover:text-blue-700 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700 rounded-lg transition-colors"
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
