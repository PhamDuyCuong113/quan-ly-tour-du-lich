import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api from '../api/axios';
import { Star, MapPin, Clock, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeGrid as Grid } from 'react-window';
import { formatThumbnailUrl } from '../utils/cloudinaryHelper';

const useDebouncedValue = (value, delayMs) => {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(timer);
    }, [value, delayMs]);

    return debounced;
};

const TourCard = memo(({ tour, onOpen }) => {
    return (
        <div className="group bg-white rounded-[2.5rem] shadow-sm hover:shadow-3xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="relative overflow-hidden h-72">
                <img
                    src={formatThumbnailUrl(tour.imageUrl) || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000'}
                    alt={tour.tourName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    decoding="async"
                />
                <div className="absolute top-5 left-5 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl flex items-center shadow-md">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="ml-1.5 text-sm font-black text-gray-800">{tour.averageRating || '0.0'}</span>
                </div>
                <div className="absolute bottom-5 left-5 bg-black/50 backdrop-blur text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter">
                    Mã: {tour.tourCode}
                </div>
            </div>

            <div className="p-8 flex-1 flex flex-col">
                <h2 className="text-2xl font-black text-gray-800 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                    {tour.tourName}
                </h2>

                <div className="flex items-center gap-3 mb-8">
                    <div className="flex items-center text-gray-500 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                        <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="text-xs font-black uppercase tracking-tight">{tour.destination}</span>
                    </div>
                    <div className="flex items-center text-gray-500 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="text-xs font-black uppercase tracking-tight">{tour.durationDays} Ngày</span>
                    </div>
                </div>

                <div className="flex justify-between items-end mt-auto pt-6 border-t border-gray-50">
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Giá chỉ từ</p>
                        <p className="text-3xl font-black text-blue-600">
                            {new Intl.NumberFormat('vi-VN').format(tour.basePrice)}<span className="text-sm ml-1">₫</span>
                        </p>
                    </div>
                    <button
                        onClick={onOpen}
                        className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-blue-600 transition-all duration-300 shadow-xl active:scale-95"
                    >
                        XEM NGAY
                    </button>
                </div>
            </div>
        </div>
    );
});

const SkeletonCard = () => (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden h-[520px] animate-pulse">
        <div className="h-72 bg-gray-100" />
        <div className="p-8 space-y-4">
            <div className="h-6 bg-gray-100 rounded-xl" />
            <div className="h-6 bg-gray-100 rounded-xl w-2/3" />
            <div className="h-10 bg-gray-100 rounded-2xl" />
            <div className="h-12 bg-gray-100 rounded-2xl" />
        </div>
    </div>
);

const Home = () => {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // States cho bộ lọc tìm kiếm
    const [searchDest, setSearchDest] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const cacheRef = useRef(new Map());
    const filterState = useMemo(() => ({ searchDest, minPrice, maxPrice }), [searchDest, minPrice, maxPrice]);
    const debouncedFilters = useDebouncedValue(filterState, 300);

    // Hàm lấy danh sách tour ban đầu
    const fetchTours = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/tours');
            setTours(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách tour:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Hàm xử lý tìm kiếm và lọc
    const handleSearch = useCallback(async (e, filters = null) => {
        if (e) e.preventDefault();
        const payload = filters || { searchDest, minPrice, maxPrice };
        const destination = payload.searchDest || undefined;
        const normalizedMin = payload.minPrice || 0;
        const normalizedMax = payload.maxPrice || 999999999;

        const cacheKey = JSON.stringify({ destination, normalizedMin, normalizedMax });
        if (cacheRef.current.has(cacheKey)) {
            setTours(cacheRef.current.get(cacheKey));
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await api.get('/tours/search', {
                params: {
                    destination,
                    minPrice: normalizedMin,
                    maxPrice: normalizedMax
                }
            });
            cacheRef.current.set(cacheKey, response.data);
            setTours(response.data);
        } catch (error) {
            console.error("Lỗi tìm kiếm:", error);
        } finally {
            setLoading(false);
        }
    }, [searchDest, minPrice, maxPrice]);

    // Hàm xóa bộ lọc
    const resetFilters = () => {
        setSearchDest('');
        setMinPrice('');
        setMaxPrice('');
        fetchTours();
    };

    useEffect(() => {
        if (!debouncedFilters.searchDest && !debouncedFilters.minPrice && !debouncedFilters.maxPrice) {
            fetchTours();
            return;
        }
        handleSearch(null, debouncedFilters);
    }, [debouncedFilters, fetchTours, handleSearch]);

    // Hàm cuộn xuống phần tìm kiếm
    const scrollToSearch = () => {
        document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' });
    };

    const skeletonCount = 6;
    const renderSkeletons = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {Array.from({ length: skeletonCount }).map((_, idx) => (
                <SkeletonCard key={idx} />
            ))}
        </div>
    );

    return (
        <>
            {/* 1. HERO SECTION - BANNER CỰC KHÉT */}
            <div className="relative h-[600px] w-full overflow-hidden mb-12">
                <img
                    src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2000"
                    className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000"
                    alt="Hero"
                    loading="eager"
                    fetchpriority="high"
                    decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center">
                    <div className="container mx-auto px-10">
                        <div className="max-w-2xl text-white">
                            <h1 className="text-7xl font-black mb-6 leading-[1.1] tracking-tighter">
                                Xách ba lô lên <br/> <span className="text-blue-400">và đi thôi!</span>
                            </h1>
                            <p className="text-xl text-gray-200 mb-10 font-medium">
                                Hàng trăm tour du lịch giá rẻ đang đợi bạn khám phá. <br/>
                                Đừng bỏ lỡ kỳ nghỉ hè tuyệt vời này cùng TOURING.
                            </p>
                            <button
                                onClick={scrollToSearch}
                                className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-black text-lg hover:bg-blue-50 transition-all hover:shadow-2xl hover:-translate-y-1 active:scale-95"
                            >
                                Khám phá ngay
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-6" id="search-section">
                {/* 2. HEADER DANH SÁCH */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black mb-4 text-gray-900 tracking-tight uppercase">
                        Gợi ý <span className="text-blue-600">điểm đến</span> cho bạn
                    </h1>
                    <p className="text-gray-500 text-lg">Tìm kiếm những chuyến đi tuyệt vời nhất dựa trên ngân sách của bạn</p>
                </div>

                {/* 3. THANH TÌM KIẾM & BỘ LỌC */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-gray-50 mb-16 max-w-5xl mx-auto -mt-20 relative z-20">
                    <form onSubmit={handleSearch} className="flex flex-wrap lg:flex-nowrap gap-4 items-end">
                        <div className="flex-1 min-w-[250px]">
                            <label className="flex items-center text-sm font-black text-gray-400 uppercase mb-2 ml-2 tracking-widest">
                                <MapPin className="w-3 h-3 mr-1 text-blue-600" /> Bạn muốn đi đâu?
                            </label>
                            <input
                                type="text"
                                placeholder="Tên thành phố, điểm đến..."
                                className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-700"
                                value={searchDest}
                                onChange={(e) => setSearchDest(e.target.value)}
                            />
                        </div>

                        <div className="w-full sm:w-44">
                            <label className="text-[10px] font-black text-gray-400 uppercase mb-2 ml-2 tracking-widest">Giá từ</label>
                            <input
                                type="number"
                                placeholder="VNĐ"
                                className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-700"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                        </div>

                        <div className="w-full sm:w-44">
                            <label className="text-[10px] font-black text-gray-400 uppercase mb-2 ml-2 tracking-widest">Đến</label>
                            <input
                                type="number"
                                placeholder="VNĐ"
                                className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-700"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 w-full lg:w-auto">
                            <button
                                type="submit"
                                className="flex-1 lg:flex-none bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-200"
                            >
                                <Search className="w-5 h-5" /> TÌM
                            </button>
                            {(searchDest || minPrice || maxPrice) && (
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                    title="Xóa bộ lọc"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* 4. DANH SÁCH TOUR */}
                {loading ? (
                    renderSkeletons()
                ) : tours.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                        <p className="text-xl text-gray-500 font-bold">Rất tiếc, không tìm thấy tour nào phù hợp! 😅</p>
                        <button onClick={resetFilters} className="mt-4 text-blue-600 font-black hover:underline">XEM TẤT CẢ TOUR</button>
                    </div>
                ) : (
                    <div className="h-[1400px]">
                        <AutoSizer>
                            {({ width, height }) => {
                                const columnCount = width >= 1024 ? 3 : width >= 768 ? 2 : 1;
                                const rowCount = Math.ceil(tours.length / columnCount);
                                const columnWidth = Math.floor(width / columnCount);
                                const rowHeight = 520;

                                return (
                                    <Grid
                                        columnCount={columnCount}
                                        columnWidth={columnWidth}
                                        height={height}
                                        rowCount={rowCount}
                                        rowHeight={rowHeight}
                                        width={width}
                                    >
                                        {({ columnIndex, rowIndex, style }) => {
                                            const index = rowIndex * columnCount + columnIndex;
                                            if (index >= tours.length) return null;
                                            const tour = tours[index];

                                            return (
                                                <div style={style} className="p-6">
                                                    <TourCard
                                                        tour={tour}
                                                        onOpen={() => navigate(`/tours/${tour.tourId}`)}
                                                    />
                                                </div>
                                            );
                                        }}
                                    </Grid>
                                );
                            }}
                        </AutoSizer>
                    </div>
                )}
            </div>
        </>
    );
};

export default Home;