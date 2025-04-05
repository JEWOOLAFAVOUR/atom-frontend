import { useState, useEffect } from "react"
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
    Menu,
    X,
    GraduationCap,
    BookMarked
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
import { useTheme } from "../../components/template/ThemeProvider"
import useAuthStore from "../../store/useAuthStore"

const AppSidebar = ({ children }) => {
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()
    const location = useLocation()
    const { theme, setTheme } = useTheme()
    const [open, setOpen] = useState(true)
    const [isMobile, setIsMobile] = useState(false)

    // Check if device is mobile and set sidebar state accordingly
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth < 1024) {
                setOpen(false);
            } else {
                setOpen(true);
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);

    const role = user?.role || "student"

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const toggleSidebar = () => {
        setOpen(!open);
    }

    const isActive = (path) => {
        return location.pathname === path
    }

    const getMenuItems = () => {
        switch (role) {
            case "admin":
                return [
                    { icon: Home, label: "Dashboard", path: "/dashboard" },
                    { icon: Users, label: "Students", path: "/dashboard/students" },
                    { icon: GraduationCap, label: "Tutors", path: "/dashboard/tutors" },
                    { icon: BookOpen, label: "Courses", path: "/dashboard/courses" },
                    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
                ]
            case "tutor":
                return [
                    { icon: Home, label: "Dashboard", path: "/dashboard" },
                    { icon: Calendar, label: "Class Schedule", path: "/dashboard/schedule" },
                    { icon: FileText, label: "Projects/Assignments", path: "/dashboard/projects" },
                    { icon: BookMarked, label: "Curriculum", path: "/dashboard/curriculum" },
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
        <div className="flex h-screen w-full overflow-hidden bg-background">
            {/* Overlay for mobile */}
            {isMobile && open && (
                <div
                    className="fixed inset-0 z-40 bg-black/50"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:relative z-50 h-full transition-all duration-300 ease-in-out bg-card border-r border-border shadow-md ${open ? "w-64" : "w-0 lg:w-20"
                    }`}
            >
                {/* Sidebar header */}
                <div className="flex h-16 items-center justify-between px-4 border-b border-border">
                    <Link
                        to="/dashboard"
                        className={`flex items-center gap-2 ${!open && "lg:justify-center"}`}
                    >
                        <img src="/logo.png" alt="Logo" className="h-9 w-auto" />
                        {open && <span className="font-semibold text-xl text-foreground">Atom</span>}
                    </Link>
                    {isMobile && (
                        <button onClick={toggleSidebar} className="lg:hidden text-foreground">
                            <X size={24} />
                        </button>
                    )}
                </div>

                {/* Sidebar content */}
                <div className="flex flex-col h-[calc(100%-4rem)] justify-between">
                    <nav className="px-3 py-4 space-y-1">
                        {getMenuItems().map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(item.path)
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                    } ${!open && "lg:justify-center"}`}
                            >
                                <item.icon className={`h-5 w-5 ${isActive(item.path) ? "text-primary" : "text-muted-foreground"}`} />
                                {open && <span className="ml-3">{item.label}</span>}
                            </Link>
                        ))}
                    </nav>

                    {/* Sidebar footer with user info */}
                    <div className="border-t border-border p-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className={`w-full justify-start gap-2 ${!open && "lg:justify-center"}`}>
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="/src/assets/avatar.png" alt={`${user?.firstname} ${user?.lastname}` || "User"} />
                                        <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                                    </Avatar>
                                    {open && <span className="truncate">{`${user?.firstname} ${user?.lastname}` || "User"}</span>}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link to="/dashboard/profile" className="cursor-pointer w-full">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to="/dashboard/settings" className="cursor-pointer w-full">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </aside>

            {/* Main content area */}
            <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-card border-b border-border flex items-center px-4 lg:px-6 justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebar}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>

                        <h1 className="text-xl font-semibold text-foreground">
                            {user?.organization?.name} {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </Button>
                    </div>
                </header>

                {/* Main content */}
                <main className="flex-1 overflow-auto p-4 lg:p-6 bg-background w-full">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default AppSidebar
