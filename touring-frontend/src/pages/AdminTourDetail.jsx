import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Save, Trash2, Plus, ArrowLeft, Image as ImageIcon, ChevronDown } from 'lucide-react';

const AdminTourDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // --- 1. STATES ---
    const [tour, setTour] = useState(null);
    const [activeTab, setActiveTab] = useState('basic'); // basic, images, itinerary
    const [itineraries, setItineraries] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- 2. FETCH DATA ---
    const fetchDetail = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/tours/${id}`);
            setTour(res.data);
            // Sắp xếp lịch trình theo số ngày và gán vào state riêng
            const sortedIt = (res.data.itineraries || []).sort((a, b) => a.dayNumber - b.dayNumber);
            setItineraries(sortedIt);
        } catch (error) {
            console.error("Lỗi lấy chi tiết tour:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [id]);

    // --- 3. LOGIC XỬ LÝ ---

    // A. Cập nhật thông tin chung
    const handleUpdateTour = async () => {
        try {
            await api.put(`/tours/${id}`, tour);
            alert("Cập nhật thông tin cơ bản thành công!");
            fetchDetail();
        } catch (error) {
            alert("Lỗi cập nhật thông tin chung");
        }
    };

    // B. Quản lý hình ảnh
    const handleDeleteImage = async (imgId) => {
        if (window.confirm("Bạn có chắc muốn xóa ảnh này?")) {
            try {
                await api.delete(`/tours/images/${imgId}`);
                fetchDetail();
            } catch (error) {
                alert("Lỗi khi xóa ảnh!");
            }
        }
    };

    const handleUploadImage = async (file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            await api.post(`/tours/${id}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchDetail();
        } catch (error) {
            alert("Lỗi khi tải ảnh lên!");
        }
    };

    // C. Quản lý Hành trình (Itinerary) - Logic Form động
    const addDay = () => {
        const nextDay = itineraries.length + 1;
        setItineraries([...itineraries, { dayNumber: nextDay, title: '', description: '' }]);
    };

    const removeDay = (index) => {
        const filtered = itineraries.filter((_, i) => i !== index);
        // Cập nhật lại số thứ tự ngày 1, 2, 3... cho khớp
        const updated = filtered.map((item, i) => ({ ...item, dayNumber: i + 1 }));
        setItineraries(updated);
    };

    const handleItineraryChange = (index, field, value) => {
        const updated = [...itineraries];
        updated[index][field] = value;
        setItineraries(updated);
    };

    const saveItinerary = async () => {
        try {
            // Gửi toàn bộ mảng itineraries sang Backend
            await api.post(`/tours/${id}/itineraries`, itineraries);
            alert("Lưu lịch trình chi tiết thành công!");
            fetchDetail(); // Cập nhật lại dữ liệu từ DB
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi lưu lịch trình");
        }
    };

    // --- 4. RENDER ---
    if (loading && !tour) return <div className="p-20 text-center font-black text-blue-600 animate-pulse uppercase text-2xl">Đang tải dữ liệu...</div>;
    if (!tour) return <div className="text-center p-20">Không tìm thấy tour.</div>;

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            {/* Nút quay lại */}
            <button onClick={() => navigate('/admin/tours')} className="flex items-center gap-2 text-gray-400 mb-8 hover:text-black font-bold uppercase text-xs tracking-widest transition-all">
                <ArrowLeft size={16} /> Quay lại danh sách
            </button>

            {/* Header */}
            <div className="flex justify-between items-start mb-12">
                <div>
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{tour.tourCode || 'N/A'}</span>
                    <h1 className="text-4xl font-black text-gray-800 mt-2 uppercase tracking-tighter italic">Biên tập: {tour.tourName}</h1>
                </div>
                {activeTab === 'basic' && (
                    <button onClick={handleUpdateTour} className="bg-blue-600 text-white px-10 py-4 rounded-[1.5rem] font-black flex items-center gap-2 shadow-2xl hover:bg-blue-700 transition-all active:scale-95">
                        <Save size={20} /> LƯU THÔNG TIN CHUNG
                    </button>
                )}
                {activeTab === 'itinerary' && (
                    <button onClick={saveItinerary} className="bg-green-600 text-white px-10 py-4 rounded-[1.5rem] font-black flex items-center gap-2 shadow-2xl hover:bg-green-700 transition-all active:scale-95">
                        <Save size={20} /> LƯU LỊCH TRÌNH
                    </button>
                )}
            </div>

            {/* TABS NAVIGATION */}
            <div className="flex gap-4 mb-10 bg-white p-2 rounded-3xl shadow-sm w-fit border border-gray-100">
                <button onClick={() => setActiveTab('basic')} className={`px-8 py-3 rounded-2xl font-black text-sm transition-all ${activeTab === 'basic' ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-50'}`}>THÔNG TIN CHUNG</button>
                <button onClick={() => setActiveTab('images')} className={`px-8 py-3 rounded-2xl font-black text-sm transition-all ${activeTab === 'images' ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-50'}`}>THƯ VIỆN ẢNH</button>
                <button onClick={() => setActiveTab('itinerary')} className={`px-8 py-3 rounded-2xl font-black text-sm transition-all ${activeTab === 'itinerary' ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-50'}`}>HÀNH TRÌNH</button>
            </div>

            {/* NỘI DUNG TỪNG TAB */}
            <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-gray-100 min-h-[500px]">

                {/* TAB 1: THÔNG TIN CƠ BẢN */}
                {activeTab === 'basic' && (
                    <div className="grid grid-cols-2 gap-8 animate-in fade-in duration-500">
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Tên Tour hiển thị</label>
                            <input
                                className="w-full p-5 bg-gray-50 rounded-2xl mt-2 font-bold text-gray-700 border-none outline-none focus:ring-2 focus:ring-blue-500"
                                value={tour.tourName || ''}
                                onChange={e => setTour({ ...tour, tourName: e.target.value })}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Địa danh</label>
                            <input
                                className="w-full p-5 bg-gray-50 rounded-2xl mt-2 font-bold text-gray-700 border-none outline-none focus:ring-2 focus:ring-blue-500"
                                value={tour.destination || ''}
                                onChange={e => setTour({ ...tour, destination: e.target.value })}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Giá sàn (VNĐ)</label>
                            <input
                                className="w-full p-5 bg-gray-50 rounded-2xl mt-2 font-bold text-gray-700 border-none outline-none focus:ring-2 focus:ring-blue-500"
                                type="number"
                                value={tour.basePrice || ''}
                                onChange={e => setTour({ ...tour, basePrice: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2 border-t pt-8 mt-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 italic">Mô tả bài viết giới thiệu</label>
                            <textarea
                                className="w-full p-5 bg-gray-50 rounded-2xl mt-2 h-64 font-medium text-gray-600 leading-relaxed border-none outline-none focus:ring-2 focus:ring-blue-500"
                                value={tour.description || ''}
                                onChange={e => setTour({ ...tour, description: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                {/* TAB 2: THƯ VIỆN ẢNH */}
                {activeTab === 'images' && (
                    <div className="animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            {tour.images?.map(img => (
                                <div key={img.imageId} className="relative group rounded-[2rem] overflow-hidden h-56 shadow-md border-4 border-white transition-transform hover:scale-[1.02]">
                                    <img src={img.imageUrl} className="w-full h-full object-cover" alt="tour" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                        <button onClick={() => handleDeleteImage(img.imageId)} className="p-4 bg-white text-red-500 rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all">
                                            <Trash2 size={24} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-16 border-4 border-dashed border-gray-100 rounded-[3rem] text-center bg-gray-50/50">
                            <ImageIcon className="mx-auto mb-6 text-gray-200" size={64} />
                            <p className="text-gray-400 font-bold mb-8 uppercase tracking-widest text-xs">Kéo thả hoặc chọn tệp để thêm ảnh mới</p>
                            <input type="file" id="file-upload" className="hidden" onChange={(e) => handleUploadImage(e.target.files[0])} />
                            <label htmlFor="file-upload" className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black cursor-pointer hover:bg-blue-600 transition-all shadow-xl uppercase tracking-tighter">Tải ảnh lên hệ thống</label>
                        </div>
                    </div>
                )}

                {/* TAB 3: HÀNH TRÌNH CHI TIẾT */}
                {activeTab === 'itinerary' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {itineraries.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-gray-400 italic mb-6 text-xl text-center">Chưa có lịch trình cho tour này.</p>
                            </div>
                        ) : (
                            itineraries.map((it, index) => (
                                <div key={index} className="relative p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-sm animate-in zoom-in-95 duration-300">
                                    <button
                                        onClick={() => removeDay(index)}
                                        className="absolute top-6 right-6 p-2 bg-white text-gray-300 hover:text-red-500 rounded-full shadow-sm transition-all"
                                    >
                                        <Trash2 size={20} />
                                    </button>

                                    <div className="flex items-center gap-6 mb-6">
                                        <span className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-100">
                                            {it.dayNumber}
                                        </span>
                                        <div className="flex-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Tiêu đề ngày khởi hành</label>
                                            <input
                                                className="w-full p-4 bg-white rounded-2xl mt-1 font-bold outline-none focus:ring-2 focus:ring-blue-500 border-none text-gray-800"
                                                placeholder="Ví dụ: Khám phá Cao nguyên đá..."
                                                // FIX LỖI: Luôn đảm bảo giá trị không bị undefined
                                                value={it.title || ''}
                                                onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Hoạt động chi tiết trong ngày</label>
                                        <textarea
                                            className="w-full p-6 bg-white rounded-[2rem] mt-1 h-36 outline-none focus:ring-2 focus:ring-blue-500 border-none text-gray-600 leading-relaxed font-medium"
                                            placeholder="Ghi rõ các địa điểm tham quan, ăn uống..."
                                            // FIX LỖI: Luôn đảm bảo giá trị không bị undefined
                                            value={it.description || ''}
                                            onChange={(e) => handleItineraryChange(index, 'description', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))
                        )}

                        <button
                            onClick={addDay}
                            className="w-full py-8 border-4 border-dashed border-gray-100 text-gray-400 rounded-[2.5rem] font-black hover:border-blue-200 hover:text-blue-500 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter group"
                        >
                            <Plus size={28} className="group-hover:scale-125 transition-transform" /> Thêm ngày tiếp theo
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTourDetail;