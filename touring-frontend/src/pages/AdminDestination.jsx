import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { Globe2, Plus, Pencil, Trash2, Star, X } from 'lucide-react';

const REGIONS = ['Bắc', 'Trung', 'Nam', 'Quốc tế'];

const emptyForm = {
    name: '',
    region: 'Bắc',
    imageUrl: '',
    description: '',
    featured: true,
    displayOrder: 0,
};

const AdminDestination = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/destinations');
            setItems(res.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowForm(true);
    };

    const openEdit = (it) => {
        setEditingId(it.destinationId);
        setForm({
            name: it.name || '',
            region: it.region || 'Bắc',
            imageUrl: it.imageUrl || '',
            description: it.description || '',
            featured: !!it.featured,
            displayOrder: it.displayOrder || 0,
        });
        setShowForm(true);
    };

    const submit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/destinations/${editingId}`, form);
            } else {
                await api.post('/destinations', form);
            }
            setShowForm(false);
            await load();
        } catch (err) {
            alert('Lưu thất bại: ' + (err?.response?.data?.message || err.message));
        }
    };

    const remove = async (id) => {
        if (!window.confirm('Xoá điểm đến này?')) return;
        try {
            await api.delete(`/destinations/${id}`);
            await load();
        } catch (err) {
            alert('Xoá thất bại: ' + (err?.response?.data?.message || err.message));
        }
    };

    const inputStyle = {
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        padding: '9px 12px',
        fontSize: 13,
        color: '#334155',
        background: '#fff',
        outline: 'none',
        width: '100%',
    };

    const labelStyle = {
        fontSize: 12.5,
        fontWeight: 500,
        color: '#374151',
        marginBottom: 6,
        display: 'block',
    };

    return (
        <div className="page-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Globe2 size={20} color="var(--color-primary)" /> Quản lý Điểm đến
                    </h1>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                        Cấu hình danh sách điểm đến nổi bật hiển thị ở trang chủ.
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    style={{
                        background: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 16px',
                        fontSize: 13,
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                    }}
                >
                    <Plus size={14} /> Thêm điểm đến
                </button>
            </div>

            {/* Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: 16,
                }}
            >
                {loading ? (
                    <div style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Đang tải...</div>
                ) : items.length === 0 ? (
                    <div style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Chưa có điểm đến nào.</div>
                ) : items.map((it) => (
                    <div
                        key={it.destinationId}
                        style={{
                            border: '1px solid var(--color-border)',
                            borderRadius: 10,
                            overflow: 'hidden',
                            background: '#fff',
                            boxShadow: 'var(--shadow-sm)',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <div style={{ height: 140, background: '#f1f5f9', position: 'relative' }}>
                            {it.imageUrl ? (
                                <img src={it.imageUrl} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: 12 }}>
                                    Không có ảnh
                                </div>
                            )}
                            {it.featured && (
                                <span
                                    style={{
                                        position: 'absolute',
                                        top: 8,
                                        left: 8,
                                        background: '#fff8e1',
                                        color: '#854d0e',
                                        fontSize: 11.5,
                                        fontWeight: 600,
                                        padding: '3px 10px',
                                        borderRadius: 20,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 4,
                                    }}
                                >
                                    <Star size={11} fill="#f59e0b" color="#f59e0b" /> Nổi bật
                                </span>
                            )}
                        </div>
                        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{it.name}</div>
                                {it.region && (
                                    <span style={{ fontSize: 11, padding: '3px 8px', background: '#f1f5f9', color: '#475569', borderRadius: 5, fontWeight: 500 }}>
                                        {it.region}
                                    </span>
                                )}
                            </div>
                            {it.description && (
                                <p style={{ fontSize: 12.5, color: '#64748b', flex: 1 }}>{it.description}</p>
                            )}
                            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                                <button
                                    onClick={() => openEdit(it)}
                                    style={{
                                        flex: 1,
                                        background: '#fff',
                                        border: '1.5px solid #d1d5db',
                                        color: 'var(--color-primary)',
                                        borderRadius: 7,
                                        padding: '7px 12px',
                                        fontSize: 12,
                                        fontWeight: 600,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 6,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Pencil size={12} /> Sửa
                                </button>
                                <button
                                    onClick={() => remove(it.destinationId)}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid var(--color-border)',
                                        color: 'var(--color-danger)',
                                        borderRadius: 7,
                                        padding: '7px 12px',
                                        fontSize: 12,
                                        fontWeight: 600,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal form */}
            {showForm && (
                <div
                    onClick={() => setShowForm(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(15,23,42,0.45)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 100,
                        padding: 20,
                    }}
                >
                    <form
                        onClick={(e) => e.stopPropagation()}
                        onSubmit={submit}
                        style={{
                            background: '#fff',
                            borderRadius: 12,
                            border: '1px solid var(--color-border)',
                            boxShadow: 'var(--shadow-lg)',
                            width: '100%',
                            maxWidth: 560,
                            maxHeight: '90vh',
                            overflowY: 'auto',
                        }}
                    >
                        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: 14.5, fontWeight: 700, color: '#0f172a' }}>
                                {editingId ? 'Cập nhật điểm đến' : 'Thêm điểm đến mới'}
                            </h2>
                            <button type="button" onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label style={labelStyle}>Tên điểm đến *</label>
                                <input
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    style={inputStyle}
                                    placeholder="VD: Đà Nẵng"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={labelStyle}>Vùng miền</label>
                                    <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} style={inputStyle}>
                                        {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Thứ tự hiển thị</label>
                                    <input
                                        type="number"
                                        value={form.displayOrder}
                                        onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>URL ảnh</label>
                                <input
                                    value={form.imageUrl}
                                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                                    style={inputStyle}
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Mô tả ngắn</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={3}
                                    style={{ ...inputStyle, resize: 'vertical' }}
                                />
                            </div>

                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
                                <input
                                    type="checkbox"
                                    checked={form.featured}
                                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                                />
                                Hiển thị ở mục "Điểm đến nổi bật" trên trang chủ
                            </label>
                        </div>

                        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                style={{
                                    background: '#fff',
                                    border: '1.5px solid #d1d5db',
                                    color: 'var(--color-primary)',
                                    borderRadius: 8,
                                    padding: '8px 16px',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                style={{
                                    background: 'var(--color-primary)',
                                    border: 'none',
                                    color: '#fff',
                                    borderRadius: 8,
                                    padding: '8px 16px',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                {editingId ? 'Cập nhật' : 'Tạo mới'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminDestination;
