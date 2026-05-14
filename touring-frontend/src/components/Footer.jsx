import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Send, Apple, Smartphone } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

const Footer = () => (
    <footer className="relative mt-20 bg-gradient-to-b from-[#0c1a30] to-[#06101e] text-slate-300">
        {/* Newsletter strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-16 relative z-10">
            <Motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-3xl bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-400 p-6 sm:p-10 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6"
            >
                <div className="text-white text-center lg:text-left">
                    <h3 className="text-2xl sm:text-3xl font-extrabold">Đăng ký nhận ưu đãi độc quyền</h3>
                    <p className="text-white/85 mt-1">Giảm đến 30% cho khách hàng mới + ưu đãi flash sale mỗi tuần.</p>
                </div>
                <form onSubmit={(e) => e.preventDefault()} className="flex w-full lg:w-auto bg-white rounded-2xl p-1.5 shadow-xl">
                    <input type="email" placeholder="Email của bạn"
                        className="flex-1 px-4 py-3 outline-none text-slate-800 bg-transparent min-w-0" />
                    <button className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-slate-800 transition active:scale-95">
                        <Send className="w-4 h-4" /> Đăng ký
                    </button>
                </form>
            </Motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-10">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                <div className="col-span-2">
                    <h4 className="text-2xl font-extrabold text-white">TOURING<span className="text-sky-400">.</span></h4>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400 max-w-xs">
                        Nền tảng đặt tour du lịch cao cấp, kết nối hàng ngàn điểm đến tuyệt vời trên khắp thế giới.
                    </p>
                    <div className="mt-5 space-y-2 text-sm">
                        <p className="inline-flex items-center gap-2"><MapPin className="w-4 h-4 text-sky-400" /> 123 Nguyễn Huệ, Q.1, TP.HCM</p>
                        <p className="inline-flex items-center gap-2"><Phone className="w-4 h-4 text-sky-400" /> 1900 1234 (24/7)</p>
                        <p className="inline-flex items-center gap-2"><Mail className="w-4 h-4 text-sky-400" /> hello@touring.vn</p>
                    </div>
                </div>

                <FooterCol title="Khám phá" items={['Tour trong nước', 'Tour quốc tế', 'Tour cao cấp', 'Combo nghỉ dưỡng', 'Du lịch nhóm']} />
                <FooterCol title="Hỗ trợ" items={['Trung tâm trợ giúp', 'Liên hệ', 'Hướng dẫn đặt tour', 'Câu hỏi thường gặp']} />
                <FooterCol title="Chính sách" items={['Điều khoản dịch vụ', 'Chính sách bảo mật', 'Chính sách hoàn huỷ', 'Cookie']} />
            </div>

            {/* App download + social */}
            <div className="mt-10 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <a className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 transition px-4 py-2.5 rounded-xl border border-white/10" href="#">
                        <Apple className="w-5 h-5" />
                        <span className="text-left">
                            <span className="block text-[10px] uppercase tracking-wider text-slate-400">Tải trên</span>
                            <span className="block text-sm font-bold text-white">App Store</span>
                        </span>
                    </a>
                    <a className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 transition px-4 py-2.5 rounded-xl border border-white/10" href="#">
                        <Smartphone className="w-5 h-5" />
                        <span className="text-left">
                            <span className="block text-[10px] uppercase tracking-wider text-slate-400">Tải trên</span>
                            <span className="block text-sm font-bold text-white">Google Play</span>
                        </span>
                    </a>
                </div>
                <div className="flex items-center gap-3">
                    {[Facebook, Instagram, Youtube].map((Icon, i) => (
                        <a key={i} href="#" aria-label="social"
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-sky-500 transition inline-flex items-center justify-center text-white">
                            <Icon className="w-4 h-4" />
                        </a>
                    ))}
                </div>
            </div>

            <p className="text-center text-xs text-slate-500 mt-8">© {new Date().getFullYear()} Touring Vietnam. All rights reserved.</p>
        </div>
    </footer>
);

const FooterCol = ({ title, items }) => (
    <div>
        <h5 className="text-white font-bold text-sm tracking-wide uppercase">{title}</h5>
        <ul className="mt-4 space-y-2.5 text-sm">
            {items.map((it) => (
                <li key={it}>
                    <a href="#" className="hover:text-sky-400 transition-colors">{it}</a>
                </li>
            ))}
        </ul>
    </div>
);

export default Footer;
