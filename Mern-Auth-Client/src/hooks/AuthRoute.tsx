import { Navigate, Outlet } from "react-router-dom";
import { useAuthCheck } from "../hooks/useAuthCheck";
import type { JSX } from "react";
import Spinner from "../utils/Spinner";

export const ProtectedRoute = ({
    allowedRoles = [],
}: {
    allowedRoles: string[];
}) => {
    const authInfo = useAuthCheck();

    if (!authInfo) {
        return (
            <Spinner />
        );
    }
    const { isAuthenticated, role } = authInfo;

    if (!isAuthenticated || (allowedRoles.length > 0 && !allowedRoles.includes(role))) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export const PublicRoute = ({ children }: { children: JSX.Element }) => {
    const authInfo = useAuthCheck();

    if (!authInfo) {
        return (
            <Spinner />
        );
    }

    return authInfo.isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

export const PrivateRoute = () => <ProtectedRoute allowedRoles={["admin"]} />;
