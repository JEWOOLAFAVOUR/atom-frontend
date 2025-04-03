import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
    BarChart3,
    BookOpen,
    Calendar,
    ClipboardList,
    FileText,
    Home,
    LogOut,
    Settings,
    User,
    Users,
    Sun,
    Moon,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Button } from "../../components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarProvider,
    SidebarTrigger,
} from "../../components/ui/sidebar"
import { useTheme } from "../../components/template/ThemeProvider"
import useAuthStore from "../../store/useAuthStore"

const AppSidebar = ({ children }) => {
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()
    const location = useLocation()
    const { theme, setTheme } = useTheme()
    const [open, setOpen] = useState(true)

    const role = user?.role || "student"

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const isActive = (path) => {
        return location.pathname === path
    }

    const getMenuItems = () => {
        switch (role) {
            case "admin":
                return [
                    { icon: Home, label: "Dashboard", path: "/dashboard" },
                    { icon: Users, label: "Manage Students", path: "/dashboard/students" },
                    { icon: User, label: "Manage Tutors", path: "/dashboard/tutors" },
                    { icon: BookOpen, label: "Manage Courses", path: "/dashboard/courses" },
                    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
                ]
            case "tutor":
                return [
                    { icon: Home, label: "Dashboard", path: "/dashboard" },
                    { icon: Calendar, label: "Class Schedule", path: "/dashboard/schedule" },
                    { icon: FileText, label: "Projects/Assignments", path: "/dashboard/projects" },
                    { icon: BookOpen, label: "Curriculum", path: "/dashboard/curriculum" },
                    { icon: Users, label: "Students", path: "/dashboard/students" },
                ]
            case "student":
            default:
                return [
                    { icon: Home, label: "Dashboard", path: "/dashboard" },
                    { icon: Calendar, label: "Class Schedule", path: "/dashboard/schedule" },
                    { icon: ClipboardList, label: "Assignments", path: "/dashboard/assignments" },
                    { icon: BookOpen, label: "Curriculum", path: "/dashboard/curriculum" },
                    { icon: BarChart3, label: "Attendance", path: "/dashboard/attendance" },
                ]
        }
    }

    return (
        <SidebarProvider defaultOpen={open} onOpenChange={setOpen}>
            <div className="flex min-h-screen">
                <Sidebar className="border-r">
                    <SidebarHeader className="border-b px-6 py-3">
                        <Link to="/dashboard" className="flex items-center gap-2">
                            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                            <span className="font-semibold text-xl">Atom</span>
                        </Link>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarMenu>
                            {getMenuItems().map((item) => (
                                <SidebarMenuItem key={item.path}>
                                    <SidebarMenuButton asChild isActive={isActive(item.path)} tooltip={item.label}>
                                        <Link to={item.path}>
                                            <item.icon className="h-5 w-5" />
                                            <span>{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarContent>

                    <SidebarFooter className="border-t p-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="w-full justify-start gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src="/src/assets/avatar.png" alt={user?.name || "User"} />
                                        <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                                    </Avatar>
                                    <span className="truncate">{user?.name || "User"}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarFooter>
                </Sidebar>

                <div className="flex-1 flex flex-col">
                    <header className="h-14 border-b flex items-center px-6 justify-between">
                        <div className="flex items-center">
                            <SidebarTrigger />
                            <h1 className="text-xl font-semibold ml-4">{role.charAt(0).toUpperCase() + role.slice(1)} Dashboard</h1>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </Button>
                    </header>
                    <main className="flex-1 overflow-auto p-6">{children}</main>
                </div>
            </div>
        </SidebarProvider>
    )
}

export default AppSidebar

