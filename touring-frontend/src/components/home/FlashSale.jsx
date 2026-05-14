import { useEffect, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Flame, Timer, ArrowRight } from 'lucide-react';

const TARGET = (() => {
    const d = new Date();
    d.setHours(d.getHours() + 11, d.getMinutes() + 23, d.getSeconds() + 47, 0);
    return d.getTime();
})();

const useCountdown = (target) => {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);
    const ms = Math.max(0, target - now);
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return { h, m, s };
};

const pad = (n) => String(n).padStart(2, '0');

const Cell = ({ value, label }) => (
    <div className="text-center">
        <Motion.div
            key={value}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white text-rose-600 font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-lg"
        >
            {pad(value)}
        </Motion.div>
        <p className="text-[10px] uppercase tracking-wider mt-1.5 text-white/85">{label}</p>
    </div>
);

const FlashSale = ({ tours = [] }) => {
    const { h, m, s } = useCountdown(TARGET);
    const sale = tours.slice(0, 3);

    return (
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <Motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-orange-500 to-amber-400 p-6 sm:p-10 text-white shadow-[var(--tv-shadow-hover)]"
            >
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full" />
                <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-white/10 rounded-full" />

                <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="text-center lg:text-left">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-bold uppercase tracking-widest mb-3">
                            <Flame className="w-3.5 h-3.5" /> Flash Sale 24h
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                            Giảm đến <span className="text-amber-200">50%</span> cho 3 tour HOT
                        </h2>
                        <p className="text-white/85 mt-2 max-w-lg">Số lượng có hạn. Cơ hội duy nhất trong ngày, đừng bỏ lỡ chuyến đi mơ ước của bạn.</p>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <p className="inline-flex items-center gap-1.5 text-sm font-semibold"><Timer className="w-4 h-4" /> Kết thúc sau</p>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Cell value={h} label="Giờ" />
                            <span className="text-3xl font-black">:</span>
                            <Cell value={m} label="Phút" />
                            <span className="text-3xl font-black">:</span>
                            <Cell value={s} label="Giây" />
                        </div>
                    </div>
                </div>

                {sale.length > 0 && (
                    <div className="relative mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {sale.map((t) => (
                            <Motion.div
                                key={t.tourId}
                                whileHover={{ y: -4 }}
                                className="bg-white/15 backdrop-blur rounded-2xl p-3 flex items-center gap-3 border border-white/20"
                            >
                                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-white/30">
                                    {t.imageUrl && <img src={t.imageUrl} alt={t.tourName} className="w-full h-full object-cover" loading="lazy" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold truncate">{t.tourName}</p>
                                    <p className="text-xs text-white/85">Chỉ còn 5 chỗ · -40%</p>
                                </div>
                                <ArrowRight className="w-4 h-4 shrink-0" />
                            </Motion.div>
                        ))}
                    </div>
                )}
            </Motion.div>
        </section>
    );
};

export default FlashSale;
