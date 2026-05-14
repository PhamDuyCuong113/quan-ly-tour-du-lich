import { motion as Motion } from 'framer-motion';
import { MapPin, Star, ArrowRight } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n || 0);

const DestinationCard = ({ destination, index = 0, onClick }) => {
    const img = destination.imageUrl || `https://source.unsplash.com/800x600/?${encodeURIComponent(destination.name + ',travel')}`;
    return (
        <Motion.button
            type="button"
            onClick={onClick}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.06 }}
            whileHover={{ y: -6 }}
            className="group relative h-72 md:h-80 rounded-3xl overflow-hidden text-left shadow-[var(--tv-shadow-soft)] hover:shadow-[var(--tv-shadow-hover)] transition-shadow"
        >
            <img
                src={img}
                alt={destination.name}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/0" />

            {/* Top badges */}
            <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                {destination.region && (
                    <span className="tv-glass text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                        {destination.region}
                    </span>
                )}
                {destination.rating && (
                    <span className="inline-flex items-center gap-1 bg-white/95 text-slate-900 text-xs font-bold px-2.5 py-1 rounded-full">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {destination.rating}
                    </span>
                )}
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="text-2xl font-extrabold flex items-center gap-1.5 truncate">
                            <MapPin className="w-5 h-5 text-amber-300 shrink-0" />
                            {destination.name}
                        </h3>
                        <p className="text-sm text-white/85 mt-1">
                            {destination.tourCount ? `${destination.tourCount} tour` : 'Tour đa dạng'}
                            {destination.fromPrice ? <> · từ <strong className="text-amber-300">{fmt(destination.fromPrice)}đ</strong></> : null}
                        </p>
                    </div>
                    <span className="w-10 h-10 rounded-full bg-white/15 backdrop-blur inline-flex items-center justify-center transition group-hover:bg-amber-400 group-hover:text-slate-900">
                        <ArrowRight className="w-4 h-4" />
                    </span>
                </div>
            </div>
        </Motion.button>
    );
};

export default DestinationCard;
