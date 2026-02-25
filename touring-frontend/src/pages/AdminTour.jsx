import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, Calendar, FileDown, X, TrendingUp, ShoppingBag, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const AdminTour = () => {
    const [tours, setTours] = useState([]);
    const [stats, setStats] = useState({ totalRevenue: 0, totalBookings: 0, totalCustomers: 0 });
    const [loading, setLoading] = useState(true);
    const [showTourModal, setShowTourModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedTour, setSelectedTour] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const navigate = useNavigate();

    const [newTour, setNewTour] = useState({
        tourCode: '', tourName: '', destination: '', basePrice: '',
        description: '', tourType: 'DOMESTIC', durationDays: 1
    });

    const [newSchedule, setNewSchedule] = useState({
        departureDate: '', returnDate: '', maxSlots: 20, price: ''
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
            console.error("Lỗi tải dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreateTour = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...newTour,
                basePrice: parseFloat(newTour.basePrice),
                durationDays: parseInt(newTour.durationDays)
            };
            const tourRes = await api.post('/tours', payload);
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                await api.post(`/tours/${tourRes.data.tourId}/upload`, formData);
            }
            alert("Tạo Tour thành công!");
            setShowTourModal(false);
            fetchData();
        } catch (error) {
            alert("Lỗi tạo tour. Vui lòng kiểm tra lại dữ liệu.");
        }
    };

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

    const handleExportExcel = (tour) => {
        const scheduleId = prompt(`Nhập mã Lịch trình (Schedule ID) của tour "${tour.tourName}" muốn xuất Excel:`);
        if (scheduleId) {
            const token = localStorage.getItem('token');
            window.open(`http://localhost:8080/api/admin/tours/schedules/${scheduleId}/export?access_token=${token}`, '_blank');
        }
    };

    if (loading) return <div className="p-20 text-center font-bold text-gray-300 animate-pulse uppercase">Đang tải kho tour...</div>;

    return (
        <div>
            <header className="flex justify-between items-center mb-10">
                <h1 className="text-4xl font-black text-gray-900 uppercase">Quản lý Tour</h1>
                <button onClick={() => setShowTourModal(true)} className="bg-black text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-600 flex items-center gap-2 transition-all shadow-xl active:scale-95">
                    <Plus /> TẠO TOUR MỚI
                </button>
            </header>

            {/* THỐNG KÊ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:border-blue-200 transition-all">
                    <p className="text-gray-400 text-[10px] font-black uppercase mb-1 tracking-widest">Doanh thu</p>
                    <p className="text-3xl font-black text-blue-600">{new Intl.NumberFormat('vi-VN').format(stats.totalRevenue)}đ</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <ShoppingBag className="mb-2 text-orange-500" size={24} />
                    <p className="text-gray-400 text-[10px] font-black uppercase mb-1">Đơn thành công</p>
                    <p className="text-3xl font-black text-gray-800">{stats.totalBookings}</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <Users className="mb-2 text-green-500" size={24} />
                    <p className="text-gray-400 text-[10px] font-black uppercase mb-1">Khách hàng</p>
                    <p className="text-3xl font-black text-gray-800">{stats.totalCustomers}</p>
                </div>
            </div>

            {/* BIỂU ĐỒ */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 mb-10 h-96">
                <h3 className="font-black text-gray-800 uppercase text-xs mb-8 flex items-center gap-2 tracking-widest">
                    <TrendingUp size={18} className="text-blue-600" /> Xu hướng kinh doanh
                </h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[{ name: 'Tháng này', revenue: stats.totalRevenue }]}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Bar dataKey="revenue" fill="#2563eb" radius={[10, 10, 0, 0]} barSize={60} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* BẢNG DANH SÁCH */}
            <div className="bg-white rounded-[3rem] shadow-sm overflow-hidden border border-gray-100">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b">
                    <tr>
                        <th className="p-8 font-black text-gray-400 text-[10px] uppercase">Thông tin Tour</th>
                        <th className="p-8 font-black text-gray-400 text-[10px] uppercase text-center">Hành động</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y">
                    {tours.map(t => (
                        <tr key={t.tourId} className="hover:bg-blue-50/20 transition-colors">
                            <td className="p-8">
                                {/* CLICK VÀO ĐÂY ĐỂ SANG TRANG DETAIL */}
                                <div
                                    className="flex items-center gap-5 cursor-pointer group"
                                    onClick={() => navigate(`/admin/tours/${t.tourId}`)}
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden shadow-inner flex-shrink-0">
                                        <img src={t.imageUrl || 'https://placehold.co/100x100?text=No+Image'} className="w-full h-full object-cover group-hover:scale-110 transition-all" alt={t.tourName} />
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-800 text-xl group-hover:text-blue-600 transition-colors leading-tight">{t.tourName}</p>
                                        <p className="text-xs font-bold text-gray-400 uppercase mt-1 tracking-widest">{t.tourCode} • {t.destination}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-8 text-center">
                                <div className="flex justify-center gap-2">
                                    <button onClick={() => { setSelectedTour(t); setShowScheduleModal(true); }} className="p-3 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-sm" title="Thêm lịch khởi hành">
                                        <Calendar size={18} />
                                    </button>
                                    <button onClick={() => handleExportExcel(t)} className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm" title="Xuất danh sách Excel">
                                        <FileDown size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* --- MODALS --- */}
            {showTourModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between mb-8"><h2 className="text-3xl font-black uppercase tracking-tighter">Thiết kế Tour</h2><button onClick={() => setShowTourModal(false)}><X className="text-gray-400 hover:text-red-500" /></button></div>
                        <form onSubmit={handleCreateTour} className="grid grid-cols-2 gap-6">
                            <input className="p-4 bg-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="Mã Tour" onChange={e => setNewTour({...newTour, tourCode: e.target.value})} required />
                            <input className="p-4 bg-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tên Tour" onChange={e => setNewTour({...newTour, tourName: e.target.value})} required />
                            <input className="p-4 bg-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="Điểm đến" onChange={e => setNewTour({...newTour, destination: e.target.value})} required />
                            <input className="p-4 bg-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" type="number" placeholder="Số ngày đi" onChange={e => setNewTour({...newTour, durationDays: e.target.value})} required />
                            <input className="p-4 bg-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" type="number" placeholder="Giá cơ bản" onChange={e => setNewTour({...newTour, basePrice: e.target.value})} required />
                            <select className="p-4 bg-gray-100 rounded-2xl font-bold" onChange={e => setNewTour({...newTour, tourType: e.target.value})}>
                                <option value="DOMESTIC">Trong nước</option>
                                <option value="INTERNATIONAL">Quốc tế</option>
                            </select>
                            <div className="col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Tải ảnh đại diện</label>
                                <input type="file" className="w-full p-4 bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl mt-1 font-bold" onChange={(e) => setSelectedFile(e.target.files[0])} />
                            </div>
                            <textarea className="col-span-2 p-4 bg-gray-100 rounded-2xl h-24 font-medium" placeholder="Mô tả..." onChange={e => setNewTour({...newTour, description: e.target.value})}></textarea>
                            <button className="col-span-2 bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl transition-all uppercase">Lưu thông tin</button>
                        </form>
                    </div>
                </div>
            )}

            {showScheduleModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[3rem] p-12 text-center shadow-2xl">
                        <h2 className="text-2xl font-black mb-2 uppercase">Mở lịch mới</h2>
                        <p className="text-blue-600 font-bold mb-8 italic">"{selectedTour?.tourName}"</p>
                        <form onSubmit={handleCreateSchedule} className="space-y-4 text-left">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-[10px] font-bold text-gray-400 ml-2">NGÀY ĐI</label><input type="date" className="w-full p-4 bg-gray-100 rounded-2xl font-bold" onChange={e => setNewSchedule({...newSchedule, departureDate: e.target.value})} required /></div>
                                <div><label className="text-[10px] font-bold text-gray-400 ml-2">NGÀY VỀ</label><input type="date" className="w-full p-4 bg-gray-100 rounded-2xl font-bold" onChange={e => setNewSchedule({...newSchedule, returnDate: e.target.value})} required /></div>
                            </div>
                            <input type="number" className="w-full p-4 bg-gray-100 rounded-2xl font-bold" placeholder="Số chỗ" onChange={e => setNewSchedule({...newSchedule, maxSlots: e.target.value})} required />
                            <input type="number" className="w-full p-4 bg-gray-100 rounded-2xl font-bold" placeholder="Giá" onChange={e => setNewSchedule({...newSchedule, price: e.target.value})} required />
                            <button className="w-full bg-black text-white py-5 rounded-2xl font-black hover:bg-blue-600 transition-all uppercase">Xác nhận</button>
                            <button type="button" onClick={() => setShowScheduleModal(false)} className="w-full text-gray-400 font-bold mt-2 hover:text-gray-600 transition-colors uppercase text-sm">Hủy bỏ</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTour;