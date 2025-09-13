import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import Navbar from "../component/layout/Navbar";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

const revenueData = [
    { name: "Jan", revenue: 4000 },
    { name: "Feb", revenue: 3000 },
    { name: "Mar", revenue: 5000 },
    { name: "Apr", revenue: 7000 },
    { name: "May", revenue: 6000 },
    { name: "Jun", revenue: 8000 },
];

const usersData = [
    { name: "Jan", users: 240 },
    { name: "Feb", users: 139 },
    { name: "Mar", users: 380 },
    { name: "Apr", users: 410 },
    { name: "May", users: 300 },
    { name: "Jun", users: 500 },
];

const pieData = [
    { name: "Free", value: 400 },
    { name: "Basic", value: 300 },
    { name: "Pro", value: 300 },
    { name: "Enterprise", value: 200 },
];

const radarData = [
    { subject: "Sales", A: 120, fullMark: 150 },
    { subject: "Marketing", A: 98, fullMark: 150 },
    { subject: "Dev", A: 86, fullMark: 150 },
    { subject: "Support", A: 99, fullMark: 150 },
    { subject: "Admin", A: 85, fullMark: 150 },
];

const storageData = [
    { name: "Used", value: 65 },
    { name: "Free", value: 35 },
    { name: "Used", value: 65 },
    { name: "Free", value: 35 },
    { name: "Used", value: 65 },
    { name: "Free", value: 35 },
    { name: "Used", value: 65 },
    { name: "Free", value: 35 },
];


