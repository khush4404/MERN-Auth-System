import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import axios from "axios";

type AuthInfo = {
    isAuthenticated: boolean;
    role: string;
};

export const useAuthCheck = (): AuthInfo | null => {
    const [authInfo, setAuthInfo] = useState<AuthInfo | null>(null);
    const [hasChecked, setHasChecked] = useState(false); // ✅ prevent repeat checks

    const setAuthUser = useAuthStore((state) => state.setAuthUser);
    const logout = useAuthStore((state) => state.logout);

    useEffect(() => {
        if (hasChecked) return;

        const checkAuth = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BASE_URL}auth/verify`, {
                    withCredentials: true,
                });

                if (res.data.valid) {
                    const userFromServer = {
                        userId: res.data.userId,
                        email: res.data.email,
                        firstName: res.data.firstName,
                        lastName: res.data.lastName,
                        location: res.data.location,
                        phoneNo: res.data.phoneNo,
                        role: res.data.role,
                        status: res.data.status,
                        imgUrl: res.data.imgUrl,
                    };

                    setAuthUser(userFromServer);
                    setAuthInfo({ isAuthenticated: true, role: res.data.role });
                } else {
                    logout();
                    setAuthInfo({ isAuthenticated: false, role: "" });
                }
            } catch {
                logout();
                setAuthInfo({ isAuthenticated: false, role: "" });
            } finally {
                setHasChecked(true); // ✅ only run once
            }
        };

        checkAuth();
    }, [hasChecked, logout, setAuthUser]);

    return authInfo;
};
