import { useEffect, useState } from 'react';
import api from '../api/axios';
import {
    Plus, Calendar, FileDown, X, TrendingUp,
    ShoppingBag, Users, Search, Filter, Trash2,
    Pencil, Lock, Unlock
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { formatThumbnailUrl } from '../utils/cloudinaryHelper';

const AdminTour = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem('role'); // Lấy quyền để phân chia giao diện

    const [tours, setTours] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [stats, setStats] = useState({ totalRevenue: 0, totalBookings: 0, totalCustomers: 0 });
    const [loading, setLoading] = useState(true);

    // --- STATES CHO MODALS ---
    const [showTourModal, setShowTourModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedTour, setSelectedTour] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // --- STATES CHO BỘ LỌC ---
    const [filter, setFilter] = useState({
        dest: '', min: '', max: '', start: '', end: '', sort: 'newest'
    });

    // --- STATES CHO FORM DỮ LIỆU ---
    const [newTour, setNewTour] = useState({
        tourCode: '', tourName: '', destination: '', basePrice: '',
        description: '', tourType: 'DOMESTIC', durationDays: 1,
        accommodation: '', departureFrom: '', transport: '', isFeatured: false,
        highlights: '', inclusions: '', exclusions: '', terms: ''
    });
    const [newSchedule, setNewSchedule] = useState({
        departureDate: '', returnDate: '', maxSlots: 20, price: ''
    });

    // --- GỌI API LẤY DỮ LIỆU THEO QUYỀN (Sử dụng endpoint management) ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const [tourRes, statsRes, destinationRes] = await Promise.all([
                api.get('/tours/management/search', { params: { sortBy: 'newest' } }),
                api.get('/admin/stats'),
                api.get('/destinations')
            ]);
            setTours(tourRes.data);
            setStats(statsRes.data);
            setDestinations(destinationRes.data || []);
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        if (!newTour.destination && destinations.length > 0) {
            setNewTour((prev) => ({ ...prev, destination: destinations[0].name }));
        }
    }, [destinations, newTour.destination]);

    // --- XỬ LÝ LỌC TOUR (Keyword bao gồm Tên và Địa điểm) ---
    const handleFilter = async () => {
        setLoading(true);
        try {
            const res = await api.get('/tours/management/search', {
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
        } catch (error) { console.error("Lỗi lọc"); }
        finally { setLoading(false); }
    };

    const handleCreateTour = async (e) => {
        e.preventDefault();
        try {
            if (!newTour.destination) {
                alert('Vui lòng chọn điểm đến!');
                return;
            }
            const payload = {
                ...newTour,
                basePrice: parseFloat(newTour.basePrice),
                durationDays: parseInt(newTour.durationDays)
            };
            const tourRes = await api.post('/tours', payload);
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                await api.post(`/tours/${tourRes.data.tourId}/images`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            alert("Tạo Tour thành công!");
            setShowTourModal(false);
            fetchData();
        } catch (error) { alert("Lỗi tạo tour. Kiểm tra lại dữ liệu."); }
    };

    const handleToggleStatus = async (tour) => {
        const nextStatus = tour.status === 'OPEN' ? 'LOCK' : 'OPEN';
        if (window.confirm(`Chuyen trang thai tour "${tour.tourName}" sang ${nextStatus}?`)) {
            try {
                await api.delete(`/tours/${tour.tourId}`);
                alert(`Da chuyen trang thai sang ${nextStatus}!`);
                fetchData();
            } catch (error) { alert("Ban khong co quyen thay doi trang thai tour nay!"); }
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
        } catch (error) { alert("Lỗi thêm lịch"); }
    };

    const handleExportExcel = (tour) => {
        const scheduleId = prompt(`Nhập mã Schedule ID của tour "${tour.tourName}":`);
        if (scheduleId) {
            const token = localStorage.getItem('token');
            window.open(`http://localhost:8080/api/admin/tours/schedules/${scheduleId}/export?access_token=${token}`, '_blank');
        }
    };

    if (loading && tours.length === 0) return <div className="p-20 text-center font-black animate-pulse text-2xl">ĐANG TẢI DỮ LIỆU QUẢN TRỊ...</div>;

    return (
        <div className="space-y-10">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">
                        {role === 'ADMIN' ? 'Hệ thống Quản lý Tour' : 'Tour của tôi'}
                    </h1>
                    <p className="text-gray-400 font-medium">Quản lý và cập nhật hành trình kinh doanh</p>
                </div>
                <button onClick={() => setShowTourModal(true)} className="bg-black text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-600 transition-all shadow-xl flex items-center gap-2 active:scale-95"><Plus /> TẠO TOUR MỚI</button>
            </header>

            {/* BỘ LỌC */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
                <div className="col-span-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Tìm kiếm</label>
                    <input className="w-full p-3 bg-gray-50 rounded-xl mt-1 text-sm font-bold outline-none focus:ring-1" placeholder="Tên tour/Địa danh..." value={filter.dest} onChange={e => setFilter({...filter, dest: e.target.value})} />
                </div>
                <div className="col-span-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Từ ngày</label>
                    <input type="date" className="w-full p-3 bg-gray-50 rounded-xl mt-1 text-sm font-bold" value={filter.start} onChange={e => setFilter({...filter, start: e.target.value})} />
                </div>
                <div className="col-span-1 text-sm font-black">
                    <label className="text-[10px] text-gray-400 uppercase tracking-widest">Sắp xếp</label>
                    <select className="w-full p-3 bg-gray-50 rounded-xl mt-1 text-blue-600" value={filter.sort} onChange={e => setFilter({...filter, sort: e.target.value})}>
                        <option value="newest">Mới nhất</option>
                        <option value="price_asc">Giá tăng dần</option>
                        <option value="price_desc">Giá giảm dần</option>
                    </select>
                </div>
                <button onClick={handleFilter} className="bg-gray-100 text-gray-800 p-3.5 rounded-xl font-black text-xs hover:bg-black hover:text-white transition-all">LỌC DỮ LIỆU</button>
                <button onClick={() => {setFilter({dest:'',min:'',max:'',start:'',end:'',sort:'newest'}); fetchData();}} className="bg-red-50 text-red-500 p-3.5 rounded-xl font-black text-xs hover:bg-red-500 hover:text-white transition-all tracking-tighter">XÓA LỌC</button>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100"><p className="text-gray-400 text-[10px] font-black uppercase mb-1">Doanh thu</p><p className="text-3xl font-black text-blue-600">{new Intl.NumberFormat('vi-VN').format(stats.totalRevenue)}đ</p></div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100"><p className="text-gray-400 text-[10px] font-black uppercase mb-1">Đơn thành công</p><p className="text-3xl font-black text-gray-800">{stats.totalBookings}</p></div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100"><p className="text-gray-400 text-[10px] font-black uppercase mb-1">Khách hàng</p><p className="text-3xl font-black text-gray-800">{stats.totalCustomers}</p></div>
            </div>

            {/* BẢNG DANH SÁCH TOUR */}
            <div className="bg-white rounded-[3rem] shadow-sm overflow-hidden border border-gray-100">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b">
                    <tr>
                        <th className="p-6 font-black text-gray-400 text-[10px] uppercase">STT</th>
                        <th className="p-6 font-black text-gray-400 text-[10px] uppercase">Mã Tour</th>
                        <th className="p-6 font-black text-gray-400 text-[10px] uppercase">Tên Tour</th>
                        <th className="p-6 font-black text-gray-400 text-[10px] uppercase">Địa điểm đi - đến</th>
                        <th className="p-6 font-black text-gray-400 text-[10px] uppercase">Người tạo</th>
                        <th className="p-6 font-black text-gray-400 text-[10px] uppercase">Ngày tạo</th>
                        <th className="p-6 font-black text-gray-400 text-[10px] uppercase">Trạng thái</th>
                        <th className="p-6 font-black text-gray-400 text-[10px] uppercase text-center">Thao tác</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                    {tours.map((t, index) => (
                        <tr key={t.tourId} className="hover:bg-blue-50/20 transition-all duration-300 group">
                            <td className="p-6 font-black text-gray-500">{index + 1}</td>
                            <td className="p-6">
                                <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl">
                                    {t.tourCode}
                                </span>
                            </td>
                            <td className="p-6">
                                <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/admin/tours/${t.tourId}`)}>
                                    <img src={formatThumbnailUrl(t.imageUrl || 'https://placehold.co/200x200?text=Tour')} className="w-14 h-14 rounded-2xl object-cover group-hover:scale-110 transition-all" />
                                    <p className="font-black text-gray-800 leading-tight">{t.tourName}</p>
                                </div>
                            </td>
                            <td className="p-6 text-sm font-bold text-gray-700">{t.destination || '-'}</td>
                            <td className="p-6">
                                <span className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-bold text-gray-600">
                                    {t.staffName || 'He thong'}
                                </span>
                            </td>
                            <td className="p-6 text-sm font-bold text-gray-600">
                                {t.createdAt ? new Date(t.createdAt).toLocaleDateString('vi-VN') : '-'}
                            </td>
                            <td className="p-6">
                                <span className={`px-3 py-1 rounded-lg text-xs font-black ${
                                    t.status === 'OPEN' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                }`}>
                                    {t.status === 'OPEN' ? 'OPEN' : 'LOCK'}
                                </span>
                            </td>
                            <td className="p-6 text-center">
                                <div className="flex justify-center gap-3">
                                    <button onClick={() => navigate(`/admin/tours/${t.tourId}`)} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Pencil size={20} /></button>
                                    <button onClick={() => { setSelectedTour(t); setShowScheduleModal(true); }} className="p-3 bg-orange-50 text-orange-600 rounded-2xl hover:bg-orange-600 hover:text-white transition-all shadow-sm"><Calendar size={20} /></button>
                                    <button onClick={() => handleExportExcel(t)} className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-sm"><FileDown size={20} /></button>
                                    <button onClick={() => handleToggleStatus(t)} className="p-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-800 hover:text-white transition-all shadow-sm">
                                        {t.status === 'OPEN' ? <Lock size={20} /> : <Unlock size={20} />}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* MODALS */}
            {showTourModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between mb-8"><h2 className="text-3xl font-black uppercase tracking-tighter italic text-blue-600">Thiết kế Tour mới</h2><button onClick={() => setShowTourModal(false)}><X className="text-gray-400" /></button></div>
                        <form onSubmit={handleCreateTour} className="grid grid-cols-2 gap-6">
                            <input className="p-4 bg-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="Mã Tour" onChange={e => setNewTour({...newTour, tourCode: e.target.value})} required />
                            <input className="p-4 bg-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tên Tour" onChange={e => setNewTour({...newTour, tourName: e.target.value})} required />
                            <select
                                className="p-4 bg-gray-100 rounded-2xl font-bold outline-none"
                                value={newTour.destination}
                                onChange={e => setNewTour({...newTour, destination: e.target.value})}
                                required
                            >
                                {destinations.length === 0 ? (
                                    <option value="">Chưa có điểm đến</option>
                                ) : (
                                    destinations.map((d) => (
                                        <option key={d.destinationId} value={d.name}>{d.name}</option>
                                    ))
                                )}
                            </select>
                            <input className="p-4 bg-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" type="number" placeholder="Số ngày đi" onChange={e => setNewTour({...newTour, durationDays: e.target.value})} required />
                            <input className="p-4 bg-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" type="number" placeholder="Giá cơ bản" onChange={e => setNewTour({...newTour, basePrice: e.target.value})} required />
                            <select className="p-4 bg-gray-100 rounded-2xl font-bold outline-none" onChange={e => setNewTour({...newTour, tourType: e.target.value})}>
                                <option value="DOMESTIC">Trong nước</option>
                                <option value="INTERNATIONAL">Quốc tế</option>
                            </select>
                            <input className="p-4 bg-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nơi khởi hành" onChange={e => setNewTour({...newTour, departureFrom: e.target.value})} />
                            <input className="p-4 bg-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="Phương tiện di chuyển" onChange={e => setNewTour({...newTour, transport: e.target.value})} />
                            <input className="p-4 bg-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nơi lưu trú (Khách sạn)" onChange={e => setNewTour({...newTour, accommodation: e.target.value})} />
                            
                            <label className="flex items-center gap-2 p-4 bg-gray-100 rounded-2xl font-bold cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 accent-blue-600" onChange={e => setNewTour({...newTour, isFeatured: e.target.checked})} />
                                Tour nổi bật
                            </label>

                            <div className="col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Tải ảnh đại diện</label>
                                <input type="file" className="w-full p-4 bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl mt-1 font-bold" onChange={(e) => setSelectedFile(e.target.files[0])} />
                            </div>
                            <textarea className="col-span-2 p-4 bg-gray-100 rounded-2xl h-24 font-medium" placeholder="Mô tả tổng quan..." onChange={e => setNewTour({...newTour, description: e.target.value})}></textarea>
                            <textarea className="col-span-2 p-4 bg-gray-100 rounded-2xl h-24 font-medium" placeholder="Điểm nhấn hành trình..." onChange={e => setNewTour({...newTour, highlights: e.target.value})}></textarea>
                            <textarea className="col-span-2 p-4 bg-gray-100 rounded-2xl h-24 font-medium" placeholder="Giá Tour Bao Gồm..." onChange={e => setNewTour({...newTour, inclusions: e.target.value})}></textarea>
                            <textarea className="col-span-2 p-4 bg-gray-100 rounded-2xl h-24 font-medium" placeholder="Giá Tour Không Bao Gồm..." onChange={e => setNewTour({...newTour, exclusions: e.target.value})}></textarea>
                            <textarea className="col-span-2 p-4 bg-gray-100 rounded-2xl h-24 font-medium" placeholder="Điều Khoản & Lưu Ý..." onChange={e => setNewTour({...newTour, terms: e.target.value})}></textarea>

                            <button className="col-span-2 bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl transition-all uppercase tracking-widest">Lưu Tour</button>
                        </form>
                    </div>
                </div>
            )}

            {showScheduleModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[3rem] p-12 text-center shadow-2xl">
                        <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">Mở lịch mới</h2>
                        <p className="text-blue-500 font-bold mb-8 italic">"{selectedTour?.tourName}"</p>
                        <form onSubmit={handleCreateSchedule} className="space-y-6 text-left">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Ngày đi</label><input type="date" className="w-full p-4 bg-gray-100 rounded-2xl font-bold" onChange={e => setNewSchedule({...newSchedule, departureDate: e.target.value})} required /></div>
                                <div><label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Ngày về</label><input type="date" className="w-full p-4 bg-gray-100 rounded-2xl font-bold" onChange={e => setNewSchedule({...newSchedule, returnDate: e.target.value})} required /></div>
                            </div>
                            <div><label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Số chỗ</label><input type="number" className="w-full p-4 bg-gray-100 rounded-2xl font-bold" placeholder="VD: 30" onChange={e => setNewSchedule({...newSchedule, maxSlots: e.target.value})} required /></div>
                            <div><label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Giá (VNĐ)</label><input type="number" className="w-full p-4 bg-gray-100 rounded-2xl font-bold" placeholder="Giá tour ngày này" onChange={e => setNewSchedule({...newSchedule, price: e.target.value})} required /></div>
                            <button className="w-full bg-black text-white py-5 rounded-2xl font-black hover:bg-blue-600 transition-all shadow-lg uppercase tracking-widest">Xác nhận</button>
                            <button type="button" onClick={() => setShowScheduleModal(false)} className="w-full text-gray-400 font-bold mt-2 hover:text-gray-600 transition-colors uppercase text-xs">Hủy</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTour;