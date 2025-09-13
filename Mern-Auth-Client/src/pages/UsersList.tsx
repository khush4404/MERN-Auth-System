import axios from "axios";
import { MoreVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { Pagination } from "../component/common/Pagination";
import { ArrowUp, ArrowDown, ArrowUpDown, Search, X } from "lucide-react";
import Input from "../utils/Input";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Select from "../utils/Select";
import DropdownMenu from "../utils/DropdownMenu";
import { toast } from "../utils/toast";
import { Button } from "../utils/Button";
import { useThemeStore } from "../store/themeStore";
import type { User } from "../types/UserTypes";

export const UserList = () => {
    const mode = useThemeStore((state) => state.mode);
    const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);


    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [curUser, setCurUser] = useState();
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [dataPerPage, setDataPerPage] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [sortField, setSortField] = useState<string | null>('firstName');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [reload, setReload] = useState(true);
    const [totalUsers, setTotalUsers] = useState();


    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 1000); // 1 second delay

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);


    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
        setCurrentPage(1);
    };


    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${import.meta.env.VITE_BASE_ADMIN_URL}users`, {
                    withCredentials: true,
                    params: {
                        page: currentPage,
                        limit: dataPerPage,
                        sortField,
                        sortOrder,
                        searchTerm: debouncedSearchTerm,
                        filterRole,
                        filterStatus
                    },
                });
                setUsers(res.data.users);
                setCurUser(res.data.curUser);
                setTotalPages(res.data.totalPages);
                setTotalUsers(res.data.totalUsers)
            } catch (err) {
                console.error("Failed to fetch users:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [currentPage, dataPerPage, sortField, sortOrder, debouncedSearchTerm, filterStatus, filterRole, reload]);

    const deleteFn = async (userId: string) => {
        const result = await Swal.fire({
            title: `<span style="color:${isDark ? "#fff" : "#000"};font-weight:bold;font-size:1.3rem">Are you absolutely sure?</span>`,
            html: `<span style="color:${isDark ? "#b0b3c6" : "#4a4a4a"}">This action will delete your account. You cannot undo this!</span>`,
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


    const SkeletonRow = () => (
        <tr className="animate-pulse">
            {/* Profile */}
            <td className="w-36 px-6 py-3">
                <div className="w-8 h-8 rounded-full bg-btnGrFromLight" />
            </td>

            {/* First Name */}
            <td className="w-36 px-6 py-3">
                <div className="h-4 w-24 bg-btnGrFromLight rounded" />
            </td>

            {/* Last Name */}
            <td className="w-36 px-6 py-3">
                <div className="h-4 w-24 bg-btnGrFromLight rounded" />
            </td>

            {/* Email */}
            <td className="w-60 px-6 py-3">
                <div className="h-4 w-48 bg-btnGrFromLight rounded" />
            </td>

            {/* Role */}
            <td className="w-28 px-6 py-3">
                <div className="h-4 w-16 bg-btnGrFromLight rounded" />
            </td>

            {/* Status */}
            <td className="w-32 px-6 py-3">
                <div className="h-6 w-20 bg-btnGrFromLight rounded-full" />
            </td>

            {/* Actions */}
            <td className="w-32 px-6 py-3">
                <div className="flex gap-3">
                    <div className="w-5 h-5 bg-btnGrFromLight rounded" />
                    <div className="w-5 h-5 bg-btnGrFromLight rounded" />
                </div>
            </td>
        </tr>
    );


    const getStatusStyle = (status: string) => {
        switch (status) {
            case "active": return "bg-green-100 text-green-800";
            case "inActive": return "bg-yellow-100 text-yellow-800";
            case "delete": return "bg-red-100 text-red-800";
            default: return "bg-bgLight text-gray-600";
        }
    };

    return (
        <div className="sm:p-10 p-5 gap-4 sm:gap-5 min-h-[calc(100dvh-75px)] flex flex-col text-gray-900 dark:text-white bg-[radial-gradient(ellipse_at_50%_50%,_#f3f4f6_0%,_#f9fafb_100%)] dark:bg-[radial-gradient(ellipse_at_70%_30%,_#23283b_0%,_#10131a_100%)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-6">
                {/* Title */}
                <h2 className="sm:text-3xl text-xl font-bold dark:bg-gradient-to-r dark:from-textGrFrom dark:to-textGrTo bg-[linear-gradient(92.77deg,#080C1D_7.73%,#7E808C_99.72%)] bg-clip-text text-transparent select-none text-center sm:text-start">User List</h2>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative w-full sm:w-72">
                        <Input
                            type="text"
                            name="searchVal"
                            placeholder="Search by Name and E-mail"
                            className="w-full !pl-12 pr-4 py-3 rounded-lg text-lg border border-btnGrFromLight dark:border-darkBorder bg-bgLight dark:bg-darkBorder text-gray-900 dark:text-blue-200 focus:ring-2 dark:focus:ring-blue-400 focus:ring-btnGrToLight dark:focus:border-blue-400 placeholder-textGrayMedium dark:placeholder-gray-500 !mt-0"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textGrayMedium dark:text-blue-400 z-10" size={22} />
                        {searchTerm && (
                            <X
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-blue-400 cursor-pointer z-10"
                                size={22}
                                onClick={() => setSearchTerm("")}
                            />
                        )}
                    </div>
                    <Button onClick={() => navigate(`/admin/add-edit-user`)} text="Add User" className="sm:w-auto py-3 px-8" />
                </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-3">
                    <label htmlFor="per-page" className="font-medium text-black-600 dark:text-blue-200 whitespace-nowrap sm:text-base text-sm">Per page:</label>
                    <div className="relative sm:w-28 w-auto">
                        <Select
                            name="perPage"
                            items={[5, 10, 20, 50, 100].map((v) => ({ value: v.toString(), text: `${v}` }))}
                            value={[dataPerPage.toString()]}
                            onChange={(val) => {
                                setDataPerPage(Number(val[0]));
                                setCurrentPage(1);
                            }}
                            className="sm:!w-24 !w-16 sm:!px-4 !px-2 !py-2 !rounded-lg bg-bgLight dark:bg-darkBorder text-gray-900 dark:text-blue-200 border border-btnGrFromLight dark:border-darkBorder focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors duration-300"
                            error={undefined}
                        />
                    </div>
                </div>
                <span className="text-black-600 dark:text-blue-200 ml-auto sm:text-base text-sm">
                    Showing {(currentPage - 1) * dataPerPage + 1} to {Math.min(currentPage * dataPerPage, totalUsers || 0)} of {totalUsers || 0} users
                </span>
            </div>

            <div className="rounded-lg bg-bgLight dark:bg-darkBorder shadow-sm border border-btnGrFromLight dark:border-darkBorder -mt-2 overflow-x-auto">
                <table className="min-w-[800px] w-full border-collapse text-sm md:text-base">
                    <thead className="block w-full sticky top-0 z-10 bg-btnGrFromLight dark:bg-primaryBg">
                        <tr className="flex w-full justify-between">
                            <th className="flex-[0_0_140px] md:flex-[0_0_150px] px-3 md:px-6 py-2 md:py-2 text-left font-semibold dark:text-blue-200">
                                Profile
                            </th>

                            <th
                                onClick={() => handleSort('firstName')}
                                className="flex-[0_0_140px] md:flex-[0_0_150px] px-3 md:px-6 py-2 md:py-2 text-left font-semibold text-black-600 dark:text-blue-200 cursor-pointer select-none"
                            >
                                <div className="flex items-center gap-1">
                                    FirstName
                                    {sortField === 'firstName' ? (
                                        sortOrder === 'asc' ? <ArrowUp className="w-4 h-4 dark:text-blue-400" /> : <ArrowDown className="w-4 h-4 dark:text-blue-400" />
                                    ) : (
                                        <ArrowUpDown className="w-4 h-4 dark:text-blue-400/40" />
                                    )}
                                </div>
                            </th>

                            <th
                                onClick={() => handleSort('lastName')}
                                className="flex-[0_0_140px] md:flex-[0_0_150px] px-3 md:px-6 py-2 md:py-2 text-left font-semibold text-black-600 dark:text-blue-200 cursor-pointer select-none"
                            >
                                <div className="flex items-center gap-1">
                                    LastName
                                    {sortField === 'lastName' ? (
                                        sortOrder === 'asc' ? <ArrowUp className="w-4 h-4 dark:text-blue-400" /> : <ArrowDown className="w-4 h-4 dark:text-blue-400" />
                                    ) : (
                                        <ArrowUpDown className="w-4 h-4 dark:text-blue-400/40" />
                                    )}
                                </div>
                            </th>

                            <th
                                onClick={() => handleSort('email')}
                                className="flex-[0_0_200px] md:flex-[0_0_240px] px-3 md:px-6 py-2 md:py-2 text-left font-semibold text-black-600 dark:text-blue-200 cursor-pointer select-none"
                            >
                                <div className="flex items-center gap-1">
                                    Email
                                    {sortField === 'email' ? (
                                        sortOrder === 'asc' ? <ArrowUp className="w-4 h-4 dark:text-blue-400" /> : <ArrowDown className="w-4 h-4 dark:text-blue-400" />
                                    ) : (
                                        <ArrowUpDown className="w-4 h-4 dark:text-blue-400/40" />
                                    )}
                                </div>
                            </th>

                            <th className="flex-[0_0_120px] md:flex-[0_0_140px] px-3 md:px-6 py-2 md:py-2 text-left font-semibold text-blue-600 dark:text-blue-200">
                                <Select
                                    openClass="!w-35"
                                    name="Role"
                                    items={[
                                        { value: "", text: filterRole === "" ? "Role" : "All" },
                                        { value: "admin", text: "Admin" },
                                        { value: "user", text: "User" },
                                    ]}
                                    value={[filterRole]}
                                    onChange={(val) => {
                                        setFilterRole(val[0]);
                                        setCurrentPage(1);
                                    }}
                                    className="border-none !bg-btnGrFromLight dark:!bg-primaryBg text-blue-600 dark:text-blue-200 w-full !pl-0 !pr-4 !py-0 !rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors duration-300"
                                    error={undefined}
                                />
                            </th>

                            <th className="flex-[0_0_120px] md:flex-[0_0_140px] px-3 md:px-6 py-2 md:py-2 text-left font-semibold text-blue-600 dark:text-blue-200">
                                <Select
                                    name="Status"
                                    openClass="!w-35"
                                    items={[
                                        { value: "", text: filterStatus === "" ? "Status" : "All" },
                                        { value: "active", text: "Active" },
                                        { value: "inActive", text: "Inactive" },
                                        { value: "delete", text: "Deleted" },
                                    ]}
                                    value={[filterStatus]}
                                    onChange={(val) => {
                                        setFilterStatus(val[0]);
                                        setCurrentPage(1);
                                    }}
                                    className="border-none !bg-btnGrFromLight dark:!bg-primaryBg text-blue-600 dark:text-blue-200 w-full !pl-0 !pr-4 !py-0 !rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors duration-300"
                                    error={undefined}
                                />
                            </th>

                            <th className="flex-[0_0_100px] md:flex-[0_0_120px] px-3 md:px-6 py-2 md:py-2 font-semibold text-black-600 dark:text-blue-200 text-center">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="block w-full h-[244px] overflow-y-scroll scrollbar-thin divide-y divide-btnGrFromLight dark:divide-darkBorder bg-bgLight dark:bg-darkBorder hide-scrollbar">
                        {loading ? (
                            Array.from({ length: dataPerPage }).map((_, index) => <SkeletonRow key={index} />)
                        ) : users.length > 0 ? (
                            users.map((user, index) => (
                                <tr
                                    key={index}
                                    className="flex w-full dark:hover:bg-primaryBg hover:bg-btnGrFromLight transition-all cursor-pointer group justify-between items-center"
                                    onClick={() => navigate(`/admin/user/${user._id}`)}
                                >
                                    <td className="flex-[0_0_140px] md:flex-[0_0_150px] px-3 md:px-6 py-2 md:py-2">
                                        {user.imgUrl ? (
                                            <img
                                                src={`${import.meta.env.VITE_TEBI_PUBLIC_URL}merndemo/users/${user.imgUrl}`}
                                                alt="User"
                                                className="w-8 h-8 rounded-sm object-cover border border-blue-400 group-hover:border-gray-500 dark:group-hover:border-primary transition-colors duration-300"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-sm bg-btnGrFromLight dark:bg-blue-900 text-black-600 dark:text-blue-200 flex items-center justify-center font-bold text-xs uppercase border border-blue-400 group-hover:border-gray-500 dark:group-hover:border-primary transition-colors duration-300">
                                                {user.firstName?.[0]}
                                            </div>
                                        )}
                                    </td>

                                    <td className="flex-[0_0_140px] md:flex-[0_0_150px] px-3 md:px-6 py-2 md:py-2 truncate">{user.firstName}</td>
                                    <td className="flex-[0_0_140px] md:flex-[0_0_150px] px-3 md:px-6 py-2 md:py-2 truncate">{user.lastName}</td>
                                    <td className="flex-[0_0_200px] md:flex-[0_0_240px] px-3 md:px-6 py-2 md:py-2 truncate">{user.email}</td>
                                    <td className="flex-[0_0_120px] md:flex-[0_0_140px] px-3 md:px-6 py-2 md:py-2 truncate">{user.role}</td>
                                    <td className="flex-[0_0_120px] md:flex-[0_0_140px] px-3 md:px-6 py-2 md:py-2">
                                        <span className={`px-2 md:px-3 py-1 rounded text-xs md:text-sm font-semibold ${getStatusStyle(user.status)} group-hover:ring-1 transition-all duration-300`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="flex-[0_0_100px] md:flex-[0_0_120px] px-3 md:px-6 py-2 md:py-2 text-center relative z-10">
                                        <DropdownMenu
                                            align="end"
                                            trigger={
                                                <button className="p-1 rounded-sm bg-btnGrFromLight dark:bg-primaryBg hover:bg-textGrayMedium dark:hover:bg-primary border-none focus:outline-none cursor-pointer transition-colors duration-300">
                                                    <MoreVertical size={14} className="dark:text-blue-400" />
                                                </button>
                                            }
                                            items={[
                                                ...(user.status !== "delete" && curUser !== user._id
                                                    ? [
                                                        {
                                                            label: "Edit",
                                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                            onClick: (e: any) => {
                                                                e.stopPropagation();
                                                                navigate(`/admin/add-edit-user/${user._id}`);
                                                            },
                                                        },
                                                    ]
                                                    : []),
                                                ...(user.role !== "admin" && user.status !== "delete"
                                                    ? [
                                                        {
                                                            label: "Delete",
                                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                            onClick: (e: any) => {
                                                                e.stopPropagation();
                                                                deleteFn(user._id);
                                                            },
                                                        },
                                                    ]
                                                    : []),
                                                {
                                                    label: "Activity Log",
                                                    onClick: (e) => {
                                                        e.stopPropagation();
                                                        navigate(`/admin/user/activity-log/${user._id}`);
                                                    },
                                                },
                                            ]}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr className="flex w-full">
                                <td colSpan={7} className="flex-1 px-3 md:px-6 py-6 text-center text-gray-800 dark:text-blue-400">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>


            {users.length > 0 && (
                <div className="flex justify-center">
                    <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        className=""
                    />
                </div>
            )}
        </div >

    );
};
