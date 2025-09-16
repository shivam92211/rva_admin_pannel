import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Home,
  Users,
  ArrowLeftRight,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  Settings,
  RefreshCw,
  ChevronUp,
  User2,
  LogOut,
  Menu,
  X,
  UserCheck,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

const data = {
  user: {
    name: "KuCoin Admin",
    email: "admin@kucoin.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Sub Accounts", 
      url: "/subaccounts",
      icon: Users,
    },
    {
      title: "Transfers",
      url: "/transfers", 
      icon: ArrowLeftRight,
    },
    {
      title: "Deposits",
      url: "/deposits",
      icon: Wallet,
    },
    {
      title: "Withdrawals",
      url: "/withdrawals",
      icon: ArrowUpRight,
    },
    {
      title: "Rebates",
      url: "/rebates",
      icon: TrendingUp,
    },
    {
      title: "Users",
      url: "/users",
      icon: UserCheck,
    },
  ],
}

interface AppSidebarProps {
  apiConnected: boolean
  onOpenSettings: () => void
  onRefresh: () => void
}

export function AppSidebar({ apiConnected, onOpenSettings, onRefresh }: AppSidebarProps) {
  const location = useLocation()
  const { open } = useSidebar()
  
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between px-1 py-1.5">
              <div className="flex items-center gap-2 text-left text-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Menu className="h-4 w-4" />
                </div>
                {open && (
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">KuCoin Admin</span>
                    <span className={`truncate text-xs ${apiConnected ? 'text-green-600' : 'text-red-600'}`}>
                      {apiConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                )}
              </div>
             
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          {open && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={!open ? item.title : undefined}
                    className={location.pathname === item.url ? "bg-accent text-accent-foreground" : ""}
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {open && <Separator />}
        
        <SidebarGroup>
          {open && <SidebarGroupLabel>Settings</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={onOpenSettings} 
                  tooltip={!open ? "API Settings" : undefined}
                >
                  <Settings className="h-4 w-4" />
                  {open && <span>API Settings</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={onRefresh} 
                  tooltip={!open ? "Refresh" : undefined}
                >
                  <RefreshCw className="h-4 w-4" />
                  {open && <span>Refresh</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <User2 className="h-4 w-4" />
              </div>
              {open && (
                <>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{data.user.name}</span>
                    <span className="truncate text-xs">{data.user.email}</span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}