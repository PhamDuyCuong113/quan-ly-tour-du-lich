import { motion as Motion } from 'framer-motion';
import { BadgePercent, Headphones, ShieldCheck, Sparkles } from 'lucide-react';
import { WHY_US } from '../../data/mock';

const ICONS = { BadgePercent, Headphones, ShieldCheck, Sparkles };

const WhyChooseUs = () => (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <SectionHeader
            eyebrow="Tại sao chọn chúng tôi"
            title="Trải nghiệm dịch vụ du lịch đẳng cấp"
            subtitle="Hơn 500.000 khách hàng đã tin tưởng và đặt tour mỗi năm. Cam kết minh bạch, an toàn và chất lượng."
        />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY_US.map((item, i) => {
                const Icon = ICONS[item.icon];
                return (
                    <Motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.5, delay: i * 0.08 }}
                        whileHover={{ y: -6 }}
                        className="relative p-6 rounded-3xl bg-[var(--tv-surface)] border border-[var(--tv-border)] shadow-[var(--tv-shadow-soft)] hover:shadow-[var(--tv-shadow-hover)] transition-shadow overflow-hidden"
                    >
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-sky-100/60 dark:bg-sky-500/10 rounded-full" />
                        <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 text-white inline-flex items-center justify-center shadow-md">
                            {Icon && <Icon className="w-6 h-6" />}
                        </div>
                        <h3 className="relative mt-5 text-lg font-bold text-[var(--tv-text)]">{item.title}</h3>
                        <p className="relative mt-2 text-sm text-[var(--tv-text-soft)] leading-relaxed">{item.desc}</p>
                    </Motion.div>
                );
            })}
        </div>
    </section>
);

export const SectionHeader = ({ eyebrow, title, subtitle, align = 'center' }) => (
    <Motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''}`}
    >
        {eyebrow && (
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">{eyebrow}</span>
        )}
        <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--tv-text)]">{title}</h2>
        {subtitle && <p className="mt-3 text-[var(--tv-text-soft)] text-base sm:text-lg">{subtitle}</p>}
    </Motion.div>
);

export default WhyChooseUs;
