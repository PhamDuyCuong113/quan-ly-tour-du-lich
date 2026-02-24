import { useEffect, useState } from 'react';
import api from '../api/axios';
import {
    Plus, Calendar, FileDown, LayoutDashboard, Map,
    X, TrendingUp, Users, ShoppingBag, TicketPercent
} from 'lucide-react';

const Admin = () => {
    const [tours, setTours] = useState([]);
    const [stats, setStats] = useState({ totalRevenue: 0, totalBookings: 0, totalCustomers: 0 });
    const [loading, setLoading] = useState(true);

    // Trạng thái đóng mở các Modal
    const [showTourModal, setShowTourModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showPromoModal, setShowPromoModal] = useState(false);

    const [selectedTour, setSelectedTour] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // Form data cho Tour mới
    const [newTour, setNewTour] = useState({
        tourCode: '', tourName: '', destination: '', tourType: 'DOMESTIC',
        durationDays: 1, basePrice: '', description: ''
    });

    // Form data cho Lịch trình mới
    const [newSchedule, setNewSchedule] = useState({
        departureDate: '', returnDate: '', maxSlots: 20, price: ''
    });

    // Form data cho Mã giảm giá mới
    const [newPromo, setNewPromo] = useState({
        code: '', discountType: 'PERCENT', discountValue: 0,
        startDate: '', endDate: '', usageLimit: 10
    });

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
            console.error("Lỗi tải dữ liệu admin:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 1. Xử lý Tạo Tour + Upload ảnh tự động
    const handleCreateTour = async (e) => {
        e.preventDefault();
        try {
            // Bước A: Tạo Tour lấy ID
            const tourRes = await api.post('/tours', newTour);
            const tourId = tourRes.data.tourId;

            // Bước B: Nếu có chọn file ảnh, thực hiện upload luôn
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                await api.post(`/tours/${tourId}/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            alert("Tạo Tour và cập nhật hình ảnh thành công!");
            setShowTourModal(false);
            setSelectedFile(null);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi tạo tour");
        }
    };

    // 2. Xử lý Tạo Lịch trình
    const handleCreateSchedule = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/tours/${selectedTour.tourId}/schedules`, newSchedule);
            alert("Đã thêm lịch khởi hành!");
            setShowScheduleModal(false);
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi thêm lịch trình");
        }
    };

    // 3. Xử lý Tạo Mã giảm giá
    const handleCreatePromo = async (e) => {
        e.preventDefault();
        try {
            await api.post('/promotions', newPromo);
            alert("Tạo mã giảm giá thành công!");
            setShowPromoModal(false);
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi tạo khuyến mãi");
        }
    };

    // 4. Xuất Excel hành khách
    const handleExportExcel = (tourId) => {
        const scheduleId = prompt("Nhập mã Lịch trình (Schedule ID) muốn xuất danh khách:");
        if (scheduleId) {
            const token = localStorage.getItem('token');
            // Mở link trực tiếp để trình duyệt tự tải file
            window.open(`http://localhost:8080/api/admin/tours/schedules/${scheduleId}/export?access_token=${token}`, '_blank');
        }
    };

    if (loading) return <div className="text-center p-20 font-bold text-gray-400 animate-pulse">ĐANG TẢI DỮ LIỆU QUẢN TRỊ...</div>;

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* --- SIDEBAR --- */}
            <div className="w-72 bg-gray-900 text-white p-8 hidden lg:block sticky top-0 h-screen">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                        <LayoutDashboard size={24} />
                    </div>
                    <h2 className="text-2xl font-black tracking-tighter">ADMIN HUB</h2>
                </div>

                <div className="space-y-2">
                    <button className="w-full flex items-center gap-3 p-4 bg-blue-600 rounded-2xl font-bold transition-all">
                        <Map size={20} /> Quản lý Tour
                    </button>
                    <button onClick={() => setShowPromoModal(true)} className="w-full flex items-center gap-3 p-4 text-gray-400 hover:text-white hover:bg-gray-800 rounded-2xl font-bold transition-all">
                        <TicketPercent size={20} /> Khuyến mãi
                    </button>
                </div>
            </div>

            {/* --- NỘI DUNG CHÍNH --- */}
            <div className="flex-1 p-10">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 uppercase">Dashboard</h1>
                        <p className="text-gray-400 font-medium">Theo dõi hoạt động kinh doanh của bạn</p>
                    </div>
                    <button
                        onClick={() => setShowTourModal(true)}
                        className="bg-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all flex items-center gap-2 shadow-2xl"
                    >
                        <Plus /> TẠO TOUR MỚI
                    </button>
                </header>

                {/* --- STATS CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group">
                        <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 text-blue-50 opacity-50 group-hover:scale-110 transition-transform" />
                        <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Tổng doanh thu</p>
                        <p className="text-3xl font-black text-blue-600">{new Intl.NumberFormat('vi-VN').format(stats.totalRevenue)}đ</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <ShoppingBag className="text-orange-500 mb-4" />
                        <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Đơn thành công</p>
                        <p className="text-3xl font-black text-gray-800">{stats.totalBookings}</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <Users className="text-green-500 mb-4" />
                        <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Tổng khách hàng</p>
                        <p className="text-3xl font-black text-gray-800">{stats.totalCustomers}</p>
                    </div>
                </div>

                {/* --- TOUR LIST TABLE --- */}
                <div className="bg-white rounded-[3rem] shadow-xl border border-gray-50 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="p-8 font-black text-gray-400 text-[10px] uppercase tracking-widest">Tour</th>
                            <th className="p-8 font-black text-gray-400 text-[10px] uppercase tracking-widest text-center">Hành động</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {tours.map(t => (
                            <tr key={t.tourId} className="hover:bg-blue-50/30 transition-colors">
                                <td className="p-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden">
                                            <img src={t.imageUrl || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-800 text-lg">{t.tourName}</p>
                                            <p className="text-xs font-bold text-blue-500 uppercase">{t.tourCode} • {t.destination}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-8">
                                    <div className="flex justify-center gap-3">
                                        <button onClick={() => { setSelectedTour(t); setShowScheduleModal(true); }} className="px-4 py-2 bg-orange-100 text-orange-600 rounded-xl font-bold text-xs hover:bg-orange-600 hover:text-white transition-all flex items-center gap-1">
                                            <Calendar size={14} /> LỊCH TRÌNH
                                        </button>
                                        <button onClick={() => handleExportExcel(t.tourId)} className="px-4 py-2 bg-green-100 text-green-600 rounded-xl font-bold text-xs hover:bg-green-600 hover:text-white transition-all flex items-center gap-1">
                                            <FileDown size={14} /> XUẤT EXCEL
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL: TẠO TOUR MỚI --- */}
            {showTourModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-black tracking-tighter">THIẾT KẾ TOUR</h2>
                            <button onClick={() => setShowTourModal(false)}><X className="text-gray-400 hover:text-red-500" /></button>
                        </div>
                        <form onSubmit={handleCreateTour} className="grid grid-cols-2 gap-6">
                            <div className="col-span-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Mã Tour</label>
                                <input className="w-full p-4 bg-gray-100 rounded-2xl mt-1 outline-none focus:ring-2 focus:ring-blue-500 font-bold" placeholder="VD: PQ-001" onChange={e => setNewTour({...newTour, tourCode: e.target.value})} required />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Tên Tour</label>
                                <input className="w-full p-4 bg-gray-100 rounded-2xl mt-1 outline-none focus:ring-2 focus:ring-blue-500 font-bold" placeholder="VD: Khám phá Phú Quốc" onChange={e => setNewTour({...newTour, tourName: e.target.value})} required />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Điểm đến</label>
                                <input className="w-full p-4 bg-gray-100 rounded-2xl mt-1 font-bold" placeholder="Địa danh" onChange={e => setNewTour({...newTour, destination: e.target.value})} required />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Giá cơ bản</label>
                                <input className="w-full p-4 bg-gray-100 rounded-2xl mt-1 font-bold" type="number" placeholder="VNĐ" onChange={e => setNewTour({...newTour, basePrice: e.target.value})} required />
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Ảnh đại diện</label>
                                <input type="file" className="w-full p-4 bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl mt-1 font-bold" onChange={(e) => setSelectedFile(e.target.files[0])} />
                            </div>
                            <textarea className="col-span-2 p-4 bg-gray-100 rounded-2xl h-28 font-medium" placeholder="Mô tả tóm tắt về chuyến đi..." onChange={e => setNewTour({...newTour, description: e.target.value})}></textarea>
                            <button className="col-span-2 bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-100 mt-4 transition-all">HOÀN TẤT TẠO TOUR</button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL: THÊM LỊCH TRÌNH --- */}
            {showScheduleModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10">
                        <h2 className="text-2xl font-black mb-2">Mở lịch khởi hành</h2>
                        <p className="text-blue-500 font-bold mb-8 italic">"{selectedTour.tourName}"</p>
                        <form onSubmit={handleCreateSchedule} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Ngày đi</label>
                                    <input type="date" className="w-full p-4 bg-gray-100 rounded-2xl" onChange={e => setNewSchedule({...newSchedule, departureDate: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Ngày về</label>
                                    <input type="date" className="w-full p-4 bg-gray-100 rounded-2xl" onChange={e => setNewSchedule({...newSchedule, returnDate: e.target.value})} required />
                                </div>
                            </div>
                            <input type="number" className="w-full p-4 bg-gray-100 rounded-2xl font-bold" placeholder="Số chỗ tối đa (VD: 30)" onChange={e => setNewSchedule({...newSchedule, maxSlots: e.target.value})} required />
                            <input type="number" className="w-full p-4 bg-gray-100 rounded-2xl font-bold" placeholder="Giá tour này (VNĐ)" onChange={e => setNewSchedule({...newSchedule, price: e.target.value})} required />
                            <button className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black hover:bg-blue-600 transition-all shadow-xl">XÁC NHẬN MỞ LỊCH</button>
                            <button type="button" onClick={() => setShowScheduleModal(false)} className="w-full text-gray-400 font-bold hover:text-gray-600">Hủy bỏ</button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL: TẠO KHUYẾN MÃI --- */}
            {showPromoModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 border-4 border-blue-50">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black">Mã giảm giá mới</h2>
                            <button onClick={() => setShowPromoModal(false)}><X className="text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleCreatePromo} className="space-y-4">
                            <input className="w-full p-4 bg-gray-100 rounded-2xl font-black text-blue-600 placeholder:text-gray-300" placeholder="MÃ (VD: HE2026)" onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})} required />
                            <select className="w-full p-4 bg-gray-100 rounded-2xl font-bold" onChange={e => setNewPromo({...newPromo, discountType: e.target.value})}>
                                <option value="PERCENT">Giảm theo phần trăm (%)</option>
                                <option value="FIXED">Giảm số tiền cố định (đ)</option>
                            </select>
                            <input className="w-full p-4 bg-gray-100 rounded-2xl font-bold" type="number" placeholder="Giá trị giảm" onChange={e => setNewPromo({...newPromo, discountValue: e.target.value})} required />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="date" className="w-full p-4 bg-gray-100 rounded-2xl text-xs" title="Ngày bắt đầu" onChange={e => setNewPromo({...newPromo, startDate: e.target.value})} required />
                                <input type="date" className="w-full p-4 bg-gray-100 rounded-2xl text-xs" title="Ngày kết thúc" onChange={e => setNewPromo({...newPromo, endDate: e.target.value})} required />
                            </div>
                            <input type="number" className="w-full p-4 bg-gray-100 rounded-2xl font-bold" placeholder="Số lượng mã (Lượt dùng)" onChange={e => setNewPromo({...newPromo, usageLimit: e.target.value})} required />
                            <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black hover:bg-blue-700 transition-all">PHÁT HÀNH MÃ</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;