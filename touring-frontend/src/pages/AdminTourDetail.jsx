import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    Save, Trash2, Plus, ArrowLeft,
    Image as ImageIcon, Calendar, Map,
    Info, X, ChevronDown
} from 'lucide-react';

const AdminTourDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // --- 1. STATES ---
    const [tour, setTour] = useState(null);
    const [activeTab, setActiveTab] = useState('basic');
    const [itineraries, setItineraries] = useState([]);
    const [loading, setLoading] = useState(true);

    // States cho Modal Lịch trình
    const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
    const [newSchedule, setNewSchedule] = useState({
        departureDate: '',
        returnDate: '',
        maxSlots: 30,
        price: ''
    });

    // --- 2. FETCH DATA ---
    const fetchDetail = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/tours/${id}`);
            setTour(res.data);
            // Sắp xếp ngày 1, 2, 3... cho mảng hành trình
            const sortedIt = (res.data.itineraries || []).sort((a, b) => a.dayNumber - b.dayNumber);
            setItineraries(sortedIt);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDetail(); }, [id]);

    // --- 3. XỬ LÝ TOUR (THÔNG TIN CHUNG) ---
    const handleUpdateTour = async () => {
        try {
            await api.put(`/tours/${id}`, tour);
            alert("Cập nhật thông tin thành công!");
            fetchDetail();
        } catch (error) { alert("Lỗi cập nhật tour"); }
    };

    // --- 4. XỬ LÝ HÌNH ẢNH ---
    const handleDeleteImage = async (imgId) => {
        if (window.confirm("Xóa ảnh này?")) {
            try {
                await api.delete(`/tours/images/${imgId}`);
                fetchDetail();
            } catch (error) { alert("Lỗi khi xóa ảnh!"); }
        }
    };

    const handleUploadImage = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            await api.post(`/tours/${id}/upload`, formData);
            fetchDetail();
        } catch (error) { alert("Lỗi khi tải ảnh lên!"); }
    };

    // --- 5. XỬ LÝ HÀNH TRÌNH (ITINERARY) ---
    const addItineraryRow = () => {
        setItineraries([...itineraries, { dayNumber: itineraries.length + 1, title: '', description: '' }]);
    };

    const handleItineraryChange = (index, field, value) => {
        const updated = [...itineraries];
        updated[index][field] = value;
        setItineraries(updated);
    };

    const removeItineraryRow = (index) => {
        if (window.confirm(`Xóa lịch trình Ngày ${itineraries[index].dayNumber}?`)) {
            const filtered = itineraries.filter((_, i) => i !== index);
            const updated = filtered.map((item, i) => ({ ...item, dayNumber: i + 1 }));
            setItineraries(updated);
        }
    };

    const saveItinerary = async () => {
        try {
            // Chỉ gửi những ngày đã điền tiêu đề
            const cleanData = itineraries.filter(it => it.title?.trim() !== '');
            await api.post(`/tours/${id}/itineraries`, cleanData);
            alert("Cập nhật hành trình chi tiết thành công!");
            fetchDetail();
        } catch (error) { alert("Lỗi khi lưu hành trình"); }
    };

    // --- 6. XỬ LÝ LỊCH KHỞI HÀNH (SCHEDULES) ---
    const handleDeleteSchedule = async (sId) => {
        if (window.confirm("Xóa ngày khởi hành này?")) {
            try {
                await api.delete(`/tours/schedules/${sId}`);
                fetchDetail();
            } catch (error) { alert("Không thể xóa (Lịch này đã có khách đặt)"); }
        }
    };

    const handleAddSchedule = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/tours/${id}/schedules`, {
                ...newSchedule,
                price: parseFloat(newSchedule.price),
                maxSlots: parseInt(newSchedule.maxSlots)
            });
            alert("Mở lịch khởi hành thành công!");
            setShowAddScheduleModal(false);
            setNewSchedule({ departureDate: '', returnDate: '', maxSlots: 30, price: '' });
            fetchDetail();
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi thêm lịch");
        }
    };

    const handleUpdateScheduleInline = async (sId, field, value) => {
        try {
            const schedule = tour.schedules.find(s => s.scheduleId === sId);
            const updatedData = { ...schedule, [field]: value };
            await api.put(`/tours/schedules/${sId}`, updatedData);
        } catch (error) { console.error("Lỗi cập nhật nhanh"); }
    };

    if (loading && !tour) return <div className="p-20 text-center font-black animate-pulse text-gray-400 text-2xl uppercase">Đang tải dữ liệu...</div>;

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <button onClick={() => navigate('/admin/tours')} className="flex items-center gap-2 text-gray-400 mb-6 hover:text-black font-bold uppercase text-xs transition-all">
                <ArrowLeft size={16} /> Quay lại danh sách
            </button>

            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-black uppercase tracking-tighter italic">Biên tập: <span className="text-blue-600">{tour?.tourName}</span></h1>
                <div className="flex gap-2">
                    {activeTab === 'basic' && <button onClick={handleUpdateTour} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg hover:bg-blue-700 active:scale-95 transition-all"><Save size={18} /> LƯU THÔNG TIN</button>}
                    {activeTab === 'itinerary' && <button onClick={saveItinerary} className="bg-green-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg hover:bg-green-700 active:scale-95 transition-all"><Save size={18} /> LƯU HÀNH TRÌNH</button>}
                </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex flex-wrap gap-4 mb-8 bg-white p-2 rounded-3xl shadow-sm w-fit border border-gray-100">
                {['basic', 'images', 'itinerary', 'schedules'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        {tab === 'basic' ? 'Thông tin' : tab === 'images' ? 'Hình ảnh' : tab === 'itinerary' ? 'Hành trình' : 'Lịch đi'}
                    </button>
                ))}
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 min-h-[500px]">

                {/* TAB 1: THÔNG TIN CƠ BẢN */}
                {activeTab === 'basic' && (
                    <div className="grid grid-cols-2 gap-8 animate-in fade-in duration-500">
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Tên Tour hiển thị</label>
                            <input className="w-full p-5 bg-gray-50 rounded-2xl mt-2 font-bold text-gray-700 border-none outline-none focus:ring-2 focus:ring-blue-500" value={tour?.tourName || ''} onChange={e => setTour({...tour, tourName: e.target.value})} />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Địa danh</label>
                            <input className="w-full p-5 bg-gray-50 rounded-2xl mt-2 font-bold text-gray-700 border-none outline-none focus:ring-2 focus:ring-blue-500" value={tour?.destination || ''} onChange={e => setTour({...tour, destination: e.target.value})} />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Giá sàn (VNĐ)</label>
                            <input className="w-full p-5 bg-gray-50 rounded-2xl mt-2 font-bold text-gray-700 border-none outline-none focus:ring-2 focus:ring-blue-500" type="number" value={tour?.basePrice || ''} onChange={e => setTour({...tour, basePrice: e.target.value})} />
                        </div>
                        <div className="col-span-2 border-t pt-8 mt-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 italic">Mô tả bài viết giới thiệu</label>
                            <textarea className="w-full p-5 bg-gray-50 rounded-2xl mt-2 h-64 font-medium text-gray-600 leading-relaxed border-none outline-none focus:ring-2 focus:ring-blue-500" value={tour?.description || ''} onChange={e => setTour({...tour, description: e.target.value})} />
                        </div>
                    </div>
                )}

                {/* TAB 2: QUẢN LÝ ẢNH */}
                {activeTab === 'images' && (
                    <div className="animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            {tour?.images?.map(img => (
                                <div key={img.imageId} className="relative group rounded-[2.5rem] overflow-hidden h-60 shadow-md border-4 border-white">
                                    <img src={img.imageUrl} className="w-full h-full object-cover" alt="tour" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                        <button onClick={() => handleDeleteImage(img.imageId)} className="p-4 bg-white text-red-500 rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all">
                                            <Trash2 size={24} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <label className="block w-full p-20 border-4 border-dashed border-gray-100 rounded-[3.5rem] text-center cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all">
                            <ImageIcon className="mx-auto mb-4 text-gray-200" size={64} />
                            <p className="font-black text-gray-400 uppercase text-xs tracking-widest">Nhấn để tải ảnh mới từ máy chủ Laptop</p>
                            <input type="file" className="hidden" onChange={(e) => handleUploadImage(e.target.files[0])} />
                        </label>
                    </div>
                )}

                {/* TAB 3: HÀNH TRÌNH ĐỘNG */}
                {activeTab === 'itinerary' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {itineraries.map((it, idx) => (
                            <div key={idx} className="relative p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                <button onClick={() => removeItineraryRow(idx)} className="absolute top-6 right-6 p-2 bg-white text-red-400 rounded-full shadow-sm hover:bg-red-500 hover:text-white transition-all"><X size={20} /></button>
                                <div className="flex items-center gap-6 mb-6">
                                    <span className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg italic">
                                        {it.dayNumber}
                                    </span>
                                    <div className="flex-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Tiêu đề ngày</label>
                                        <input className="w-full p-4 bg-white rounded-2xl mt-1 font-bold text-gray-800 border-none outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" value={it.title || ''} onChange={(e) => handleItineraryChange(idx, 'title', e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Hoạt động chi tiết</label>
                                    <textarea className="w-full p-6 bg-white rounded-[2rem] mt-1 h-32 outline-none focus:ring-2 focus:ring-blue-500 border-none text-gray-600 font-medium leading-relaxed shadow-sm" value={it.description || ''} onChange={(e) => handleItineraryChange(idx, 'description', e.target.value)} />
                                </div>
                            </div>
                        ))}
                        <button onClick={addItineraryRow} className="w-full py-8 border-4 border-dashed border-gray-100 text-gray-400 rounded-[3rem] font-black hover:text-blue-600 hover:border-blue-100 flex items-center justify-center gap-3 uppercase tracking-tighter transition-all group">
                            <Plus size={32} className="group-hover:scale-125 transition-transform" /> THÊM NGÀY TIẾP THEO
                        </button>
                    </div>
                )}

                {/* TAB 4: LỊCH KHỞI HÀNH */}
                {activeTab === 'schedules' && (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xl font-black text-gray-800 uppercase italic tracking-widest">Quản lý ngày khởi hành</h3>
                            <button onClick={() => setShowAddScheduleModal(true)} className="bg-black text-white px-8 py-3 rounded-2xl font-black hover:bg-blue-600 transition-all shadow-xl">
                                <Plus size={18} /> MỞ LỊCH MỚI
                            </button>
                        </div>
                        <div className="space-y-4">
                            {tour?.schedules?.map(s => (
                                <div key={s.scheduleId} className="flex justify-between items-center p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-sm hover:bg-white hover:border-blue-100 transition-all">
                                    <div className="grid grid-cols-4 gap-12 flex-1">
                                        <div><p className="text-[10px] font-black text-gray-400 uppercase mb-1">Ngày đi</p><input type="date" className="bg-transparent font-black text-blue-600 outline-none" defaultValue={s.departureDate} onBlur={(e) => handleUpdateScheduleInline(s.scheduleId, 'departureDate', e.target.value)} /></div>
                                        <div><p className="text-[10px] font-black text-gray-400 uppercase mb-1">Số chỗ</p><input type="number" className="bg-transparent font-black text-gray-700 outline-none w-20" defaultValue={s.maxSlots} onBlur={(e) => handleUpdateScheduleInline(s.scheduleId, 'maxSlots', e.target.value)} /></div>
                                        <div><p className="text-[10px] font-black text-gray-400 uppercase mb-1">Giá bán</p><input type="number" className="bg-transparent font-black text-gray-700 outline-none w-32" defaultValue={s.price} onBlur={(e) => handleUpdateScheduleInline(s.scheduleId, 'price', e.target.value)} /></div>
                                        <div className="text-center"><p className="text-[10px] font-black text-gray-400 uppercase mb-1">Đã đặt</p><span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-black">{s.maxSlots - s.availableSlots} khách</span></div>
                                    </div>
                                    <button onClick={() => handleDeleteSchedule(s.scheduleId)} className="p-4 bg-white text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm ml-6"><Trash2 size={24} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* --- MODAL THÊM LỊCH TRÌNH --- */}
            {showAddScheduleModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Mở lịch mới</h2>
                            <button onClick={() => setShowAddScheduleModal(false)}><X size={24} className="text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleAddSchedule} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-[10px] font-black text-gray-400 ml-2 uppercase">Ngày đi</label><input type="date" className="w-full p-4 bg-gray-100 rounded-2xl font-bold outline-none" value={newSchedule.departureDate} onChange={e => setNewSchedule({...newSchedule, departureDate: e.target.value})} required /></div>
                                <div><label className="text-[10px] font-black text-gray-400 ml-2 uppercase">Ngày về</label><input type="date" className="w-full p-4 bg-gray-100 rounded-2xl font-bold outline-none" value={newSchedule.returnDate} onChange={e => setNewSchedule({...newSchedule, returnDate: e.target.value})} required /></div>
                            </div>
                            <input type="number" className="w-full p-4 bg-gray-100 rounded-2xl font-bold outline-none" placeholder="Số lượng chỗ" value={newSchedule.maxSlots} onChange={e => setNewSchedule({...newSchedule, maxSlots: e.target.value})} required />
                            <input type="number" className="w-full p-4 bg-gray-100 rounded-2xl font-black text-blue-600 outline-none" placeholder="Giá bán (VNĐ)" value={newSchedule.price} onChange={e => setNewSchedule({...newSchedule, price: e.target.value})} required />
                            <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black hover:bg-black transition-all shadow-xl uppercase">Xác nhận mở lịch</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTourDetail;