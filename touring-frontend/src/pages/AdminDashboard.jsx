import { useEffect, useState } from "react";
import api from "../api/axios";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend
} from "recharts";

const COLORS = ["#2563eb", "#22c55e", "#f59e0b", "#ef4444", "#a855f7"];

const AdminDashboard = () => {

    const role = localStorage.getItem("role");

    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState(null);
    const [revenueMonthly, setRevenueMonthly] = useState([]);
    const [topTours, setTopTours] = useState([]);
    const [bookingStatus, setBookingStatus] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                const [
                    statsRes,
                    revenueRes,
                    toursRes,
                    statusRes,
                    recentRes
                ] = await Promise.all([
                    api.get("/admin/stats"),
                    api.get("/admin/revenue/monthly"),
                    api.get("/admin/tours/top"),
                    api.get("/admin/bookings/status"),
                    api.get("/admin/bookings/recent")
                ]);

                setStats(statsRes.data);
                setRevenueMonthly(revenueRes.data);
                setTopTours(toursRes.data);
                setBookingStatus(statusRes.data);
                setRecentBookings(recentRes.data);

            } catch (err) {

                console.error("Dashboard load error:", err);

            } finally {

                setLoading(false);

            }

        };

        loadDashboard();

    }, []);

    if (loading) {
        return (
            <div className="space-y-6">

                <div className="h-10 w-60 bg-gray-200 animate-pulse rounded-xl"></div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1,2,3].map(i => (
                        <div key={i} className="h-40 bg-gray-200 animate-pulse rounded-3xl"></div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1,2].map(i => (
                        <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-3xl"></div>
                    ))}
                </div>

            </div>
        );
    }

    const revenue = stats?.totalRevenue || 0;
    const bookings = stats?.totalBookings || 0;
    const customers = stats?.totalCustomers || 0;

    return (

        <div className="space-y-10">

            {/* TITLE */}

            <div>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                    Admin Dashboard
                </h1>

                <p className="text-gray-400 text-sm mt-1">
                    Tổng quan hệ thống quản lý tour
                </p>
            </div>


            {/* KPI */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                <div className="bg-blue-600 text-white p-10 rounded-[3rem] shadow-xl">

                    <p className="text-xs uppercase opacity-70 font-black">
                        Doanh thu
                    </p>

                    <p className="text-5xl font-black mt-3">
                        {new Intl.NumberFormat("vi-VN").format(revenue)}đ
                    </p>

                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">

                    <p className="text-xs text-gray-400 uppercase font-black">
                        Tour đã bán
                    </p>

                    <p className="text-5xl font-black mt-3">
                        {bookings}
                    </p>

                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">

                    <p className="text-xs text-gray-400 uppercase font-black">
                        Khách hàng
                    </p>

                    <p className="text-5xl font-black mt-3">
                        {customers}
                    </p>

                </div>

            </div>


            {/* CHARTS ROW 1 */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">


                {/* REVENUE MONTHLY */}

                <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm h-96">

                    <h3 className="text-xs uppercase text-gray-400 font-black mb-6">
                        Doanh thu theo tháng
                    </h3>

                    <ResponsiveContainer width="100%" height="100%">

                        <LineChart data={revenueMonthly}>

                            <CartesianGrid strokeDasharray="3 3"/>

                            <XAxis dataKey="month"/>

                            <YAxis/>

                            <Tooltip/>

                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#2563eb"
                                strokeWidth={3}
                            />

                        </LineChart>

                    </ResponsiveContainer>

                </div>


                {/* TOP TOURS */}

                <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm h-96">

                    <h3 className="text-xs uppercase text-gray-400 font-black mb-6">
                        Top tour bán chạy
                    </h3>

                    <ResponsiveContainer width="100%" height="100%">

                        <BarChart data={topTours}>

                            <CartesianGrid strokeDasharray="3 3"/>

                            <XAxis dataKey="tourName"/>

                            <YAxis/>

                            <Tooltip/>

                            <Bar
                                dataKey="totalBookings"
                                fill="#22c55e"
                                radius={[10,10,0,0]}
                            />

                        </BarChart>

                    </ResponsiveContainer>

                </div>

            </div>


            {/* CHARTS ROW 2 */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">


                {/* BOOKING STATUS */}

                <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm h-96">

                    <h3 className="text-xs uppercase text-gray-400 font-black mb-6">
                        Trạng thái booking
                    </h3>

                    <ResponsiveContainer width="100%" height="100%">

                        <PieChart>

                            <Pie
                                data={bookingStatus}
                                dataKey="value"
                                nameKey="status"
                                outerRadius={120}
                                label
                            >
                                {bookingStatus.map((entry, index) => (
                                    <Cell
                                        key={index}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>

                            <Tooltip/>

                            <Legend/>

                        </PieChart>

                    </ResponsiveContainer>

                </div>


                {/* REVENUE COMPARISON */}

                <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm h-96">

                    <h3 className="text-xs uppercase text-gray-400 font-black mb-6">
                        So sánh doanh thu
                    </h3>

                    <ResponsiveContainer width="100%" height="100%">

                        <BarChart data={revenueMonthly}>

                            <CartesianGrid strokeDasharray="3 3"/>

                            <XAxis dataKey="month"/>

                            <YAxis/>

                            <Tooltip/>

                            <Bar
                                dataKey="revenue"
                                fill="#2563eb"
                                radius={[10,10,0,0]}
                            />

                        </BarChart>

                    </ResponsiveContainer>

                </div>

            </div>


            {/* RECENT BOOKINGS */}

            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">

                <h3 className="text-xs uppercase text-gray-400 font-black mb-6">
                    Booking gần đây
                </h3>

                <table className="w-full text-sm">

                    <thead className="text-gray-400 text-xs uppercase">

                    <tr>

                        <th className="text-left py-3">Khách</th>

                        <th className="text-left">Tour</th>

                        <th className="text-left">Ngày</th>

                        <th className="text-left">Giá</th>

                        <th className="text-left">Trạng thái</th>

                    </tr>

                    </thead>

                    <tbody>

                    {recentBookings.map((b) => (

                        <tr key={b.bookingId} className="border-t">

                            <td className="py-3">{b.customerName}</td>

                            <td>{b.tourName}</td>

                            <td>{b.bookingDate}</td>

                            <td>
                                {new Intl.NumberFormat("vi-VN").format(b.totalPrice)}đ
                            </td>

                            <td>

                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100">
                    {b.status}
                  </span>

                            </td>

                        </tr>

                    ))}

                    </tbody>

                </table>

            </div>


            {/* QUICK ACTION */}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

                <button className="bg-blue-600 text-white p-6 rounded-xl font-bold hover:bg-blue-700 transition">
                    Tạo Tour
                </button>

                <button className="bg-gray-900 text-white p-6 rounded-xl font-bold hover:bg-black transition">
                    Tạo Voucher
                </button>

                <button className="bg-gray-100 p-6 rounded-xl font-bold hover:bg-gray-200">
                    Quản lý khách
                </button>

                <button className="bg-gray-100 p-6 rounded-xl font-bold hover:bg-gray-200">
                    Xem booking
                </button>

            </div>

        </div>

    );

};

export default AdminDashboard;