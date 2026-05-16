import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import api from '../api/axios';
import Hero from '../components/home/Hero';
import DestinationCard from '../components/home/DestinationCard';
import TourCard from '../components/home/TourCard';
import TourCardSkeleton from '../components/home/TourCardSkeleton';
import FlashSale from '../components/home/FlashSale';
import WhyChooseUs, { SectionHeader } from '../components/home/WhyChooseUs';
import ReviewSlider from '../components/home/ReviewSlider';
import { FALLBACK_DESTINATIONS } from '../data/mock';

const Home = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [destinations, setDestinations] = useState([]);
    const [filter, setFilter] = useState({
        dest: '',
        minPrice: 0,
        maxPrice: 999999999,
        tourType: '',
        destinationId: null,
    });
    const cacheRef = useRef(new Map());
    const tourSectionRef = useRef(null);

    const fetchTours = useCallback(async (params) => {
        const key = JSON.stringify(params);
        if (cacheRef.current.has(key)) {
            setTours(cacheRef.current.get(key));
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const hasFilters = Object.values(params || {}).some(
                (v) => v !== undefined && v !== null && v !== ''
            );
            const res = hasFilters
                ? await api.get('/tours/search', { params })
                : await api.get('/tours');
            cacheRef.current.set(key, res.data);
            setTours(res.data);
        } catch (e) {
            console.error('Lỗi khi tải tour', e);
            setTours([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTours({}); }, [fetchTours]);

    useEffect(() => {
        let active = true;
        api.get('/destinations/featured')
            .then((res) => {
                if (!active) return;
                const data = res.data && res.data.length ? res.data : FALLBACK_DESTINATIONS;
                setDestinations(data);
            })
            .catch(() => active && setDestinations(FALLBACK_DESTINATIONS));
        return () => { active = false; };
    }, []);

    useEffect(() => {
        const cat = searchParams.get('cat');
        const destinationIdParam = searchParams.get('destinationId');
        const destinationName = searchParams.get('destinationName') || '';

        if (!cat && !destinationIdParam) {
            return;
        }

        const nextTourType = cat === 'domestic'
            ? 'DOMESTIC'
            : cat === 'international'
                ? 'INTERNATIONAL'
                : '';

        const parsedDestinationId = destinationIdParam ? Number(destinationIdParam) : NaN;
        const nextDestinationId = Number.isFinite(parsedDestinationId) ? parsedDestinationId : null;

        setFilter({
            dest: destinationName,
            minPrice: 0,
            maxPrice: 999999999,
            tourType: nextTourType,
            destinationId: nextDestinationId,
        });

        fetchTours({
            tourType: nextTourType || undefined,
            destinationId: nextDestinationId ?? undefined,
        });

        tourSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [searchParams, fetchTours]);

    const handleHeroSearch = useCallback(({ dest, budget }) => {
        const [minStr, maxStr] = (budget || '').split('-');
        const min = Number(minStr) || 0;
        const max = Number(maxStr) || 999999999;
        setFilter({ dest, minPrice: min, maxPrice: max, tourType: '', destinationId: null });
        setSearchParams({});
        fetchTours({ keyword: dest || undefined, minPrice: min, maxPrice: max });
        tourSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [fetchTours, setSearchParams]);

    const handlePickDestination = useCallback((d) => {
        if (!d?.destinationId) {
            return;
        }
        setFilter({
            dest: d.name || '',
            minPrice: 0,
            maxPrice: 999999999,
            tourType: '',
            destinationId: d.destinationId,
        });
        setSearchParams({ destinationId: String(d.destinationId), destinationName: d.name || '' });
        tourSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [setSearchParams]);

    const skeletons = useMemo(() => Array.from({ length: 8 }), []);
    const title = filter.dest
        ? `Tour tại ${filter.dest}`
        : filter.tourType === 'DOMESTIC'
            ? 'Tour trong nước'
            : filter.tourType === 'INTERNATIONAL'
                ? 'Tour quốc tế'
                : 'Được đặt nhiều nhất tuần này';
    const hasActiveFilter = !!(filter.dest || filter.tourType || filter.destinationId);

    return (
        <>
            <Hero onSearch={handleHeroSearch} />

            {/* Popular destinations */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
                <div className="flex items-end justify-between gap-4 flex-wrap">
                    <SectionHeader
                        align="left"
                        eyebrow="Điểm đến nổi bật"
                        title="Cảm hứng từ những hành trình"
                        subtitle="Top điểm đến được du khách yêu thích nhất 2026"
                    />
                    <button
                        onClick={() => tourSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                        className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-sky-600 hover:text-sky-700"
                    >
                        Xem tất cả <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {destinations.slice(0, 6).map((d, i) => (
                        <DestinationCard
                            key={d.destinationId || d.name}
                            destination={d}
                            index={i}
                            onClick={() => handlePickDestination(d)}
                        />
                    ))}
                </div>
            </section>

            {/* Flash sale */}
            <FlashSale tours={tours} />

            {/* Tour recommendations */}
            <section ref={tourSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
                <div className="flex items-end justify-between gap-4 flex-wrap mb-10">
                    <SectionHeader
                        align="left"
                        eyebrow="Tour gợi ý"
                        title={title}
                        subtitle="Hơn 10.000 tour với giá tốt nhất, đảm bảo chất lượng đối tác"
                    />
                    {hasActiveFilter && (
                        <button
                            onClick={() => {
                                setFilter({ dest: '', minPrice: 0, maxPrice: 999999999, tourType: '', destinationId: null });
                                setSearchParams({});
                                fetchTours({});
                            }}
                            className="text-sm font-semibold text-sky-600 hover:underline"
                        >
                            Bỏ lọc
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {skeletons.map((_, i) => <TourCardSkeleton key={i} />)}
                    </div>
                ) : tours.length === 0 ? (
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 bg-[var(--tv-surface)] rounded-3xl border border-dashed border-[var(--tv-border)]"
                    >
                        <p className="text-lg font-bold text-[var(--tv-text)]">Chưa tìm thấy tour phù hợp</p>
                        <p className="text-sm text-[var(--tv-text-soft)] mt-2">Thử thay đổi từ khoá hoặc khoảng ngân sách khác.</p>
                    </Motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {tours.map((t, i) => (
                            <TourCard key={t.tourId} tour={t} index={i} onOpen={() => navigate(`/tours/${t.tourId}`)} />
                        ))}
                    </div>
                )}
            </section>

            <WhyChooseUs />
            <ReviewSlider />
        </>
    );
};

export default Home;
