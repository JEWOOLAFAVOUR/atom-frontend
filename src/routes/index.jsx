import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, useLocation, Navigate } from "react-router-dom";
import HomePage from '../screen/auth/HomePage';
import ProtectedRoute from './protectedRoute';
import DashboardLayout from "../screen/Dashboard/components/DashboardLayout";
import Dashboard from '../screen/Dashboard/dashboard/Dashboard';
import useAuthStore from '../store/useAuthStore';
import LoginPage from '../screen/auth/LoginPage';



const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

const RouteWrapper = ({ Component }) => (
    <>
        <ScrollToTop />
        <Component />
    </>
);

const RootRouteHandler = () => {

    return <HomePage />;
};



const Routes = () => {
    const pageRoutes = [
        {
            path: "",
            element: <RouteWrapper Component={RootRouteHandler} />,
        }, {
            path: "/login",
            element: <RouteWrapper Component={LoginPage} />,
        },

    ];

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
                            element: <Dashboard />,
                        },
                        // Add other dashboard routes here


                    ]
                }
            ],
        },
    ]

    const router = createBrowserRouter([
        ...pageRoutes,
        ...dashboardRoutes,
    ]);

    return <RouterProvider router={router} />;
};

export default Routes;

