import { Outlet } from "react-router-dom"
import { useEffect } from "react"
import AppSidebar from "./AppSidebar"
import useAuthStore from "../../store/useAuthStore"
import { useNavigate } from "react-router-dom"

const DashboardLayout = () => {
    const { user, isAuthenticated } = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login")
        }
    }, [isAuthenticated, navigate])

    if (!user) {
        return null
    }

    return (
        <AppSidebar>
            <Outlet />
        </AppSidebar>
    )
}

export default DashboardLayout

