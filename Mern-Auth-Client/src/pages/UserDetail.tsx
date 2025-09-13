import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
    User, ChevronRight, Phone, MapPin, Edit, Trash2, List, Mail, UserCheck, CalendarDays, Clock, Info
} from "lucide-react";
import Swal from "sweetalert2";
import "../index.css";
import { toast } from "../utils/toast";
import type { CurUser } from "../types/UserTypes";
import { useThemeStore } from "../store/themeStore";

export const UserDetail = () => {
    const mode = useThemeStore((state) => state.mode);
    const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [curUser, setCurUser] = useState<CurUser | null>(null);
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [reload, setReload] = useState(true);
    const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return;
            try {
                const res = await axios.get(`${import.meta.env.VITE_BASE_ADMIN_URL}user/${userId}`, {
                    withCredentials: true,
                });
                setCurUser(res.data.user);
            } catch (err) {
                console.error("Failed to fetch user:", err);
                toast.error("Failed to fetch user.");
            }
        };
        fetchUser();
        // Fetch current logged-in user id
        const fetchCurUser = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BASE_ADMIN_URL}users`, { withCredentials: true });
                setLoggedInUserId(res.data.curUser);
            } catch {
                setLoggedInUserId(null);
            }
        };
        fetchCurUser();
    }, [userId, reload]);

    const deleteFn = async (userId: string) => {
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
                await axios.put(
                    `${import.meta.env.VITE_BASE_ADMIN_URL}user/delete/${userId}`,
                    {},
                    { withCredentials: true } // config goes here
                );
                toast.success("Account deleted successfully");
                setReload(!reload);
            } catch {
                toast.error("Delete Account failed. Please try again.");
            }
        }
    };

    return (

        <div className="sm:!p-10 !p-5 min-h-[calc(100dvh-75px)] bg-primaryBg flex flex-col gap-3 sm:gap-6 w-full justify-start py-10 px-2 bg-[radial-gradient(ellipse_at_50%_50%,_#f3f4f6_0%,_#f9fafb_100%)] dark:bg-[radial-gradient(ellipse_at_70%_30%,_#23283b_0%,_#10131a_100%)]">
            {isImageOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center dark:bg-black/70 bg-white/70"
                    onClick={() => setIsImageOpen(false)}
                >
                    <div
                        className="sm:max-w-3xl sm:max-h-[90vh] p-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={`${import.meta.env.VITE_TEBI_PUBLIC_URL}merndemo/users/${curUser?.imgUrl}`}
                            alt="Full Image"
                            className="max-w-full max-h-[80vh] object-contain rounded-lg"
                        />
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between flex-wrap gap-1.5 sm:gap-3">
                <h2 className="text-xl sm:text-3xl font-bold dark:bg-gradient-to-r dark:from-primary dark:to-btnGrFromHover bg-[linear-gradient(92.77deg,#080C1D_7.73%,#7E808C_99.72%)] bg-clip-text text-transparent select-none flex gap-2 items-center">
                    <span
                        className="font-normal cursor-pointer hover:underline"
                        onClick={() => navigate("/admin/user-list")}
                    >
                        User List
                    </span>
                    <ChevronRight size={24} className="inline-block self-end text-gray-600 dark:text-blue-400" />
                    <span className="">User Detail</span>
                </h2>
                {/* Optionally, add a search or action bar here if needed */}
            </div>
            {curUser && (
                <div className="flex flex-col lg:flex-row gap-3 sm:gap-6">
                    {/* Left Card */}
                    <div className="w-full lg:w-1/3 group border border-btnGrFromLight dark:border-darkBorder rounded-xl shadow-sm p-4 sm:p-6 flex flex-col items-center gap-4 justify-center bg-bgLight dark:bg-darkBorder hover:bg-btnGrFromLight dark:hover:bg-primaryBg/60 transition-all">
                        {curUser.imgUrl ? (
                            <>
                                <img
                                    src={`${import.meta.env.VITE_TEBI_PUBLIC_URL}merndemo/users/${curUser.imgUrl}`}
                                    alt="User"
                                    className="sm:w-28 w-14 h-14 sm:h-28 rounded-full object-cover border border-blue-400 cursor-pointer transition-all"
                                    onClick={() => setIsImageOpen(true)}
                                />
                                {/* Dialog omitted for brevity */}
                            </>
                        ) : (
                            <div className="sm:w-28 w-16 h-16 sm:h-28 bg-blue-200 dark:bg-blue-900 rounded-full flex items-center justify-center group-hover:bg-blue-300 dark:group-hover:bg-blue-800">
                                <User size={48} className="text-blue-600 dark:text-blue-300" />
                            </div>
                        )}
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-blue-100">
                                {curUser.firstName} {curUser.lastName}
                            </h2>
                            <p className="text-gray-600 dark:text-blue-300">{curUser.email}</p>
                            <p className="capitalize text-sm text-gray-500 dark:text-blue-400">{curUser.role}</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${curUser.status === "active"
                                ? "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-300"
                                }`}>
                                {curUser.status}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => navigate(`/admin/add-edit-user/${curUser._id}`)}
                                title="Edit"
                                disabled={curUser.status === "delete" || curUser._id === loggedInUserId}
                            >
                                <Edit size={16} /> Edit
                            </button>
                            <button
                                className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteFn(curUser._id);
                                }}
                                title="Delete"
                                disabled={curUser.role === "admin"}
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                            <button
                                className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded bg-gray-600 hover:bg-gray-700 text-white text-xs sm:text-sm font-medium transition"
                                onClick={() => navigate(`/admin/user/activity-log/${curUser._id}`)}
                                title="Activity Log"
                            >
                                <List size={16} /> Activity Log
                            </button>
                        </div>
                    </div>

                    {/* Right Info Section */}
                    <div className="w-full lg:w-2/3 flex flex-col gap-6 self-stretch">
                        <div className="bg-bgLight dark:bg-darkBorder border border-btnGrFromLight dark:border-darkBorder rounded-xl shadow-sm p-6 space-y-4 hover:bg-btnGrFromLight dark:hover:bg-primaryBg/60 transition-all flex flex-col gap-3 sm:gap-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-blue-200 border-b pb-2 flex items-center gap-2">
                                <Mail size={18} className="text-blue-500 dark:text-blue-400" /> Account Info
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                                <div className="flex items-center gap-2 text-gray-600 dark:text-blue-400">
                                    <Mail size={16} />
                                    <span className="font-medium">Email:</span>
                                    <span className="text-gray-800 dark:text-blue-100">{curUser.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-blue-400">
                                    <UserCheck size={16} />
                                    <span className="font-medium">Role:</span>
                                    <span className="text-gray-800 dark:text-blue-100">{curUser.role}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-blue-400">
                                    <CalendarDays size={16} />
                                    <span className="font-medium">Created:</span>
                                    <span className="text-gray-800 dark:text-blue-100">{new Date(curUser.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-blue-400">
                                    <Clock size={16} />
                                    <span className="font-medium">Updated:</span>
                                    <span className="text-gray-800 dark:text-blue-100">{new Date(curUser.updatedAt).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-blue-400">
                                    <Phone size={16} />
                                    <span className="font-medium">Phone:</span>
                                    <span className="text-gray-800 dark:text-blue-100">{curUser.phoneNo}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-blue-400">
                                    <MapPin size={16} />
                                    <span className="font-medium">Location:</span>
                                    <span className="text-gray-800 dark:text-blue-100">{curUser.location}</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-lg bg-btnGrFromLight dark:bg-primaryBg border border-btnGrToLight dark:border-darkBorder flex items-center gap-4">
                                <Info size={20} className="text-blue-500 dark:text-blue-400" />
                                <div>
                                    <div className="text-gray-800 dark:text-blue-100 font-semibold">This is your profile overview.</div>
                                    <div className="text-gray-600 dark:text-blue-300 text-sm">
                                        You can review your account details here. Use the buttons on the left to update your information, delete your account, or view your activity log.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
