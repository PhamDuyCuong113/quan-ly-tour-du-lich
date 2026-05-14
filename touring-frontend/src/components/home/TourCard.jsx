import { motion as Motion } from 'framer-motion';
import { Star, MapPin, Clock, ArrowRight } from 'lucide-react';
import { formatThumbnailUrl } from '../../utils/cloudinaryHelper';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n || 0);

const TourCard = ({ tour, index = 0, onOpen }) => {
    const original = tour.originalPrice || (tour.basePrice ? Math.round(tour.basePrice * 1.25) : 0);
    const price = tour.basePrice || 0;
    const discount = original > price ? Math.round((1 - price / original) * 100) : 0;

    const img = formatThumbnailUrl(tour.imageUrl) || `https://source.unsplash.com/800x600/?${encodeURIComponent((tour.destination || 'travel') + ',landscape')}`;

    return (
        <Motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, delay: (index % 4) * 0.06 }}
            whileHover={{ y: -8 }}
            className="group flex flex-col bg-[var(--tv-surface)] rounded-3xl overflow-hidden border border-[var(--tv-border)] shadow-[var(--tv-shadow-soft)] hover:shadow-[var(--tv-shadow-hover)] transition-shadow"
        >
            <div className="relative h-56 overflow-hidden">
                <img
                    src={img}
                    alt={tour.tourName}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {discount > 0 && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                        -{discount}%
                    </span>
                )}
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-white/95 text-slate-900 text-xs font-bold px-2.5 py-1 rounded-full">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {tour.averageRating || '4.8'}
                    <span className="text-slate-500 font-medium">({tour.reviewCount ?? 128})</span>
                </span>
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-3 text-xs text-[var(--tv-text-soft)] mb-2">
                    {tour.destination && (
                        <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-sky-500" /> {tour.destination}</span>
                    )}
                    {tour.durationDays && (
                        <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-sky-500" /> {tour.durationDays} ngày</span>
                    )}
                </div>

                <h3 className="text-base font-bold text-[var(--tv-text)] line-clamp-2 leading-snug min-h-[2.7rem] group-hover:text-sky-600 transition-colors">
                    {tour.tourName}
                </h3>

                <div className="flex items-end justify-between mt-4 pt-4 border-t border-[var(--tv-border)]">
                    <div>
                        {discount > 0 && (
                            <p className="text-xs text-[var(--tv-text-soft)] line-through">{fmt(original)}đ</p>
                        )}
                        <p className="text-xl font-extrabold text-sky-600">
                            {fmt(price)}<span className="text-sm font-bold ml-0.5">đ</span>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onOpen}
                        className="inline-flex items-center gap-1 bg-slate-900 dark:bg-sky-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-sky-600 active:scale-95 transition"
                    >
                        Đặt ngay
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </Motion.article>
    );
};

export default TourCard;
