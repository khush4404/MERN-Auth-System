import axios from "axios";
import { useRef, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuthStore } from "../../store/authStore";
import { useAuthCheck } from "../../hooks/useAuthCheck";
import ThemeToggle from "../ui/ThemeToggle";
import { toast } from "../../utils/toast";
import { Button } from "../../utils/Button";
import { useThemeStore } from "../../store/themeStore";
import Spinner from "../../utils/Spinner";
import Icon from "../../utils/Icon";

const Navbar = () => {
    const mode = useThemeStore((state) => state.mode);
    const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);


    const authInfo = useAuthCheck();
    const user = useAuthStore((state) => state.user);
    const logoutStore = useAuthStore((state) => state.logout);

    const navigate = useNavigate();
    const location = useLocation();

    // const [adminOpen, setAdminOpen] = useState(false);
    // const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const userDropdownRef = useRef<HTMLDivElement | null>(null);
    const adminDropdownRef = useRef<HTMLDivElement | null>(null);

    const isAdminRoute =
        location.pathname === "/login" ||
        location.pathname === "/register" ||
        location.pathname === "/forgot-password";

    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isSidebarOpen]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                userDropdownRef.current &&
                !userDropdownRef.current.contains(event.target as Node)
            ) {
                // setUserDropdownOpen(false);
            }
            if (
                adminDropdownRef.current &&
                !adminDropdownRef.current.contains(event.target as Node)
            ) {
                // setAdminOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (!authInfo) {
        return (
            <Spinner />
        );
    }

    const { isAuthenticated } = authInfo;

    const logoutFn = async () => {
        const result = await Swal.fire({
            title: `<span style="color:${isDark ? " #fff" : "#000"};font-weight:bold;font-size:1.3rem">Are you absolutely sure?</span > `,
            html: `<span span style = "color:${isDark ? "#b0b3c6" : "#4a4a4a"}" > This action will delete your account.You cannot undo this!</span > `,
            icon: "warning",
            background: isDark ? "#181c24" : "#fff",
            showCancelButton: true,
            confirmButtonText: 'Yes, Logout!',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: "rounded-2xl shadow-2xl",
                confirmButton: isDark ? 'my-confirm-dark' : 'my-confirm-light',
                cancelButton: isDark ? 'my-cancel-dark' : 'my-cancel-light',
            },
        });

        if (result.isConfirmed) {
            try {
                await axios.post(`${import.meta.env.VITE_BASE_URL}logout`, {}, { withCredentials: true });
                useAuthStore.getState().logout();
                toast.success("Logout successful!");
                logoutStore();
                navigate("/login");
            } catch {
                toast.error("Logout failed. Please try again.");
            }
        }
    };

    const deleteFn = async () => {
        const result = await Swal.fire({
            title: `<span span style = "color:${isDark ? "#fff" : "#000"};font-weight:bold;font-size:1.3rem" > Are you absolutely sure?</span > `,
            html: `<span span style = "color:${isDark ? "#b0b3c6" : "#4a4a4a"}" > This action will delete your account.You cannot undo this!</span > `,
            icon: "warning",
            background: isDark ? "#181c24" : "#fff",
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: "rounded-2xl shadow-2xl",
                confirmButton: isDark ? 'my-confirm-dark' : 'my-confirm-light',
                cancelButton: isDark ? 'my-cancel-dark' : 'my-cancel-light',
            },
        });


        if (result.isConfirmed) {
            try {
                await axios.put(`${import.meta.env.VITE_BASE_URL}delete`, {}, { withCredentials: true });
                toast.success("Account deleted successfully");
                logoutStore();
                navigate("/login");
            } catch {
                toast.error("Delete Account failed. Please try again.");
            }
        }
    };

    return (
        <>
            <nav className="w-full bg-white dark:bg-primaryBg border-b border-btnGrFromLight dark:border-darkBorder sm:px-6 sm:py-4 px-5 py-3 flex items-center justify-between shadow-sm z-50 sticky top-0">
                {/* LEFT: LOGO */}
                <Link
                    to="/dashboard"
                    className="text-2xl font-bold dark:bg-gradient-to-r dark:from-textGrFrom dark:to-textGrTo bg-[linear-gradient(92.77deg,#080C1D_7.73%,#7E808C_99.72%)] bg-clip-text text-transparent select-none"
                >
                    Striked
                </Link>

                {/* CENTER: Navigation Links */}
                {isAuthenticated && (
                    <div className="hidden md:flex gap-8 text-lg font-medium">
                        <Link
                            to="/dashboard"
                            className={`border-b dark:hover:border-primary hover:border-gray-600 ${location.pathname === "/dashboard" ? "border-b dark:border-textGrFrom border-gray-600" : ""
                                } bg-gradient-to-r dark:from-textGrFrom dark:to-textGrTo hover:dark:from-btnGrFromHover hover:dark:to-primary from-backBtnGrFromLight to-backBtnGrToLight hover:from-backBtnGrToLight hover:to-backBtnGrFromLight bg-clip-text text-transparent transition-colors duration-300`}
                        >
                            Home
                        </Link>
                    </div>
                )}

                {/* RIGHT: Sidebar Toggle Button */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <ThemeToggle />
                    {!isAuthenticated && !isAdminRoute && (
                        <div className="flex items-center gap-4">
                            <Button
                                text="Sign in"
                                onClick={() => { setIsSidebarOpen(false); navigate("/login"); }}
                                className="w-full px-3"
                            />
                            <Button
                                text="Sign Up"
                                onClick={() => { setIsSidebarOpen(false); navigate("/register"); }}
                                className="w-full px-3 whitespace-nowrap"
                            />
                        </div>
                    )}
                    {isAuthenticated && (
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="flex items-center justify-center w-10 h-10 rounded-[6px]  border border-btnGrFromLight dark:border-darkBorder  dark:text-blue-200 shadow-sm focus:ring-2 dark:focus:ring-blue-400 focus:ring-textGrayMedium transition-colors duration-200 bg-gradient-to-r from-btnGrFromLight to-btnGrToLight hover:from-btnGrFromLightHover hover:to-btnGrToLight dark:from-btnGrFrom dark:to-btnGrTo dark:hover:from-btnGrFromHover dark:hover:to-primary"
                        >
                            <span className="sr-only">Open Menu</span>
                            <Icon icon="menu" className="w-6 h-6 text-gray-500 dark:text-white flex justify-center items-center" fill="none" stroke="currentColor" strokeWidth="2" />
                        </button>
                    )}
                </div>

            </nav >
            {
                <div className={`fixed inset-0 z-50 flex ${isSidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'}`
                }>
                    {/* Overlay */}
                    < div
                        className={`fixed inset-0 bg-black/50 transition-opacity duration-500 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
                        onClick={() => setIsSidebarOpen(false)}
                    />

                    {/* Sidebar */}
                    <div
                        className={`ml-auto w-[calc(100%/1)] sm:w-[calc(100%/3)] h-full bg-white dark:bg-primaryBg shadow-sm p-4 z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "translate-x-full"
                            }`}
                    >
                        <div className="flex flex-col h-full">

                            {/* Header */}
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold dark:text-white">Menu</h2>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="p-2 rounded-md hover:bg-bgLight dark:hover:bg-darkBorder text-gray-800 dark:text-white"
                                >
                                    <Icon icon="close" className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Main Content (scrollable) */}
                            <div className="flex-1 overflow-y-auto space-y-6">

                                {/* Section: Navigation Links */}
                                <div className="md:hidden flex flex-col gap-3">
                                    <h3 className="text-md font-semibold text-gray-700 dark:text-btnGrFromLight">Navigation</h3>
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setIsSidebarOpen(false)}
                                        className="text-lg font-medium hover:underline text-gray-900 dark:text-white"
                                    >
                                        Home
                                    </Link>
                                </div>

                                {/* Section: User Options */}
                                {user && (
                                    <div className="border-t border-btnGrFromLight dark:border-darkBorder pt-4 w-full">
                                        <h3 className="text-md font-semibold text-gray-700 dark:text-blue-300 mb-2">User Settings</h3>
                                        <button
                                            onClick={() => {
                                                setIsSidebarOpen(false);
                                                navigate("/edit-profile");
                                            }}
                                            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-bgLight dark:hover:bg-darkBorder dark:text-blue-200 w-full"
                                        >
                                            <Icon icon="edit" className="h-5 w-5" />
                                            Edit Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsSidebarOpen(false);
                                                navigate("/reset-password");
                                            }}
                                            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-bgLight dark:hover:bg-darkBorder dark:text-blue-200 w-full"
                                        >
                                            <Icon icon="reset-password" className="h-5 w-5" />
                                            Reset Password
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsSidebarOpen(false);
                                                deleteFn();
                                            }}
                                            className="flex items-center gap-2 px-3 py-2 rounded-md text-red-600 dark:text-red-400 hover:bg-bgLight dark:hover:bg-darkBorder w-full"
                                        >
                                            <Icon icon="trash" className="h-5 w-5" />
                                            Delete Account
                                        </button>
                                    </div>
                                )}

                                {/* Section: Admin Panel */}
                                {user?.role?.toLowerCase() === "admin" && (
                                    <div className="border-t border-btnGrFromLight dark:border-darkBorder pt-4">
                                        <h3 className="text-md font-semibold text-gray-700 dark:text-blue-300 mb-2">Admin Tools</h3>
                                        <button
                                            onClick={() => {
                                                setIsSidebarOpen(false);
                                                navigate("/admin/user-list");
                                            }}
                                            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-bgLight dark:hover:bg-darkBorder dark:text-blue-200 w-full"
                                        >
                                            <Icon icon="users" className="h-5 w-5" />
                                            Manage Users
                                        </button>
                                    </div>
                                )}

                                {/* Guest login buttons */}
                                {!isAuthenticated && !isAdminRoute && (
                                    <div className="border-t border-btnGrFromLight dark:border-darkBorder pt-4">
                                        <Button
                                            text="Sign In"
                                            onClick={() => {
                                                setIsSidebarOpen(false);
                                                navigate("/login");
                                            }}
                                            className="w-full mb-2"
                                        />
                                        <Button
                                            text="Sign Up"
                                            onClick={() => {
                                                setIsSidebarOpen(false);
                                                navigate("/register");
                                            }}
                                            className="w-full"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Footer: User Info + Logout */}
                            {user && (
                                <div className="flex items-center gap-3 border-t border-btnGrFromLight dark:border-darkBorder pt-4 sticky bottom-0 bg-white dark:bg-primaryBg justify-between">
                                    {user.imgUrl ? (
                                        <img
                                            src={`${import.meta.env.VITE_TEBI_PUBLIC_URL}merndemo/users/${user.imgUrl}`}
                                            alt={`${user.firstName} ${user.lastName}`}
                                            className="w-10 h-10 rounded-full object-cover border border-blue-400"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-blue-200 dark:bg-blue-900 dark:text-blue-200 flex items-center justify-center font-bold text-lg uppercase">
                                            {user.firstName?.[0]}
                                        </div>
                                    )}
                                    <div className="flex-col flex-1 hidden lg:flex">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {user.firstName} {user.lastName}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-textGrayMedium">{user.email}</span>
                                    </div>
                                    <div
                                        onClick={() => {
                                            setIsSidebarOpen(false);
                                            logoutFn();
                                        }}
                                        className="cursor-pointer p-2 rounded-md text-gray-600 dark:text-blue-200 hover:bg-bgLight dark:hover:bg-darkBorder transition-colors duration-200 bg-gradient-to-r from-btnGrFromLight to-btnGrToLight hover:from-btnGrFromLightHover hover:to-btnGrToLight dark:from-btnGrFrom dark:to-btnGrTo dark:hover:from-btnGrFromHover dark:hover:to-primary flex gap-3 w-fit items-center"
                                    >
                                        <Icon icon="logout" className="h-5 w-5" />
                                        <span className="lg:block hidden" >Logout</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>


                </div >

            }
        </>
    );

};

export default Navbar;
