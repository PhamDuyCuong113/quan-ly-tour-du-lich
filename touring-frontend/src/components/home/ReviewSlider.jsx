import { useEffect, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { REVIEWS } from '../../data/mock';
import { SectionHeader } from './WhyChooseUs';

const ReviewSlider = () => {
    const [i, setI] = useState(0);
    const next = () => setI((p) => (p + 1) % REVIEWS.length);
    const prev = () => setI((p) => (p - 1 + REVIEWS.length) % REVIEWS.length);

    useEffect(() => {
        const id = setInterval(next, 5000);
        return () => clearInterval(id);
    }, []);

    const r = REVIEWS[i];

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <SectionHeader
                eyebrow="Khách hàng nói gì"
                title="500.000+ lời cảm ơn từ khách hàng"
                subtitle="Mỗi chuyến đi là một câu chuyện. Hãy lắng nghe những trải nghiệm thật từ khách của chúng tôi."
            />

            <div className="mt-12 relative max-w-3xl mx-auto">
                <Quote className="absolute -top-6 -left-2 w-16 h-16 text-sky-100 dark:text-sky-500/20" />

                <div className="relative tv-glass rounded-3xl p-8 sm:p-10 shadow-[var(--tv-shadow-soft)]">
                    <AnimatePresence mode="wait">
                        <Motion.div
                            key={r.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.4 }}
                            className="text-center"
                        >
                            <img
                                src={r.avatar}
                                alt={r.name}
                                className="w-20 h-20 rounded-full object-cover mx-auto ring-4 ring-white shadow-lg"
                                loading="lazy"
                            />
                            <div className="flex justify-center gap-1 mt-4">
                                {Array.from({ length: r.rating }).map((_, k) => (
                                    <Star key={k} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                ))}
                            </div>
                            <p className="mt-4 text-lg sm:text-xl text-[var(--tv-text)] leading-relaxed">"{r.content}"</p>
                            <p className="mt-5 font-bold text-[var(--tv-text)]">{r.name}</p>
                            <p className="text-sm text-[var(--tv-text-soft)]">{r.city}</p>
                        </Motion.div>
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-3 mt-6">
                    <button onClick={prev} aria-label="Trước"
                        className="w-10 h-10 rounded-full bg-[var(--tv-surface)] border border-[var(--tv-border)] inline-flex items-center justify-center hover:bg-sky-50 hover:text-sky-600 transition">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1.5">
                        {REVIEWS.map((_, k) => (
                            <button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`}
                                className={`h-1.5 rounded-full transition-all ${k === i ? 'w-6 bg-sky-500' : 'w-1.5 bg-slate-300'}`} />
                        ))}
                    </div>
                    <button onClick={next} aria-label="Tiếp"
                        className="w-10 h-10 rounded-full bg-[var(--tv-surface)] border border-[var(--tv-border)] inline-flex items-center justify-center hover:bg-sky-50 hover:text-sky-600 transition">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ReviewSlider;
