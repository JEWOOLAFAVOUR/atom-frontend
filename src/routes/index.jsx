import { useEffect } from "react"
import { createBrowserRouter, RouterProvider, useLocation } from "react-router-dom"
import HomePage from "../screen/Auth/HomePage"
import ProtectedRoute from "./protectedRoute"
import DashboardLayout from "../screen/dashboard/DashboardLayout"
import AdminDashboard from "../screen/admin/dashboard/Dashboard"
import TutorDashboard from "../screen/tutor/dashboard/Dashboard"
import StudentDashboard from "../screen/student/dashboard/Dashboard"
import LoginPage from "../screen/auth/LoginPage"
import AdminStudent from "../screen/admin/student/Student"
import AdminTutor from "../screen/admin/tutor/Tutor"
import useAuthStore from "../store/useAuthStore"
import AdminCourse from "../screen/admin/courses/Course"
import AssignmentPage from "../screen/student/project/Project"
import ClassSchedulePage from "../screen/student/schedule/Schedule"
import AttendancePage from "../screen/student/attendance/Attendance"

const ScrollToTop = () => {
    const { pathname } = useLocation()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    return null
}

const RouteWrapper = ({ Component }) => (
    <>
        <ScrollToTop />
        <Component />
    </>
)

const RootRouteHandler = () => {
    // return <HomePage />
    return <LoginPage />
}

const DashboardHandler = () => {
    const { user } = useAuthStore()

    if (!user) return null

    switch (user.role) {
        case "admin":
            return <AdminDashboard />
        case "tutor":
            return <TutorDashboard />
        case "student":
        default:
            return <StudentDashboard />
    }
}

const Routes = () => {
    const pageRoutes = [
        {
            path: "",
            element: <RouteWrapper Component={RootRouteHandler} />,
        },
        {
            path: "/login",
            element: <RouteWrapper Component={LoginPage} />,
        },
    ]

    const dashboardRoutes = [
        {
            path: "dashboard",
            element: <ProtectedRoute />,
            children: [
                {
                    element: <DashboardLayout />,
                    children: [
                        {
                            path: "",
                            element: <DashboardHandler />,
                        },
                        // Admin routes
                        {
                            path: "students",
                            element: <AdminStudent />,
                        },
                        {
                            path: "tutors",
                            element: <AdminTutor />,
                        },
                        {
                            path: "courses",
                            element: <AdminCourse />,
                        },
                        // Tutor routes
                        {
                            path: "schedule",
                            element: <ClassSchedulePage />,
                        },
                        {
                            path: "projects",
                            element: <div>Projects/Assignments</div>,
                        },
                        {
                            path: "curriculum",
                            element: <div>Curriculum</div>,
                        },
                        // Student routes
                        {
                            path: "assignments",
                            element: <AssignmentPage />,
                        },
                        {
                            path: "attendance",
                            element: <AttendancePage />,
                        },
                        // Shared routes
                        {
                            path: "settings",
                            element: <div>Settings</div>,
                        },
                    ],
                },
            ],
        },
    ]

    const router = createBrowserRouter([...pageRoutes, ...dashboardRoutes])

    return <RouterProvider router={router} />
}

export default Routes

