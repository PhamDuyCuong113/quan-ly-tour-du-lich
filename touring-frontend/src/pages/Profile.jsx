import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Award, Mail, Phone, MapPin, Star } from 'lucide-react';

const Profile = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        api.get('/auth/me').then(res => setUser(res.data));
    }, []);

    if (!user) return null;

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-blue-600 h-32 flex items-end justify-center pb-4">
                    <div className="bg-white p-2 rounded-full shadow-lg translate-y-12">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
                            <User className="w-12 h-12 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="pt-16 pb-8 px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-800">{user.fullName}</h2>
                    <span className="inline-block bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-sm font-bold mt-2">
                        {user.role}
                    </span>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                            <Award className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">Hạng thành viên</p>
                            <p className="text-xl font-bold text-orange-700">{user.level}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                            <Star className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">Điểm tích lũy</p>
                            <p className="text-xl font-bold text-blue-700">{user.totalPoints} pts</p>
                        </div>
                    </div>

                    <div className="mt-8 text-left space-y-4 text-gray-600 border-t pt-6">
                        <div className="flex items-center gap-3"><Mail className="w-5 h-5"/> {user.email || 'Chưa cập nhật'}</div>
                        <div className="flex items-center gap-3"><Phone className="w-5 h-5"/> {user.phone || 'Chưa cập nhật'}</div>
                        <div className="flex items-center gap-3"><MapPin className="w-5 h-5"/> {user.address || 'Hà Nội, Việt Nam'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;