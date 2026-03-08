import { useEffect, useState } from 'react'
import api from '../api/axios'
import {
    User,
    Map,
    Calendar,
    Users as UsersIcon,
    ArrowRight,
    Loader2,
    Landmark,
    TicketPercent
} from 'lucide-react'

const AdminManualBooking = () => {
    const [customers, setCustomers] = useState([])
    const [tours, setTours] = useState([])
    const [schedules, setSchedules] = useState([])
    const [selectedTourId, setSelectedTourId] = useState('')
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        customerId: '',
        scheduleId: '',
        numPeople: 1,
        promotionCode: ''
    })

    /*
    ===============================
    LOAD INITIAL DATA
    ===============================
    */
    useEffect(() => {
        const loadInitData = async () => {
            try {
                const [custRes, tourRes] = await Promise.all([
                    api.get('/admin/my-customers'),
                    api.get('/tours')
                ])

                setCustomers(custRes.data)
                setTours(tourRes.data)
            } catch (err) {
                console.error('Lỗi tải dữ liệu ban đầu', err)
            }
        }

        loadInitData()
    }, [])

    /*
    ===============================
    LOAD SCHEDULES WHEN SELECT TOUR
    ===============================
    */
    useEffect(() => {
        const loadSchedules = async () => {
            try {
                const res = await api.get(`/tours/${selectedTourId}`)
                setSchedules(res.data.schedules || [])
            } catch (err) {
                console.error('Lỗi load schedules', err)
            }
        }

        if (selectedTourId) {
            loadSchedules()
        } else {
            setSchedules([])
        }
    }, [selectedTourId])

    /*
    ===============================
    PRICE CALCULATION
    ===============================
    */
    const selectedSchedule = schedules.find(
        s => s.scheduleId === parseInt(formData.scheduleId)
    )

    const totalPrice = selectedSchedule
        ? selectedSchedule.price * formData.numPeople
        : 0

    /*
    ===============================
    CREATE BOOKING
    ===============================
    */
    const handleCreate = async () => {
        const { customerId, scheduleId, numPeople, promotionCode } = formData

        if (!customerId || !scheduleId) {
            alert('Vui lòng chọn khách hàng và ngày khởi hành!')
            return
        }

        if (selectedSchedule && numPeople > selectedSchedule.availableSlots) {
            alert('Số lượng khách vượt quá số chỗ còn lại!')
            return
        }

        setLoading(true)

        try {
            const payload = {
                scheduleId: parseInt(scheduleId),
                numberOfPeople: parseInt(numPeople),
                promotionCode: promotionCode.trim() || null
            }

            await api.post(`/admin/bookings/manual?customerId=${customerId}`, payload)

            alert('Tạo booking thành công!')

            // reset form
            setFormData({
                customerId: '',
                scheduleId: '',
                numPeople: 1,
                promotionCode: ''
            })

            setSelectedTourId('')
            setSchedules([])

        } catch (err) {
            console.error(err.response?.data)

            alert(
                err.response?.data?.message ||
                'Tạo booking thất bại. Kiểm tra voucher hoặc slot.'
            )
        } finally {
            setLoading(false)
        }
    }

    /*
    ===============================
    FORMAT PRICE
    ===============================
    */
    const formatVND = price =>
        new Intl.NumberFormat('vi-VN').format(price) + '₫'

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">

            {/* HEADER */}
            <header className="flex items-center gap-4">
                <div className="p-4 bg-black text-white rounded-3xl shadow-xl">
                    <Landmark size={32} />
                </div>

                <div>
                    <h2 className="text-4xl font-black text-gray-900 uppercase italic">
                        Booking Offline
                    </h2>
                    <p className="text-gray-400 text-xs uppercase tracking-widest">
                        Đặt tour tại quầy / điện thoại
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* =========================
            FORM
        ========================= */}
                <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-2xl space-y-8">

                    {/* CUSTOMER */}
                    <div>
                        <label className="text-xs font-bold flex gap-2 items-center">
                            <User size={14}/> Khách hàng
                        </label>

                        <select
                            className="w-full p-4 bg-gray-50 rounded-xl mt-2"
                            value={formData.customerId}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    customerId: e.target.value
                                })
                            }
                        >
                            <option value="">-- Chọn khách --</option>

                            {customers.map(c => (
                                <option key={c.customerId} value={c.customerId}>
                                    {c.fullName} ({c.phone || 'N/A'})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* TOUR */}
                    <div>
                        <label className="text-xs font-bold flex gap-2 items-center">
                            <Map size={14}/> Tour
                        </label>

                        <select
                            className="w-full p-4 bg-gray-50 rounded-xl mt-2"
                            value={selectedTourId}
                            onChange={e => {
                                setSelectedTourId(e.target.value)
                                setFormData({
                                    ...formData,
                                    scheduleId: ''
                                })
                            }}
                        >
                            <option value="">-- Chọn Tour --</option>

                            {tours.map(t => (
                                <option key={t.tourId} value={t.tourId}>
                                    {t.tourName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* SCHEDULE */}
                    <div>
                        <label className="text-xs font-bold flex gap-2 items-center">
                            <Calendar size={14}/> Ngày khởi hành
                        </label>

                        <select
                            disabled={!selectedTourId}
                            className="w-full p-4 bg-gray-50 rounded-xl mt-2"
                            value={formData.scheduleId}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    scheduleId: e.target.value
                                })
                            }
                        >
                            <option value="">-- Chọn lịch --</option>

                            {schedules.map(s => (
                                <option key={s.scheduleId} value={s.scheduleId}>
                                    {s.departureDate} (Còn {s.availableSlots} chỗ)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* NUMBER OF PEOPLE */}
                    <div>
                        <label className="text-xs font-bold flex gap-2 items-center">
                            <UsersIcon size={14}/> Số khách
                        </label>

                        <input
                            type="number"
                            min="1"
                            className="w-full p-4 bg-gray-50 rounded-xl mt-2"
                            value={formData.numPeople}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    numPeople: Number(e.target.value)
                                })
                            }
                        />
                    </div>

                    {/* VOUCHER */}
                    <div>
                        <label className="text-xs font-bold flex gap-2 items-center">
                            <TicketPercent size={14}/> Voucher
                        </label>

                        <input
                            type="text"
                            placeholder="VD: KHAITRUONG"
                            className="w-full p-4 bg-gray-50 rounded-xl mt-2 uppercase"
                            value={formData.promotionCode}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    promotionCode: e.target.value.toUpperCase()
                                })
                            }
                        />
                    </div>

                </div>

                {/* =========================
            SUMMARY
        ========================= */}
                <div className="space-y-6">

                    <div className="bg-gray-900 text-white p-10 rounded-[3rem]">

                        <p className="text-xs uppercase opacity-60 mb-4">
                            Hóa đơn tạm tính
                        </p>

                        <div className="space-y-3">

                            <div className="flex justify-between text-sm">
                                <span>Giá mỗi khách</span>
                                <span>
                  {selectedSchedule
                      ? formatVND(selectedSchedule.price)
                      : '0₫'}
                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span>Số lượng</span>
                                <span>x {formData.numPeople}</span>
                            </div>

                            <div className="border-t border-gray-700 pt-4">

                                <p className="text-xs uppercase text-blue-400">
                                    Tổng cộng
                                </p>

                                <p className="text-4xl font-black">
                                    {formatVND(totalPrice)}
                                </p>

                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleCreate}
                        disabled={
                            loading ||
                            !formData.scheduleId ||
                            !formData.customerId
                        }
                        className="w-full py-6 bg-blue-600 text-white rounded-2xl text-xl font-bold flex justify-center items-center gap-3 disabled:opacity-40"
                    >
                        {loading
                            ? <Loader2 className="animate-spin"/>
                            : <>CHỐT ĐƠN <ArrowRight/></>
                        }
                    </button>

                </div>

            </div>
        </div>
    )
}

export default AdminManualBooking