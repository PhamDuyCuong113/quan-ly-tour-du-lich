import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    Calendar, Users, Star, MapPin, Tag, Minus, Plus, Zap, Phone, X,
    CheckCircle2, ChevronDown, Clock, Map, Info, ChevronLeft, ChevronRight, Image as ImageIcon
} from 'lucide-react';
import { formatMainImageUrl, formatThumbnailUrl } from '../utils/cloudinaryHelper';

const TourDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // --- 1. KHAI BÁO STATES ---
    const [tour, setTour] = useState(null);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [numAdults, setNumAdults] = useState(2);
    const [numChildren, setNumChildren] = useState(0);
    const [numInfants, setNumInfants] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [relatedTours, setRelatedTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showContactForm, setShowContactForm] = useState(false);
    const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '', note: '' });

    const [expandedDays, setExpandedDays] = useState([]);
    const [openSections, setOpenSections] = useState(['inclusions']); // default open 'inclusions'

    const toggleSection = (sec) => {
        setOpenSections(prev => prev.includes(sec) ? prev.filter(s => s !== sec) : [...prev, sec]);
    };

    const toggleDay = (day) => {
        if (expandedDays.includes(day)) {
            setExpandedDays(expandedDays.filter(d => d !== day));
        } else {
            setExpandedDays([...expandedDays, day]);
        }
    };

    const toggleAllDays = () => {
        if (tour?.itineraries && expandedDays.length === tour.itineraries.length) {
            setExpandedDays([]);
        } else {
            setExpandedDays(tour?.itineraries?.map(it => it.dayNumber) || []);
        }
    };

    const totalPeople = numAdults + numChildren + numInfants;
    const totalPrice = (selectedSchedule?.price || 0) * numAdults;

    // Helper: format ngày thành "T2, 28/05"
    const formatScheduleTab = (dateStr) => {
        const d = new Date(dateStr);
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const dayName = dayNames[d.getDay()];
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        return { dayName, date: `${dd}/${mm}` };
    };

    // --- 2. GỌI API ĐỒNG BỘ ---
    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [tourRes, reviewRes, relatedRes] = await Promise.all([
                    api.get(`/tours/${id}`),
                    api.get(`/tours/${id}/reviews`),
                    api.get(`/tours/${id}/related`)
                ]);
                setTour(tourRes.data);
                setReviews(reviewRes.data);
                setRelatedTours(relatedRes.data);
                setActiveImageIndex(0);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [id]);

    // --- 3. XỬ LÝ ĐẶT TOUR ---
    const handleBooking = async () => {
        if (!selectedSchedule) return alert("Vui lòng chọn ngày khởi hành!");
        if (numAdults < 1) return alert("Cần ít nhất 1 người lớn!");

        try {
            const bookingData = {
                scheduleId: selectedSchedule.scheduleId,
                numberOfPeople: totalPeople,
                promotionCode: ''
            };
            const response = await api.post('/bookings', bookingData);
            alert("Đặt tour thành công! Mã đơn: #" + response.data.bookingId);
            navigate('/my-bookings');
        } catch (error) {
            alert(error.response?.data?.message || "Đặt tour thất bại!");
            if (error.response?.status === 401) navigate('/login');
        }
    };

    const handleContactSubmit = (e) => {
        e.preventDefault();
        if (!contactForm.name || !contactForm.phone) return alert("Vui lòng nhập họ tên và số điện thoại!");
        alert("Yêu cầu tư vấn đã được gửi! Chúng tôi sẽ liên hệ bạn sớm nhất.");
        setShowContactForm(false);
        setContactForm({ name: '', phone: '', email: '', note: '' });
    };

    const imageList = useMemo(() => {
        const imgs = (tour?.images || [])
            .map((img) => img.imageUrl)
            .filter(Boolean);
        return imgs.length > 0
            ? imgs
            : (tour?.imageUrl ? [tour.imageUrl] : []);
    }, [tour]);

    const hasImages = imageList.length > 0;
    const activeImage = hasImages ? imageList[Math.min(activeImageIndex, imageList.length - 1)] : null;

    const goPrevImage = () => {
        if (imageList.length < 2) return;
        setActiveImageIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
    };

    const goNextImage = () => {
        if (imageList.length < 2) return;
        setActiveImageIndex((prev) => (prev + 1) % imageList.length);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-white">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-blue-600 font-black uppercase tracking-widest animate-pulse">Đang chuẩn bị hành trình...</p>
        </div>
    );

    if (!tour) return <div className="text-center p-20 text-gray-500">Tour không tồn tại hoặc đã bị xóa.</div>;

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* --- CỘT TRÁI: THÔNG TIN CHI TIẾT --- */}
                <div className="lg:col-span-2">
                    {/* Header: Tên & Rating */}
                    <div className="mb-8">
                        <h1 className="text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tight italic">
                            {tour.tourName}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2 bg-yellow-400 text-white px-5 py-2 rounded-2xl shadow-lg shadow-yellow-100">
                                <Star size={20} fill="currentColor" />
                                <span className="text-xl font-black">{tour.averageRating || '0.0'}</span>
                                <span className="text-xs font-bold opacity-80">| {reviews.length} đánh giá</span>
                            </div>
                            <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-100">
                                {tour.tourCode}
                            </div>
                            <div className="flex items-center gap-2 font-bold text-gray-500 border-l pl-5 border-gray-200">
                                <MapPin size={20} className="text-red-500" /> {tour.destination}
                            </div>
                            {tour.departureFrom && (
                                <div className="flex items-center gap-2 font-bold text-gray-500 border-l pl-5 border-gray-200">
                                    <MapPin size={20} className="text-green-500" /> Khởi hành từ: {tour.departureFrom}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ảnh chính của Tour */}
                    <div className="rounded-[3.5rem] overflow-hidden shadow-2xl mb-6 h-[550px] border-8 border-white bg-gray-100 relative">
                        {activeImage ? (
                            <img
                                src={formatMainImageUrl(activeImage)}
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                alt={tour.tourName}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                                Chưa có ảnh
                            </div>
                        )}

                        {imageList.length > 1 && (
                            <>
                                <button
                                    onClick={goPrevImage}
                                    className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 text-gray-700 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                                    aria-label="Ảnh trước"
                                >
                                    <ChevronLeft size={28} />
                                </button>
                                <button
                                    onClick={goNextImage}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 text-gray-700 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                                    aria-label="Ảnh sau"
                                >
                                    <ChevronRight size={28} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {imageList.length > 1 && (
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-4 mb-12">
                            {imageList.map((img, idx) => (
                                <button
                                    key={`${img}-${idx}`}
                                    onClick={() => setActiveImageIndex(idx)}
                                    className={`rounded-2xl overflow-hidden border-4 transition-all ${
                                        idx === activeImageIndex
                                            ? 'border-blue-600 shadow-lg'
                                            : 'border-white hover:border-blue-200'
                                    }`}
                                    aria-label={`Ảnh ${idx + 1}`}
                                >
                                    <img
                                        src={formatThumbnailUrl(img)}
                                        className="w-full h-20 object-cover"
                                        alt={`${tour.tourName} ${idx + 1}`}
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Giới thiệu tổng quan */}
                    <div className="mb-16">
                        <h3 className="text-3xl font-black mb-6 text-gray-800 flex items-center gap-3">
                            <Info className="text-blue-600" /> Giới thiệu chuyến đi
                        </h3>
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-50 leading-relaxed text-xl text-gray-600 italic">
                            "{tour.description}"
                        </div>
                    </div>
                    
                    {/* Phương tiện và lưu trú */}
                    {(tour.transport || tour.accommodation) && (
                        <div className="flex gap-4 mb-10">
                            {tour.transport && (
                                <div className="bg-blue-50/50 px-6 py-4 rounded-2xl flex items-center gap-3">
                                    <Clock className="text-blue-500" />
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-gray-400">Phương tiện</p>
                                        <p className="font-bold text-gray-800">{tour.transport}</p>
                                    </div>
                                </div>
                            )}
                            {tour.accommodation && (
                                <div className="bg-blue-50/50 px-6 py-4 rounded-2xl flex items-center gap-3">
                                    <Map className="text-blue-500" />
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-gray-400">Nơi lưu trú</p>
                                        <p className="font-bold text-gray-800">{tour.accommodation}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Điểm nhấn hành trình */}
                    {tour.highlights && (
                        <div className="mb-16">
                            <h3 className="text-3xl font-black mb-6 text-gray-800 flex items-center gap-3">
                                <Star className="text-orange-500" fill="currentColor" /> Điểm nhấn hành trình
                            </h3>
                            <div className="bg-orange-50/30 p-8 rounded-[2rem] border border-orange-100 text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
                                {tour.highlights}
                            </div>
                        </div>
                    )}

                    {/* Lịch trình chi tiết (Itineraries) */}
                    <div className="mb-16 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                            <h3 className="text-2xl font-bold text-gray-800">
                                Chương trình tour
                            </h3>
                            <button onClick={toggleAllDays} className="text-gray-600 font-medium hover:text-blue-600 transition-colors">
                                {tour.itineraries && expandedDays.length === tour.itineraries.length ? 'Thu gọn' : 'Xem tất cả'}
                            </button>
                        </div>
                        
                        <div className="space-y-0">
                            {tour.itineraries && tour.itineraries.length > 0 ? (
                                tour.itineraries.map((step, idx) => {
                                    const isExpanded = expandedDays.includes(step.dayNumber);
                                    const isLast = idx === tour.itineraries.length - 1;
                                    
                                    return (
                                        <div key={step.itineraryId} className={`transition-all ${!isLast ? 'border-b border-gray-100' : ''}`}>
                                            {!isExpanded ? (
                                                // CHẾ ĐỘ THU GỌN
                                                <div 
                                                    className="flex items-center justify-between py-6 cursor-pointer group hover:bg-gray-50/50 rounded-xl px-2 transition-colors"
                                                    onClick={() => toggleDay(step.dayNumber)}
                                                >
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-32 h-20 rounded-xl overflow-hidden shadow-sm shrink-0 bg-gray-100">
                                                            {step.imageUrl ? (
                                                                <img src={step.imageUrl} alt={`Ngày ${step.dayNumber}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                    <ImageIcon size={24} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-[#33B5E5] font-medium text-lg mb-1">Ngày {step.dayNumber}</p>
                                                            <p className="text-gray-800 font-medium text-lg">{step.title}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronDown className="text-gray-400 group-hover:text-gray-600 transition-colors" size={20} />
                                                </div>
                                            ) : (
                                                // CHẾ ĐỘ MỞ RỘNG
                                                <div className="py-6 animate-in slide-in-from-top-2 duration-300">
                                                    <div 
                                                        className="bg-[#F8F9FA] rounded-xl p-6 cursor-pointer flex justify-between items-center group mb-6"
                                                        onClick={() => toggleDay(step.dayNumber)}
                                                    >
                                                        <div>
                                                            <p className="text-[#33B5E5] font-medium text-lg mb-1">Ngày {step.dayNumber}</p>
                                                            <p className="text-gray-800 font-medium text-lg">{step.title}</p>
                                                        </div>
                                                        <ChevronDown className="text-gray-400 group-hover:text-gray-600 rotate-180 transition-all" size={20} />
                                                    </div>
                                                    
                                                    <div className="text-gray-700 leading-relaxed text-[15px] space-y-4 px-2 whitespace-pre-wrap">
                                                        {step.description}
                                                    </div>
                                                    
                                                    {step.imageUrl && (
                                                        <div className="mt-6 px-2">
                                                            <div className="rounded-xl overflow-hidden shadow-sm">
                                                                <img src={step.imageUrl} alt={step.title} className="w-full object-cover max-h-[500px]" />
                                                            </div>
                                                            <p className="text-center text-gray-500 italic text-sm mt-3">{step.title}.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-gray-400 italic py-10 text-center">Nội dung chi tiết từng ngày đang được cập nhật...</p>
                            )}
                        </div>
                    </div>



                    {/* Accordions: Bao gồm, Không bao gồm, Điều khoản */}
                    <div className="space-y-4 mb-16">
                        {/* Giá Tour Bao Gồm */}
                        {tour.inclusions && (
                            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                                <div 
                                    className="p-6 cursor-pointer flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                                    onClick={() => toggleSection('inclusions')}
                                >
                                    <h4 className="font-black text-xl text-gray-800">Giá Tour Bao Gồm</h4>
                                    <ChevronDown className={`text-gray-400 transition-transform ${openSections.includes('inclusions') ? 'rotate-180' : ''}`} />
                                </div>
                                {openSections.includes('inclusions') && (
                                    <div className="p-6 text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                                        {tour.inclusions}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Giá Tour Không Bao Gồm */}
                        {tour.exclusions && (
                            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                                <div 
                                    className="p-6 cursor-pointer flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                                    onClick={() => toggleSection('exclusions')}
                                >
                                    <h4 className="font-black text-xl text-gray-800">Giá Tour Không Bao Gồm</h4>
                                    <ChevronDown className={`text-gray-400 transition-transform ${openSections.includes('exclusions') ? 'rotate-180' : ''}`} />
                                </div>
                                {openSections.includes('exclusions') && (
                                    <div className="p-6 text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                                        {tour.exclusions}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Điều Khoản & Lưu Ý */}
                        {tour.terms && (
                            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                                <div 
                                    className="p-6 cursor-pointer flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                                    onClick={() => toggleSection('terms')}
                                >
                                    <h4 className="font-black text-xl text-gray-800">Điều Khoản & Lưu Ý</h4>
                                    <ChevronDown className={`text-gray-400 transition-transform ${openSections.includes('terms') ? 'rotate-180' : ''}`} />
                                </div>
                                {openSections.includes('terms') && (
                                    <div className="p-6 text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                                        {tour.terms}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Review của khách hàng */}
                    <div className="mt-24 border-t border-gray-100 pt-20">
                        <div className="flex justify-between items-end mb-12">
                            <h3 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Trải nghiệm thực tế</h3>
                            <span className="text-gray-400 font-bold italic">{reviews.length} cảm nhận từ khách hàng</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {reviews.length === 0 ? (
                                <p className="text-gray-400 italic">Chưa có đánh giá nào cho chuyến đi này.</p>
                            ) : (
                                reviews.map(rev => (
                                    <div key={rev.reviewId} className="bg-white p-10 rounded-[3rem] border border-gray-50 shadow-sm relative hover:-translate-y-2 transition-transform">
                                        <div className="flex items-center gap-5 mb-6">
                                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
                                                {rev.customerName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-800 text-lg">{rev.customerName}</p>
                                                <div className="flex text-yellow-400 gap-1 mt-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} fill={i < rev.rating ? "currentColor" : "none"} className={i < rev.rating ? "" : "text-gray-200"} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 italic leading-relaxed text-lg">"{rev.comment}"</p>
                                        <p className="text-[10px] text-gray-300 mt-6 uppercase font-black tracking-widest">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* --- CỘT PHẢI: BOOKING CARD (STICKY) --- */}
                <div className="relative">
                    <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-200 sticky top-28">
                        {/* Header */}
                        <h3 className="text-xl font-extrabold text-gray-800 mb-1">Lịch Trình và Giá Tour</h3>
                        <p className="text-sm text-gray-500 mb-5">Chọn Lịch Trình và Xem Giá:</p>

                        {/* Schedule Tabs */}
                        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
                            {tour.schedules?.map(s => {
                                const fmt = formatScheduleTab(s.departureDate);
                                const isSelected = selectedSchedule?.scheduleId === s.scheduleId;
                                return (
                                    <button
                                        key={s.scheduleId}
                                        onClick={() => setSelectedSchedule(s)}
                                        className={`flex-shrink-0 px-4 py-2.5 rounded-lg border-2 text-center transition-all duration-200 cursor-pointer ${
                                            isSelected
                                                ? 'border-cyan-400 bg-cyan-50 shadow-sm'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    >
                                        <span className="block text-xs font-bold text-gray-500">{fmt.dayName}</span>
                                        <span className="block text-sm font-extrabold text-gray-800">{fmt.date}</span>
                                    </button>
                                );
                            })}
                            <button className="flex-shrink-0 px-4 py-2.5 rounded-lg border-2 border-gray-200 bg-white hover:border-gray-300 flex items-center gap-1.5 transition-all cursor-pointer">
                                <Calendar size={16} className="text-gray-500" />
                                <span className="text-sm font-bold text-gray-500">Tất cả</span>
                            </button>
                        </div>

                        {/* Passenger Categories */}
                        <div className="border border-gray-200 rounded-xl divide-y divide-gray-200 mb-5">
                            {/* Người lớn */}
                            <div className="p-4 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-800">Người lớn</span>
                                        {selectedSchedule && (
                                            <span className="text-sm text-orange-500 font-semibold">
                                                x {new Intl.NumberFormat('vi-VN').format(selectedSchedule.price)}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-400">&gt; 10 tuổi</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setNumAdults(Math.max(1, numAdults - 1))}
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors cursor-pointer disabled:opacity-30"
                                        disabled={numAdults <= 1}
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="text-lg font-extrabold text-gray-800 w-6 text-center">{numAdults}</span>
                                    <button
                                        onClick={() => setNumAdults(numAdults + 1)}
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors cursor-pointer"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                            {/* Trẻ em */}
                            <div className="p-4 flex items-center justify-between">
                                <div>
                                    <span className="font-bold text-gray-800">Trẻ em</span>
                                    <br />
                                    <span className="text-xs text-gray-400">2 - 10 tuổi</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setNumChildren(Math.max(0, numChildren - 1))}
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors cursor-pointer disabled:opacity-30"
                                        disabled={numChildren <= 0}
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="text-lg font-extrabold text-gray-800 w-6 text-center">{numChildren}</span>
                                    <button
                                        onClick={() => setNumChildren(numChildren + 1)}
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors cursor-pointer"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                            {/* Trẻ nhỏ */}
                            <div className="p-4 flex items-center justify-between">
                                <div>
                                    <span className="font-bold text-gray-800">Trẻ nhỏ</span>
                                    <br />
                                    <span className="text-xs text-gray-400">&lt; 2 tuổi</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setNumInfants(Math.max(0, numInfants - 1))}
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors cursor-pointer disabled:opacity-30"
                                        disabled={numInfants <= 0}
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="text-lg font-extrabold text-gray-800 w-6 text-center">{numInfants}</span>
                                    <button
                                        onClick={() => setNumInfants(numInfants + 1)}
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors cursor-pointer"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Available Slots */}
                        {selectedSchedule && (
                            <div className="flex items-center gap-2 mb-4 text-gray-600">
                                <Zap size={16} className="text-orange-500" />
                                <span className="text-sm font-semibold">Còn nhận <strong className="text-orange-600">{selectedSchedule.availableSlots}</strong> chỗ</span>
                            </div>
                        )}

                        {/* Total Price */}
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-base text-gray-500 font-medium">Tổng Giá Tour</span>
                            <span className="text-2xl font-extrabold text-orange-500">
                                {new Intl.NumberFormat('vi-VN').format(totalPrice)} <span className="text-base">đ</span>
                            </span>
                        </div>

                        {/* CTA Buttons */}
                        <button
                            onClick={handleBooking}
                            disabled={!selectedSchedule}
                            className={`w-full py-4 rounded-full font-bold text-lg mb-3 transition-all active:scale-[0.98] cursor-pointer ${
                                selectedSchedule
                                    ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            Đặt giữ chỗ ngay
                        </button>
                        <button
                            onClick={() => setShowContactForm(true)}
                            className="w-full py-4 rounded-full font-bold text-lg border-2 border-orange-400 text-orange-500 hover:bg-orange-50 transition-all active:scale-[0.98] cursor-pointer"
                        >
                            Liên hệ tư vấn
                        </button>
                    </div>
                </div>
            </div>

            {/* --- PHẦN TOUR LIÊN QUAN --- */}
            <div className="mt-40 border-t border-gray-100 pt-24 pb-20">
                <div className="text-center mb-20">
                    <h3 className="text-5xl font-black text-gray-900 uppercase tracking-tighter italic">Gợi ý dành riêng cho bạn</h3>
                    <p className="text-gray-400 mt-4 text-xl font-medium">Khám phá thêm những hành trình tương tự đến {tour.destination}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
                    {relatedTours.length > 0 ? (
                        relatedTours.map(t => (
                            <div
                                key={t.tourId}
                                onClick={() => navigate(`/tours/${t.tourId}`)}
                                className="cursor-pointer group bg-white rounded-[3rem] p-6 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-500 border border-gray-100 flex flex-col h-full"
                            >
                                <div className="h-56 rounded-[2.5rem] overflow-hidden mb-8 shadow-inner">
                                    <img
                                        src={t.imageUrl || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1000'}
                                        className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000"
                                        alt={t.tourName}
                                    />
                                </div>
                                <h4 className="font-black text-2xl text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors mb-4 px-2 tracking-tighter">
                                    {t.tourName}
                                </h4>
                                <div className="flex justify-between items-center mt-auto px-2">
                                    <p className="text-blue-600 font-black text-xl tracking-tight">
                                        {new Intl.NumberFormat('vi-VN').format(t.basePrice)}đ
                                    </p>
                                    <div className="flex items-center text-xs font-black text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-2xl border border-yellow-100">
                                        <Star size={12} className="fill-current mr-1 text-yellow-500"/> {t.averageRating || '0.0'}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-4 text-center py-20 bg-gray-50 rounded-[4rem] border-2 border-dashed border-gray-200">
                            <p className="text-gray-400 font-black uppercase text-sm tracking-widest">Chúng tôi đang cập nhật thêm tour tương tự...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODAL: YÊU CẦU ĐẶT --- */}
            {showContactForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowContactForm(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowContactForm(false)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                            <X size={16} />
                        </button>

                        <h3 className="text-2xl font-extrabold text-gray-800 mb-2">Yêu cầu đặt</h3>
                        <p className="text-sm text-gray-500 mb-6">Chúng tôi sẽ liên hệ tư vấn cho bạn ngay khi nhận được yêu cầu. Vui lòng cung cấp các thông tin dưới đây.</p>

                        <form onSubmit={handleContactSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Họ và Tên <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={contactForm.name}
                                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-orange-400 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                                <input
                                    type="tel"
                                    value={contactForm.phone}
                                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-orange-400 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Email (tùy chọn)</label>
                                <input
                                    type="email"
                                    value={contactForm.email}
                                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-orange-400 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Ghi chú / Yêu cầu thêm</label>
                                <textarea
                                    value={contactForm.note}
                                    onChange={(e) => setContactForm({ ...contactForm, note: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-orange-400 transition-colors resize-none"
                                    rows={3}
                                    placeholder="Ví dụ: đi 2 người lớn, đoàn 10 người..."
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 rounded-full font-bold text-lg bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-all active:scale-[0.98] cursor-pointer"
                            >
                                Gửi yêu cầu
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TourDetail;