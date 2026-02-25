import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Save, Trash2, Plus, ArrowLeft, Image as ImageIcon, Map, Calendar, Info, Clock } from 'lucide-react';

const AdminTourDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tour, setTour] = useState(null);
    const [activeTab, setActiveTab] = useState('basic'); // basic, images, itinerary

    const fetchDetail = async () => {
        try {
            const res = await api.get(`/tours/${id}`);
            setTour(res.data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => { fetchDetail(); }, [id]);

    const handleUpdateTour = async () => {
        try {
            // Backend cần API PUT /api/tours/{id}
            await api.put(`/tours/${id}`, tour);
            alert("Cập nhật thông tin thành công!");
            fetchDetail();
        } catch (error) { alert("Lỗi cập nhật. Hãy chắc chắn Backend đã có API PUT!"); }
    };

    const handleDeleteImage = async (imgId) => {
        if(window.confirm("Xóa ảnh này?")) {
            try {
                // Backend cần API DELETE /api/tours/images/{imgId}
                await api.delete(`/tours/images/${imgId}`);
                fetchDetail();
            } catch (error) { alert("Lỗi khi xóa ảnh!"); }
        }
    };

    const handleAddItinerary = async () => {
        const title = prompt("Nhập tiêu đề ngày mới:");
        const description = prompt("Nhập mô tả hoạt động:");
        if (title && description) {
            try {
                const nextDay = (tour.itineraries?.length || 0) + 1;
                await api.post(`/tours/${id}/itineraries`, [
                    { dayNumber: nextDay, title, description }
                ]);
                fetchDetail();
            } catch (error) { alert("Lỗi thêm lịch trình chi tiết!"); }
        }
    };

    if (!tour) return <div className="p-20 text-center font-black text-gray-300 animate-pulse">ĐANG TẢI DỮ LIỆU...</div>;

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <button onClick={() => navigate('/admin/tours')} className="flex items-center gap-2 text-gray-400 mb-8 hover:text-black font-bold uppercase text-xs tracking-widest transition-all">
                <ArrowLeft size={16}/> Quay lại danh sách
            </button>

            <div className="flex justify-between items-start mb-12">
                <div>
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{tour.tourCode}</span>
                    <h1 className="text-4xl font-black text-gray-800 mt-2 uppercase tracking-tighter italic">Biên tập: {tour.tourName}</h1>
                </div>
                <button onClick={handleUpdateTour} className="bg-blue-600 text-white px-10 py-4 rounded-[1.5rem] font-black flex items-center gap-2 shadow-2xl hover:bg-blue-700 transition-all active:scale-95">
                    <Save size={20}/> LƯU THAY ĐỔI
                </button>
            </div>

            {/* TABS */}
            <div className="flex gap-4 mb-10 bg-white p-2 rounded-3xl shadow-sm w-fit border border-gray-100">
                <button onClick={() => setActiveTab('basic')} className={`px-8 py-3 rounded-2xl font-black text-sm transition-all ${activeTab === 'basic' ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-50'}`}>THÔNG TIN CHUNG</button>
                <button onClick={() => setActiveTab('images')} className={`px-8 py-3 rounded-2xl font-black text-sm transition-all ${activeTab === 'images' ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-50'}`}>THƯ VIỆN ẢNH</button>
                <button onClick={() => setActiveTab('itinerary')} className={`px-8 py-3 rounded-2xl font-black text-sm transition-all ${activeTab === 'itinerary' ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-50'}`}>HÀNH TRÌNH</button>
            </div>

            <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
                {activeTab === 'basic' && (
                    <div className="grid grid-cols-2 gap-8">
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Tên Tour hiển thị</label>
                            <input className="w-full p-5 bg-gray-50 rounded-2xl mt-2 font-bold text-gray-700 border-none outline-none focus:ring-2 focus:ring-blue-500" value={tour.tourName} onChange={e => setTour({...tour, tourName: e.target.value})} />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Địa danh</label>
                            <input className="w-full p-5 bg-gray-50 rounded-2xl mt-2 font-bold text-gray-700" value={tour.destination} onChange={e => setTour({...tour, destination: e.target.value})} />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Giá sàn (VNĐ)</label>
                            <input className="w-full p-5 bg-gray-50 rounded-2xl mt-2 font-bold text-gray-700" type="number" value={tour.basePrice} onChange={e => setTour({...tour, basePrice: e.target.value})} />
                        </div>
                        <div className="col-span-2 border-t pt-8 mt-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 italic">Mô tả bài viết giới thiệu</label>
                            <textarea className="w-full p-5 bg-gray-50 rounded-2xl mt-2 h-64 font-medium text-gray-600 leading-relaxed border-none outline-none focus:ring-2 focus:ring-blue-500" value={tour.description} onChange={e => setTour({...tour, description: e.target.value})} />
                        </div>
                    </div>
                )}

                {activeTab === 'images' && (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            {tour.images?.map(img => (
                                <div key={img.imageId} className="relative group rounded-[2rem] overflow-hidden h-56 shadow-md border-4 border-white">
                                    <img src={img.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                        <button onClick={() => handleDeleteImage(img.imageId)} className="p-4 bg-white text-red-500 rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all">
                                            <Trash2 size={24}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-16 border-4 border-dashed border-gray-100 rounded-[3rem] text-center bg-gray-50/50">
                            <ImageIcon className="mx-auto mb-6 text-gray-200" size={64}/>
                            <p className="text-gray-400 font-bold mb-8 uppercase tracking-widest text-xs">Kéo thả hoặc chọn tệp để thêm ảnh mới</p>
                            <input type="file" id="file-upload" className="hidden" onChange={async (e) => {
                                const formData = new FormData();
                                formData.append('file', e.target.files[0]);
                                await api.post(`/tours/${id}/upload`, formData);
                                fetchDetail(); // Load lại ảnh
                            }} />
                            <label htmlFor="file-upload" className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black cursor-pointer hover:bg-blue-600 transition-all shadow-xl uppercase tracking-tighter">Tải ảnh lên hệ thống</label>
                        </div>
                    </div>
                )}

                {activeTab === 'itinerary' && (
                    <div className="space-y-8">
                        {tour.itineraries?.sort((a,b) => a.dayNumber - b.dayNumber).map((it, idx) => (
                            <div key={idx} className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 relative shadow-sm">
                                <div className="absolute -top-4 left-8 bg-black text-white px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">
                                    NGÀY {it.dayNumber}
                                </div>
                                <h4 className="text-xl font-black text-gray-800 mb-3 italic">"{it.title}"</h4>
                                <p className="text-gray-500 leading-relaxed font-medium">{it.description}</p>
                            </div>
                        ))}
                        <button
                            onClick={handleAddItinerary}
                            className="w-full py-6 border-4 border-dashed border-blue-50 text-blue-600 rounded-[2.5rem] font-black hover:bg-blue-50 hover:border-blue-100 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"
                        >
                            <Plus size={24}/> THÊM LỊCH TRÌNH NGÀY TIẾP THEO
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTourDetail;