import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, Calendar, FileDown, X, TrendingUp, ShoppingBag, Users, Search, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const AdminTour = () => {
    const navigate = useNavigate();
    const [tours, setTours] = useState([]);
    const [stats, setStats] = useState({ totalRevenue: 0, totalBookings: 0, totalCustomers: 0 });
    const [loading, setLoading] = useState(true);

    // --- STATES CHO MODALS ---
    const [showTourModal, setShowTourModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedTour, setSelectedTour] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // --- STATES CHO BỘ LỌC (SEARCH & FILTER) ---
    const [filter, setFilter] = useState({
        dest: '', min: '', max: '', start: '', end: '', sort: 'newest'
    });

    // --- STATES CHO FORM DỮ LIỆU ---
    const [newTour, setNewTour] = useState({
        tourCode: '', tourName: '', destination: '', basePrice: '',
        description: '', tourType: 'DOMESTIC', durationDays: 1
    });
    const [newSchedule, setNewSchedule] = useState({
        departureDate: '', returnDate: '', maxSlots: 20, price: ''
    });

    // --- GỌI API LẤY DỮ LIỆU BAN ĐẦU ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const [tourRes, statsRes] = await Promise.all([
                api.get('/tours'),
                api.get('/admin/stats')
            ]);
            setTours(tourRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // --- XỬ LÝ LỌC TOUR (ADVANCED SEARCH) ---
    const handleFilter = async () => {
        setLoading(true);
        try {
            const res = await api.get('/tours/search', {
                params: {
                    keyword: filter.dest || undefined,
                    minPrice: filter.min || undefined,
                    maxPrice: filter.max || undefined,
                    startDate: filter.start || undefined,
                    endDate: filter.end || undefined,
                    sortBy: filter.sort
                }
            });
            setTours(res.data);
        } catch (error) {
            console.error("Lỗi lọc dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    // --- XỬ LÝ TẠO TOUR + UPLOAD ẢNH ---
    const handleCreateTour = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...newTour,
                basePrice: parseFloat(newTour.basePrice),
                durationDays: parseInt(newTour.durationDays)
            };
            const tourRes = await api.post('/tours', payload);
            const tourId = tourRes.data.tourId;

            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                await api.post(`/tours/${tourId}/upload`, formData);
            }
            alert("Tạo Tour và Upload ảnh thành công!");
            setShowTourModal(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi tạo tour. Kiểm tra lại dữ liệu.");
        }
    };

    // --- XỬ LÝ THÊM LỊCH TRÌNH ---
    const handleCreateSchedule = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/tours/${selectedTour.tourId}/schedules`, {
                ...newSchedule,
                maxSlots: parseInt(newSchedule.maxSlots),
                price: parseFloat(newSchedule.price)
            });
            alert("Đã thêm lịch khởi hành!");
            setShowScheduleModal(false);
            fetchData();
        } catch (error) {
            alert("Lỗi khi thêm lịch trình");
        }
    };

    // --- XỬ LÝ XUẤT EXCEL ---
    const handleExportExcel = (tour) => {
        const scheduleId = prompt(`Nhập mã Lịch trình (Schedule ID) của tour "${tour.tourName}":`);
        if (scheduleId) {
            const token = localStorage.getItem('token');
            window.open(`http://localhost:8080/api/admin/tours/schedules/${scheduleId}/export?access_token=${token}`, '_blank');
        }
    };

    if (loading && tours.length === 0) return <div className="p-20 text-center font-black text-gray-300 animate-pulse uppercase text-2xl">Đang tải quản trị...</div>;

    return (
        <div className="space-y-10">
            {/* 1. HEADER */}
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Quản lý Kho Tour</h1>
                    <p className="text-gray-400 font-medium">Tìm kiếm, lọc và cập nhật hành trình du lịch</p>
                </div>
                <button onClick={() => setShowTourModal(true)} className="bg-black text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-600 transition-all shadow-xl flex items-center gap-2 active:scale-95">
                    <Plus /> TẠO TOUR MỚI
                </button>
            </header>

            {/* 2. BỘ LỌC NÂNG CAO (ADVANCED SEARCH) */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
                <div className="col-span-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Tìm kiếm</label>
                    <input
                        className="w-full p-3 bg-gray-50 rounded-xl mt-1 text-sm font-bold outline-none focus:ring-1"
                        placeholder="Tên tour hoặc địa danh..."  // Sửa placeholder cho rõ nghĩa
                        value={filter.dest}
                        onChange={e => setFilter({...filter, dest: e.target.value})}
                    />
                </div>
                <div className="col-span-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Từ ngày</label>
                    <input type="date" className="w-full p-3 bg-gray-50 rounded-xl mt-1 text-sm font-bold" value={filter.start} onChange={e => setFilter({...filter, start: e.target.value})} />
                </div>
                <div className="col-span-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Đến ngày</label>
                    <input type="date" className="w-full p-3 bg-gray-50 rounded-xl mt-1 text-sm font-bold" value={filter.end} onChange={e => setFilter({...filter, end: e.target.value})} />
                </div>
                <div className="col-span-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Sắp xếp</label>
                    <select className="w-full p-3 bg-gray-50 rounded-xl mt-1 text-sm font-black text-blue-600" value={filter.sort} onChange={e => setFilter({...filter, sort: e.target.value})}>
                        <option value="newest">Mới nhất</option>
                        <option value="price_asc">Giá tăng dần</option>
                        <option value="price_desc">Giá giảm dần</option>
                    </select>
                </div>
                <button onClick={handleFilter} className="bg-gray-100 text-gray-800 p-3.5 rounded-xl font-black text-xs hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2">
                    <Filter size={16} /> LỌC DỮ LIỆU
                </button>
                <button onClick={() => {setFilter({dest:'',min:'',max:'',start:'',end:'',sort:'newest'}); fetchData();}} className="bg-red-50 text-red-500 p-3.5 rounded-xl font-black text-xs hover:bg-red-500 hover:text-white transition-all">
                    XÓA LỌC
                </button>
            </div>

            {/* 3. THỐNG KÊ NHANH */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <p className="text-gray-400 text-[10px] font-black uppercase mb-1 tracking-widest">Doanh thu xác nhận</p>
                    <p className="text-3xl font-black text-blue-600">{new Intl.NumberFormat('vi-VN').format(stats.totalRevenue)}đ</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <ShoppingBag className="mb-2 text-orange-500" />
                    <p className="text-gray-400 text-[10px] font-black uppercase mb-1 tracking-widest">Đơn hoàn tất</p>
                    <p className="text-3xl font-black text-gray-800">{stats.totalBookings}</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <Users className="mb-2 text-green-500" />
                    <p className="text-gray-400 text-[10px] font-black uppercase mb-1 tracking-widest">Khách hàng</p>
                    <p className="text-3xl font-black text-gray-800">{stats.totalCustomers}</p>
                </div>
            </div>

            {/* 4. BIỂU ĐỒ - FIX HEIGHT/WIDTH */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 h-96">
                <h3 className="font-black text-gray-800 uppercase text-xs mb-8 flex items-center gap-2 tracking-widest">
                    <TrendingUp size={18} className="text-blue-600" /> Biểu đồ doanh thu thực tế
                </h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[{ name: 'Tháng này', revenue: stats.totalRevenue }]}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Bar dataKey="revenue" fill="#2563eb" radius={[10, 10, 0, 0]} barSize={80} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 5. BẢNG DANH SÁCH TOUR */}
            <div className="bg-white rounded-[3rem] shadow-sm overflow-hidden border border-gray-100">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b">
                    <tr>
                        <th className="p-8 font-black text-gray-400 text-[10px] uppercase">Thông tin Tour</th>
                        <th className="p-8 font-black text-gray-400 text-[10px] uppercase text-center">Quản trị</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                    {tours.map(t => (
                        <tr key={t.tourId} className="hover:bg-blue-50/20 transition-all duration-300 group">
                            <td className="p-8">
                                <div className="flex items-center gap-6 cursor-pointer" onClick={() => navigate(`/admin/tours/${t.tourId}`)}>
                                    <div className="w-20 h-20 rounded-3xl bg-gray-100 overflow-hidden shadow-inner flex-shrink-0">
                                        <img src={t.imageUrl || 'https://placehold.co/200x200?text=Tour'} className="w-full h-full object-cover group-hover:scale-110 transition-all" />
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-800 text-xl tracking-tight leading-tight">{t.tourName}</p>
                                        <p className="text-xs font-bold text-blue-500 uppercase mt-1 tracking-widest">{t.tourCode} • {t.destination}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-8 text-center">
                                <div className="flex justify-center gap-3">
                                    <button onClick={() => { setSelectedTour(t); setShowScheduleModal(true); }} className="p-3 bg-orange-50 text-orange-600 rounded-2xl hover:bg-orange-600 hover:text-white transition-all shadow-sm" title="Thêm lịch">
                                        <Calendar size={20} />
                                    </button>
                                    <button onClick={() => handleExportExcel(t)} className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-sm" title="Xuất Excel">
                                        <FileDown size={20} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* --- MODALS --- */}

            {/* MODAL TẠO TOUR */}
            {showTourModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between mb-8"><h2 className="text-3xl font-black uppercase tracking-tighter italic text-blue-600">Thiết kế Tour mới</h2><button onClick={() => setShowTourModal(false)}><X className="text-gray-400" /></button></div>
                        <form onSubmit={handleCreateTour} className="grid grid-cols-2 gap-6">
                            <input className="p-4 bg-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="Mã Tour (PQ-001)" onChange={e => setNewTour({...newTour, tourCode: e.target.value})} required />
                            <input className="p-4 bg-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tên Tour" onChange={e => setNewTour({...newTour, tourName: e.target.value})} required />
                            <input className="p-4 bg-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="Điểm đến" onChange={e => setNewTour({...newTour, destination: e.target.value})} required />
                            <input className="p-4 bg-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" type="number" placeholder="Số ngày đi" onChange={e => setNewTour({...newTour, durationDays: e.target.value})} required />
                            <input className="p-4 bg-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" type="number" placeholder="Giá cơ bản" onChange={e => setNewTour({...newTour, basePrice: e.target.value})} required />
                            <select className="p-4 bg-gray-100 rounded-2xl font-bold outline-none" onChange={e => setNewTour({...newTour, tourType: e.target.value})}>
                                <option value="DOMESTIC">Trong nước</option>
                                <option value="INTERNATIONAL">Quốc tế</option>
                            </select>
                            <div className="col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Tải ảnh đại diện</label>
                                <input type="file" className="w-full p-4 bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl mt-1 font-bold" onChange={(e) => setSelectedFile(e.target.files[0])} />
                            </div>
                            <textarea className="col-span-2 p-4 bg-gray-100 rounded-2xl h-24 font-medium" placeholder="Mô tả về chuyến đi..." onChange={e => setNewTour({...newTour, description: e.target.value})}></textarea>
                            <button className="col-span-2 bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl transition-all uppercase tracking-widest">Hoàn tất & Lưu</button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL THÊM LỊCH TRÌNH */}
            {showScheduleModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[3rem] p-12 text-center shadow-2xl">
                        <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">Mở lịch khởi hành</h2>
                        <p className="text-blue-500 font-bold mb-8 italic">"{selectedTour?.tourName}"</p>
                        <form onSubmit={handleCreateSchedule} className="space-y-6 text-left">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Ngày đi</label><input type="date" className="w-full p-4 bg-gray-100 rounded-2xl font-bold" onChange={e => setNewSchedule({...newSchedule, departureDate: e.target.value})} required /></div>
                                <div><label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Ngày về</label><input type="date" className="w-full p-4 bg-gray-100 rounded-2xl font-bold" onChange={e => setNewSchedule({...newSchedule, returnDate: e.target.value})} required /></div>
                            </div>
                            <div><label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Số chỗ</label><input type="number" className="w-full p-4 bg-gray-100 rounded-2xl font-bold" placeholder="VD: 30" onChange={e => setNewSchedule({...newSchedule, maxSlots: e.target.value})} required /></div>
                            <div><label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Giá (VNĐ)</label><input type="number" className="w-full p-4 bg-gray-100 rounded-2xl font-bold" placeholder="Giá tour ngày này" onChange={e => setNewSchedule({...newSchedule, price: e.target.value})} required /></div>
                            <button className="w-full bg-black text-white py-5 rounded-2xl font-black hover:bg-blue-600 transition-all uppercase shadow-lg">Xác nhận mở lịch</button>
                            <button type="button" onClick={() => setShowScheduleModal(false)} className="w-full text-gray-400 font-bold mt-2 hover:text-gray-600 transition-colors uppercase text-sm tracking-widest">Hủy bỏ</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTour;