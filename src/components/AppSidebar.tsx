import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Home,
  Users,
  ArrowLeftRight,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  ChevronUp,
  User2,
  LogOut,
  Menu,
  UserCheck,
  FileText,
  ArrowRightLeft,
  Shield,
  Settings,
  SlidersHorizontal,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

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
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cipherEmail } from "@/utils/security";

const navMain = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  // {
  //   title: "Sub Accounts", 
  //   url: "/subaccounts",
  //   icon: Users,
  // },
  // {
  //   title: "Transfers",
  //   url: "/transfers", 
  //   icon: ArrowLeftRight,
  // },
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
  // {
  //   title: "Rebates",
  //   url: "/rebates",
  //   icon: TrendingUp,
  // },
  {
    title: "Users",
    url: "/users",
    icon: UserCheck,
  },
  {
    title: "KYC Submissions",
    url: "/kyc-submissions",
    icon: FileText,
  },
  {
    title: "Trading Pairs",
    url: "/trading-pairs",
    icon: ArrowRightLeft,
  },
  {
    title: "Admin Management",
    url: "/admin-management",
    icon: Shield,
  },
  {
    title: "Basic Settings",
    url: "/basic-settings",
    icon: Settings,
  },
  {
    title: "Advanced Settings",
    url: "/advanced-settings",
    icon: SlidersHorizontal,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { open } = useSidebar();
  const { admin, logout } = useAuthStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = async () => {
    await logout();
    // navigate('/login');
    window.location.href = "/login";
    setShowLogoutDialog(false);
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between px-1 py-1.5">
              <div className="flex items-center gap-2 text-left text-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {/* <Menu className="h-4 w-4" /> */}
                  <img src="./logo.jpeg" alt="RVA Logo" className=" rounded-full " />
                </div>
                {open && (
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">RVA Admin Panel</span>
                    <span className="truncate text-xs text-yellow-600">
                      {admin?.role || 'Admin'}
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
              {navMain.map((item) => (
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
      </SidebarContent>

      <SidebarFooter className="w-full">
        <SidebarMenu className="w-full">
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogoutClick}
              tooltip={!open ? "Logout" : undefined}
              className="text-red-600 hover:text-red-700 w-full hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              {open && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <User2 className="h-4 w-4" />
              </div>
              {open && (
                <>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{admin?.name || 'Admin'}</span>
                    <span className="truncate text-xs">{cipherEmail(admin?.email)}</span>
                  </div>
                  {/* <ChevronUp className="ml-auto h-4 w-4" /> */}
                </>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You will need to sign in again to access the admin panel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelLogout}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmLogout}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}