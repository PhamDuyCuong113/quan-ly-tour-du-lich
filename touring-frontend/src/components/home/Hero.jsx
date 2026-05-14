import { motion as Motion } from 'framer-motion';
import { Search, MapPin, Calendar, Users, Wallet, Sparkles } from 'lucide-react';
import { useState } from 'react';

const Hero = ({ onSearch }) => {
    const [dest, setDest] = useState('');
    const [date, setDate] = useState('');
    const [people, setPeople] = useState(2);
    const [budget, setBudget] = useState('');

    const submit = (e) => {
        e.preventDefault();
        onSearch?.({ dest, date, people, budget });
    };

    return (
        <section className="relative min-h-[640px] lg:min-h-[720px] w-full overflow-hidden">
            {/* Background image */}
            <div className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2400"
                    alt="Beach paradise"
                    className="w-full h-full object-cover"
                    fetchpriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#0c4a6e]/85 via-[#0369a1]/60 to-[#0ea5e9]/40" />
            </div>

            {/* Floating gradient blobs */}
            <div className="absolute top-20 -left-20 w-96 h-96 bg-cyan-400/30 rounded-full tv-blob" aria-hidden />
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-300/30 rounded-full tv-blob" style={{ animationDelay: '4s' }} aria-hidden />

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-24 lg:pt-36 lg:pb-32">
                <Motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="text-center max-w-3xl mx-auto text-white"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tv-glass text-white border-white/30 mb-6">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        Hơn 10.000+ chuyến đi đáng nhớ đã được tạo ra
                    </span>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight mb-5">
                        Khám phá thế giới <br />
                        <span className="bg-gradient-to-r from-amber-300 via-orange-200 to-rose-200 bg-clip-text text-transparent">
                            theo cách của bạn
                        </span>
                    </h1>
                    <p className="text-base sm:text-lg text-white/85 max-w-2xl mx-auto mb-10">
                        Hàng nghìn tour cao cấp trong nước & quốc tế. Đặt nhanh trong 60 giây, hoàn tiền nếu rẻ hơn.
                    </p>
                </Motion.div>

                {/* Search box */}
                <Motion.form
                    onSubmit={submit}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
                    className="tv-glass rounded-3xl p-3 sm:p-4 lg:p-5 max-w-5xl mx-auto shadow-2xl"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-9 gap-3 items-stretch">
                        <FieldGroup className="lg:col-span-3" icon={<MapPin className="w-4 h-4" />} label="Điểm đến">
                            <input value={dest} onChange={e => setDest(e.target.value)} placeholder="Bạn muốn đi đâu?"
                                className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400 font-medium" />
                        </FieldGroup>
                        <FieldGroup className="lg:col-span-2" icon={<Calendar className="w-4 h-4" />} label="Ngày đi">
                            <input type="date" value={date} onChange={e => setDate(e.target.value)}
                                className="w-full bg-transparent outline-none text-slate-900 font-medium" />
                        </FieldGroup>
                        <FieldGroup className="lg:col-span-1" icon={<Users className="w-4 h-4" />} label="Người">
                            <input type="number" min={1} value={people} onChange={e => setPeople(e.target.value)}
                                className="w-full bg-transparent outline-none text-slate-900 font-medium" />
                        </FieldGroup>
                        <FieldGroup className="lg:col-span-2" icon={<Wallet className="w-4 h-4" />} label="Ngân sách">
                            <select value={budget} onChange={e => setBudget(e.target.value)}
                                className="w-full bg-transparent outline-none text-slate-900 font-medium">
                                <option value="">Tất cả</option>
                                <option value="0-3000000">Dưới 3 triệu</option>
                                <option value="3000000-7000000">3 - 7 triệu</option>
                                <option value="7000000-15000000">7 - 15 triệu</option>
                                <option value="15000000-999999999">Trên 15 triệu</option>
                            </select>
                        </FieldGroup>

                        <Motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            className="lg:col-span-1 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold shadow-lg shadow-orange-500/30"
                        >
                            <Search className="w-5 h-5" />
                            <span className="lg:hidden">Khám phá ngay</span>
                        </Motion.button>
                    </div>
                </Motion.form>

                {/* Trust strip */}
                <Motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-white/80 text-sm"
                >
                    <Stat value="500K+" label="Khách hàng" />
                    <Divider />
                    <Stat value="10.000+" label="Tour chất lượng" />
                    <Divider />
                    <Stat value="150+" label="Điểm đến" />
                    <Divider />
                    <Stat value="4.9/5" label="Đánh giá trung bình" />
                </Motion.div>
            </div>

            {/* Wave bottom */}
            <svg className="absolute bottom-0 left-0 w-full text-[var(--tv-bg)]" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden>
                <path fill="currentColor" d="M0,32L80,37.3C160,43,320,53,480,48C640,43,800,21,960,21.3C1120,21,1280,43,1360,53.3L1440,64L1440,80L0,80Z"/>
            </svg>
        </section>
    );
};

const FieldGroup = ({ icon, label, children, className = '' }) => (
    <label className={`group flex items-center gap-3 bg-white/95 hover:bg-white rounded-2xl px-4 py-3 transition ${className}`}>
        <span className="w-9 h-9 shrink-0 rounded-xl bg-sky-50 text-sky-600 inline-flex items-center justify-center group-hover:bg-sky-100">{icon}</span>
        <span className="flex-1 min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
            {children}
        </span>
    </label>
);

const Stat = ({ value, label }) => (
    <div className="text-center">
        <p className="text-xl font-extrabold text-white">{value}</p>
        <p className="text-xs uppercase tracking-wider">{label}</p>
    </div>
);
const Divider = () => <span className="hidden sm:block w-px h-8 bg-white/20" />;

export default Hero;
