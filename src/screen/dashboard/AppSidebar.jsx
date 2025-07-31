import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  BookMarked,
  Atom,
  ChevronRight,
  Bell,
  Search,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { useTheme } from "../../components/template/ThemeProvider";
import useAuthStore from "../../store/useAuthStore";

const AppSidebar = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

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
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  const role = user?.role || "student";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setOpen(!open);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getMenuItems = () => {
    switch (role) {
      case "admin":
        return [
          {
            icon: Home,
            label: "Dashboard",
            path: "/dashboard",
            color: "from-blue-500 to-cyan-500",
          },
          {
            icon: Users,
            label: "Students",
            path: "/dashboard/students",
            color: "from-green-500 to-emerald-500",
          },
          {
            icon: GraduationCap,
            label: "Tutors",
            path: "/dashboard/tutors",
            color: "from-purple-500 to-violet-500",
          },
          {
            icon: BookOpen,
            label: "Courses",
            path: "/dashboard/courses",
            color: "from-orange-500 to-amber-500",
          },
          {
            icon: BookOpen,
            label: "Categories",
            path: "/dashboard/categories",
            color: "from-pink-500 to-rose-500",
          },
          {
            icon: Calendar,
            label: "Class Schedule",
            path: "/dashboard/schedule",
            color: "from-indigo-500 to-blue-500",
          },
          {
            icon: Settings,
            label: "Settings",
            path: "/dashboard/settings",
            color: "from-gray-500 to-slate-500",
          },
        ];
      case "tutor":
        return [
          {
            icon: Home,
            label: "Dashboard",
            path: "/dashboard",
            color: "from-blue-500 to-cyan-500",
          },
          {
            icon: Calendar,
            label: "Class Schedule",
            path: "/dashboard/schedule",
            color: "from-indigo-500 to-blue-500",
          },
          {
            icon: BarChart3,
            label: "Attendance",
            path: "/dashboard/attendance",
            color: "from-green-500 to-emerald-500",
          },
          {
            icon: Users,
            label: "Students",
            path: "/dashboard/students",
            color: "from-purple-500 to-violet-500",
          },
        ];
      case "student":
      default:
        return [
          {
            icon: Home,
            label: "Dashboard",
            path: "/dashboard",
            color: "from-blue-500 to-cyan-500",
          },
          {
            icon: Calendar,
            label: "Class Schedule",
            path: "/dashboard/schedule",
            color: "from-indigo-500 to-blue-500",
          },
          {
            icon: BarChart3,
            label: "Attendance",
            path: "/dashboard/attendance",
            color: "from-green-500 to-emerald-500",
          },
        ];
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case "admin":
        return "from-red-500 to-orange-500";
      case "tutor":
        return "from-blue-500 to-purple-500";
      case "student":
        return "from-green-500 to-blue-500";
      default:
        return "from-gray-500 to-blue-500";
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Overlay for mobile */}
      {isMobile && open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-50 h-full transition-all duration-300 ease-in-out ${
          open ? "w-72" : "w-0 lg:w-20"
        } bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-white/20 shadow-2xl`}
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-indigo-500/10"></div>

        {/* Sidebar header */}
        <div className="relative flex h-20 items-center justify-between px-6 border-b border-white/20">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 group ${
              !open && "lg:justify-center"
            }`}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Atom
                  className="h-6 w-6 text-white animate-spin"
                  style={{ animationDuration: "3s" }}
                />
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
            </div>
            {open && (
              <div className="flex flex-col">
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ATOM
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Portal System
                </span>
              </div>
            )}
          </Link>
          {isMobile && (
            <Button
              onClick={toggleSidebar}
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-600 dark:text-gray-400 hover:bg-white/20"
            >
              <X size={20} />
            </Button>
          )}
        </div>

        {/* User info section */}
        {open && (
          <div className="relative px-6 py-4 border-b border-white/20">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <Avatar className="h-10 w-10 ring-2 ring-white/20">
                <AvatarImage
                  src="/src/assets/avatar.png"
                  alt={`${user?.firstname} ${user?.lastname}` || "User"}
                />
                <AvatarFallback
                  className={`bg-gradient-to-r ${getRoleColor()} text-white font-semibold`}
                >
                  {user?.firstname?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {`${user?.firstname} ${user?.lastname}` || "User"}
                </p>
                <p
                  className={`text-xs font-medium bg-gradient-to-r ${getRoleColor()} bg-clip-text text-transparent capitalize`}
                >
                  {role}
                </p>
              </div>
              <div
                className={`w-2 h-2 rounded-full bg-gradient-to-r ${getRoleColor()} animate-pulse`}
              ></div>
            </div>
          </div>
        )}

        {/* Sidebar content */}
        <div className="relative flex flex-col h-[calc(100%-140px)] justify-between">
          <nav className="px-4 py-6 space-y-2">
            {getMenuItems().map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`group relative flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive(item.path)
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 dark:text-blue-300 shadow-lg"
                    : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:text-gray-800 dark:hover:text-gray-200"
                } ${!open && "lg:justify-center lg:w-12 lg:h-12"}`}
              >
                {/* Active indicator */}
                {isActive(item.path) && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-r-full"></div>
                )}

                {/* Icon with gradient background on hover */}
                <div
                  className={`relative p-2 rounded-lg transition-all duration-300 ${
                    isActive(item.path)
                      ? `bg-gradient-to-r ${item.color}`
                      : hoveredItem === index
                      ? `bg-gradient-to-r ${item.color}`
                      : "bg-transparent"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 transition-colors duration-300 ${
                      isActive(item.path) || hoveredItem === index
                        ? "text-white"
                        : "text-current"
                    }`}
                  />
                </div>

                {open && (
                  <>
                    <span className="ml-3 flex-1">{item.label}</span>
                    {(isActive(item.path) || hoveredItem === index) && (
                      <ChevronRight className="h-4 w-4 ml-auto opacity-60" />
                    )}
                  </>
                )}

                {/* Tooltip for collapsed sidebar */}
                {!open && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                    {item.label}
                  </div>
                )}
              </Link>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="relative border-t border-white/20 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 p-3 h-auto hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-300 ${
                    !open && "lg:justify-center"
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8 ring-2 ring-white/20">
                      <AvatarImage
                        src="/src/assets/avatar.png"
                        alt={`${user?.firstname} ${user?.lastname}` || "User"}
                      />
                      <AvatarFallback
                        className={`bg-gradient-to-r ${getRoleColor()} text-white text-xs`}
                      >
                        {user?.firstname?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                  </div>
                  {open && (
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        Account
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Manage settings
                      </p>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20"
              >
                <DropdownMenuLabel className="text-gray-800 dark:text-gray-200">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/20" />
                <DropdownMenuItem asChild>
                  <Link
                    to="/dashboard/profile"
                    className="cursor-pointer w-full flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/dashboard/settings"
                    className="cursor-pointer w-full flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/20" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
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
        <header className="h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 flex items-center px-6 justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-300"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                {user?.organization?.name || "ATOM Portal"}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {role} Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-300"
            >
              <Bell className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-300"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-blue-600" />
              )}
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-slate-50/50 via-blue-50/50 to-indigo-50/50 dark:from-gray-900/50 dark:via-blue-900/50 dark:to-indigo-900/50 w-full">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AppSidebar;
