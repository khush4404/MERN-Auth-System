import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../component/layout/Navbar';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

function App() {

  useEffect(() => {
    useThemeStore.getState().initTheme();
  }, []);

  const setUser = useAuthStore((state) => state.setUser);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);

  // Prevent double API call in development due to React.StrictMode
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    const checkAuth = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}auth/verify`, {
          withCredentials: true,
        });

        if (res.data.valid) {
          setUser({
            userId: res.data.userId,
            email: res.data.email,
            firstName: res.data.firstName || '',
            lastName: res.data.lastName || '', // Fixed casing
            location: res.data.location,
            phoneNo: res.data.phoneNo,
            role: res.data.role,
            status: 'active',
            imgUrl: res.data.imgUrl,
          });
          setAuth(true);
        } else {
          logout();
        }
      } catch {
        logout(); // fallback if token is missing or invalid
      }
    };

    checkAuth();
  }, [logout, setAuth, setUser]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="min-h-screen flex flex-col w-full bg-[radial-gradient(ellipse_at_50%_50%,_#f3f4f6_0%,_#f9fafb_100%)] dark:bg-[radial-gradient(ellipse_at_70%_30%,_#23283b_0%,_#10131a_100%)]">
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
}

export default App;
