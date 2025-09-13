/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Search, X, ArrowUp, ArrowDown, ArrowUpDown, ChevronRight } from "lucide-react";
import Input from "../utils/Input";
import Select from "../utils/Select";
import { Pagination } from "../component/common/Pagination";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import TooltipCell from "../component/common/TooltipCell";
import { toast } from "../utils/toast";
import type { ActivityLog } from "../types/UserTypes";

const fieldMap: Record<string, string> = {
    _id: "_id",
    timestamp: "time",
    actionType: "action",
    actionDescription: "description",
    ipAddress: "IPAddress",
    deviceInfo: "device",
    activityBy: "user.firstName",
};

export const UserActivity = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();

    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [dataPerPage, setDataPerPage] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [sortField, setSortField] = useState<keyof ActivityLog>("timestamp");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [user, setUser] = useState<{ firstName: string; lastName: string; email: string }>({ firstName: "", lastName: "", email: "" });

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        const fetchLogs = async () => {
            if (!userId) return;
            setLoading(true);

            try {
                const res = await axios.get(`${import.meta.env.VITE_BASE_ADMIN_URL}activity/${userId}`, {
                    withCredentials: true,
                    params: {
                        page: currentPage,
                        limit: dataPerPage,
                        sortField: fieldMap[sortField],
                        sortOrder,
                        searchTerm: debouncedSearchTerm,
                    },
                });

                const transformedLogs: ActivityLog[] = res.data.logs.map((log: any) => ({
                    _id: log._id,
                    timestamp: log.time,
                    actionType: log.action,
                    actionDescription: log.description,
                    ipAddress: log.IPAddress,
                    deviceInfo: log.device,
                    activityBy: `${log.user?.firstName ?? "Unknown"} ${log.user?.lastName ?? ""}`,
                }));

                setLogs(transformedLogs);
                setTotalLogs(res.data.totalCount);
                setTotalPages(Math.ceil(res.data.totalCount / dataPerPage));
                setUser({
                    firstName: res.data.user.firstName || "",
                    lastName: res.data.user.lastName || "",
                    email: res.data.user.email || "",
                });
            } catch (err) {
                console.error("Failed to fetch logs:", err);
                toast.error("Failed to fetch activity logs.");
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [userId, currentPage, dataPerPage, debouncedSearchTerm, sortField, sortOrder]);

    const handleSort = (field: keyof ActivityLog) => {
        if (sortField === field) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const renderSortIcon = (field: keyof ActivityLog) => {
        if (sortField === field) {
            return sortOrder === "asc"
                ? <ArrowUp className="w-4 h-4 text-gray-900 dark:text-blue-400/40" />
                : <ArrowDown className="w-4 h-4 dark:text-blue-400/40" />;
        }
        return <ArrowUpDown className="w-4 h-4 dark:text-blue-400/40" />;
    };

    const SkeletonRow = () => (
        <tr className="animate-pulse h-[48px] sm:h-[57px]">
            {Array(6).fill(0).map((_, i) => (
                <td key={i} className="px-4 sm:px-6 py-3">
                    <div className="h-4 bg-btnGrFromLight rounded w-full max-w-[80%]" />
                </td>
            ))}
        </tr>
    );

    return (
        <div className="p-4 sm:p-6 md:p-8 min-h-[calc(100dvh-75px)] bg-[radial-gradient(ellipse_at_50%_50%,_#f3f4f6_0%,_#f9fafb_100%)] dark:bg-[radial-gradient(ellipse_at_70%_30%,_#23283b_0%,_#10131a_100%)] text-gray-900 dark:text-white flex flex-col gap-4.5">
            {/* Breadcrumb */}
            <div className="flex justify-between sm:flex-row flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2 text-lg sm:text-xl font-bold dark:bg-gradient-to-r dark:from-textGrFrom dark:to-textGrTo bg-[linear-gradient(92.77deg,#080C1D_7.73%,#7E808C_99.72%)] bg-clip-text text-transparent">
                    <span onClick={() => navigate('/admin/user-list')} className="cursor-pointer hover:underline">User List</span>
                    <ChevronRight size={20} className="text-gray-500 dark:text-blue-400" />
                    <span onClick={() => navigate(`/admin/user/${userId}`)} className="cursor-pointer hover:underline">User</span>
                    <ChevronRight size={20} className="text-gray-500 dark:text-blue-400" />
                    <span>Activity Log</span>
                </div>

                <div className="relative w-full sm:w-72">
                    <Input
                        name="searchVal"
                        type="text"
                        placeholder="Search by action or IP"
                        className="w-full !pl-12 pr-4 py-3 rounded-lg text-base sm:text-lg bg-bgLight dark:bg-darkBorder text-gray-900 dark:text-blue-200 placeholder-textGrayMedium dark:placeholder-gray-500 focus:ring-2 dark:focus:ring-blue-400 focus:ring-btnGrToLight"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textGrayMedium dark:text-blue-400 z-10" size={20} />
                    {searchTerm && (
                        <X
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-blue-400 cursor-pointer z-10"
                            size={20}
                            onClick={() => setSearchTerm("")}
                        />
                    )}
                </div>
            </div>

            {/* Filter/Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center flex-wrap">
                    <div className="flex items-center gap-2">
                        <label htmlFor="per-page" className="text-gray-700 dark:text-blue-200">Per page:</label>
                        <Select
                            name="perPage"
                            items={[1, 5, 10, 20, 50, 100].map((v) => ({ value: v.toString(), text: `${v}` }))}
                            value={[dataPerPage.toString()]}
                            onChange={(val) => {
                                setDataPerPage(Number(val[0]));
                                setCurrentPage(1);
                            }}
                            className="w-24 px-3 py-2 rounded-lg bg-bgLight dark:bg-darkBorder text-gray-900 dark:text-blue-200 border border-btnGrFromLight dark:border-darkBorder focus:ring-2 focus:ring-blue-400 transition-colors duration-300"
                            error={undefined}
                        />
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <span className="font-medium">{user.firstName} {user.lastName}</span>
                    <span className="text-gray-700 dark:text-blue-300">{user.email}</span>
                </div>
                <div className="flex flex-col sm:items-end text-sm sm:text-base">
                    <span className="text-gray-700 dark:text-blue-300 text-end">
                        Showing {(currentPage - 1) * dataPerPage + 1} to {Math.min(currentPage * dataPerPage, totalLogs)} of {totalLogs} logs
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-btnGrFromLight dark:border-darkBorder shadow-lg overflow-x-auto bg-bgLight dark:bg-darkBorder">
                <table className="min-w-[800px] w-full text-sm sm:text-base table-fixed">
                    <thead className="bg-btnGrFromLight dark:bg-primaryBg sticky top-0 z-10">
                        <tr>
                            {[
                                { label: "Timestamp", field: "timestamp" },
                                { label: "Action Type", field: "actionType" },
                                { label: "Action Description", field: "actionDescription" },
                                { label: "IP Address", field: "ipAddress" },
                                { label: "Device Info", field: "deviceInfo" },
                                { label: "Activity By", field: "activityBy" },
                            ].map(({ label, field }) => (
                                <th
                                    key={field}
                                    onClick={() => handleSort(field as keyof ActivityLog)}
                                    className="px-4 sm:px-6 py-3 text-left font-semibold dark:text-blue-200 cursor-pointer select-none"
                                >
                                    <div className="flex items-center gap-1">
                                        {label}
                                        {renderSortIcon(field as keyof ActivityLog)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-btnGrFromLight dark:divide-darkBorder bg-bgLight dark:bg-darkBorder">
                        {loading ? (
                            [...Array(dataPerPage)].map((_, index) => <SkeletonRow key={index} />)
                        ) : logs.length > 0 ? (
                            logs.map((log) => (
                                <tr key={log._id} className="hover:bg-btnGrFromLight dark:hover:bg-primaryBg transition-colors cursor-pointer group">
                                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                                        <TooltipCell value={new Date(log.timestamp).toLocaleString()} />
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                                        <TooltipCell value={log.actionType} />
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                                        <TooltipCell value={log.actionDescription} />
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                                        <TooltipCell value={log.ipAddress} />
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                                        <TooltipCell value={log.deviceInfo} />
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                                        <TooltipCell value={log.activityBy} />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-4 sm:px-6 py-6 text-center text-gray-800 dark:text-blue-400">
                                    No logs found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {logs.length > 0 && (
                <div className="flex justify-center">
                    <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                    />
                </div>
            )}
        </div>
    );
};
