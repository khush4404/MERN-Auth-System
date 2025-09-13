import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { EditProfile } from "./pages/EditProfile";
import { Dashboard } from "./pages/Dashboard";
import App from "./pages/App";
import { UserList } from "./pages/UsersList";
import { AddEditUser } from "./pages/AddEditUser";
import { UserDetail } from "./pages/UserDetail";
import { UserActivity } from "./pages/UserActivity";
import { PrivateRoute, ProtectedRoute, PublicRoute } from "./hooks/AuthRoute";

const createRoutes = () => (
    <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route element={<ProtectedRoute allowedRoles={[]} />}>
                <Route element={<App />}>
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/edit-profile" element={<EditProfile />} />
                    <Route element={<PrivateRoute />}>
                        <Route path="/admin/user-list" element={<UserList />} />
                        <Route path="/admin/add-edit-user" element={<AddEditUser />} />
                        <Route path="/admin/add-edit-user/:id" element={<AddEditUser />} />
                        <Route path="/admin/user/:userId" element={<UserDetail />} />
                        <Route path="/admin/user/activity-log/:userId" element={<UserActivity />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
            </Route>

        </Routes>
    </BrowserRouter>
);

export default createRoutes;