export const Dashboard = () => {
    return (
        <>
            <Navbar />
            {/* Main Content */}
            <div className="w-full flex flex-col items-center justify-start py-5 sm:py-10 px-5 min-h-dvh text-gray-900 dark:text-white bg-[radial-gradient(ellipse_at_50%_50%,_#f3f4f6_0%,_#f9fafb_100%)] dark:bg-[radial-gradient(ellipse_at_70%_30%,_#23283b_0%,_#10131a_100%)]">
                <div className="w-full max-w-7xl grid lg:grid-cols-3 sm:grid-cols-2 gap-4 sm:gap-4">
                    <div className="dark:bg-primaryBg p-6 rounded-2xl shadow-sm border dark:border-darkBorder bg-[#f9fafb] border-btnGrFromLight">
                        <h2 className="text-lg font-bold mb-4 text-gray-500  dark:text-blue-300">Department Performance</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart data={radarData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" stroke="#b3b8d4" />
                                <PolarRadiusAxis stroke="#b3b8d4" />
                                <Radar name="Performance" dataKey="A" stroke="#3ddad7" fill="#3ddad7" fillOpacity={0.6} />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="dark:bg-primaryBg p-6 rounded-2xl shadow-sm border dark:border-darkBorder bg-[#f9fafb] border-btnGrFromLight  lg:col-span-2">
                        <h2 className="text-lg font-bold mb-4 text-gray-500  dark:text-blue-300">Monthly Revenue</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#23283b" />
                                <XAxis dataKey="name" stroke="#b3b8d4" />
                                <YAxis stroke="#b3b8d4" />
                                <Tooltip />
                                <Line type="monotone" dataKey="revenue" stroke="#6078ea" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="dark:bg-primaryBg p-6 rounded-2xl shadow-sm border dark:border-darkBorder bg-[#f9fafb] border-btnGrFromLight">
                        <h2 className="text-lg font-bold mb-4 text-gray-500  dark:text-blue-300">Subscription Plans</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" outerRadius={80} fill="#3ddad7" label>
                                    {pieData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="dark:bg-primaryBg p-6 rounded-2xl shadow-sm border dark:border-darkBorder bg-[#f9fafb] border-btnGrFromLight">
                        <h2 className="text-lg font-bold mb-4 text-gray-500  dark:text-blue-300">New Users</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={usersData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#23283b" />
                                <XAxis dataKey="name" stroke="#b3b8d4" />
                                <YAxis stroke="#b3b8d4" />
                                <Tooltip />
                                <Bar dataKey="users" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="dark:bg-primaryBg p-6 rounded-2xl shadow-sm border dark:border-darkBorder bg-[#f9fafb] border-btnGrFromLight">
                        <h2 className="text-lg font-bold mb-4 text-gray-500  dark:text-blue-300">Storage Usage</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={storageData}
                                    dataKey="value"
                                    innerRadius={60}
                                    outerRadius={80}
                                    startAngle={90}
                                    endAngle={-270}
                                    paddingAngle={3}
                                >
                                    {storageData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="text-center mt-2 text-base text-btnGrToLight dark:text-blue-200">
                            <span className="font-bold text-xl text-gray-500 dark:text-blue-400">{storageData[0].value}%</span> used
                        </div>
                    </div>

                    <div className="dark:bg-primaryBg p-6 rounded-2xl shadow-sm border dark:border-darkBorder overflow-x-auto bg-[#f9fafb] border-btnGrFromLight lg:col-span-2">
                        <h2 className="text-lg font-bold mb-4 text-gray-500  dark:text-blue-300">Recent Users</h2>
                        <table className="w-full table-auto text-sm">
                            <thead className="dark:bg-darkBorder bg-btnGrFromLight text-gray-600 dark:text-blue-200">
                                <tr>
                                    <th className="p-3 text-left">Name</th>
                                    <th className="p-3 text-left">Email</th>
                                    <th className="p-3 text-left">Plan</th>
                                    <th className="p-3 text-left">Signup Date</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-500 dark:text-blue-100">
                                {[
                                    {
                                        name: "Khush Vagadiya", email: "khush@example.com", plan: "Pro", date: "2025-06-20"
                                    },
                                    {
                                        name: "Sneha Patel", email: "sneha@example.com", plan: "Free", date: "2025-06-19"
                                    },
                                    {
                                        name: "Rahul Mehta", email: "rahul@example.com", plan: "Basic", date: "2025-06-18"
                                    }
                                ].map((user, i) => (
                                    <tr key={i} className="hover:bg-btnGrFromLight dark:hover:bg-darkBorder border-b border-btnGrFromLight dark:border-darkBorder">
                                        <td className="p-3">{user.name}</td>
                                        <td className="p-3">{user.email}</td>
                                        <td className="p-3">{user.plan}</td>
                                        <td className="p-3">{user.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="dark:bg-primaryBg p-6 rounded-2xl shadow-sm border dark:border-darkBorder overflow-x-auto bg-[#f9fafb] border-btnGrFromLight lg:col-span-1 sm:col-span-2">
                        <h2 className="text-lg font-bold mb-4 text-gray-500  dark:text-blue-300">Recent Orders</h2>
                        <table className="w-full table-auto text-sm">
                            <thead className="bg-btnGrFromLight dark:bg-darkBorder text-gray-600 dark:text-blue-200">
                                <tr>
                                    <th className="p-3 text-left">Order ID</th>
                                    <th className="p-3 text-left">Customer</th>
                                    <th className="p-3 text-left">Status</th>
                                    <th className="p-3 text-left">Total</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-500  dark:text-blue-100">
                                {[
                                    {
                                        id: "#1021", customer: "Aisha Khan", status: "Shipped", total: "$125.00"
                                    },
                                    {
                                        id: "#1022", customer: "John Deo", status: "Pending", total: "$89.99"
                                    },
                                    {
                                        id: "#1023", customer: "Meera Joshi", status: "Cancelled", total: "$54.00"
                                    }
                                ].map((order, i) => (
                                    <tr key={i} className="hover:bg-btnGrFromLight dark:hover:bg-darkBorder border-b border-btnGrFromLight dark:border-darkBorder">
                                        <td className="p-3">{order.id}</td>
                                        <td className="p-3">{order.customer}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === "Shipped" ? "bg-green-900 text-green-300"
                                                : order.status === "Pending" ? "bg-yellow-900 text-yellow-300"
                                                    : "bg-red-900 text-red-300"
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-3">{order.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};
