import { useEffect, useMemo, useState, useCallback } from 'react';
import api from '../api/axios';
import { Search, RefreshCw, ScrollText, ChevronLeft, ChevronRight, X } from 'lucide-react';

const ACTION_COLORS = {
    CREATE: { bg: '#f0fdf4', text: '#166534', dot: '#22c55e' },
    UPDATE: { bg: '#eff6ff', text: '#1e40af', dot: '#3b82f6' },
    DELETE: { bg: '#fef2f2', text: '#991b1b', dot: '#ef4444' },
    CANCEL: { bg: '#fef2f2', text: '#991b1b', dot: '#ef4444' },
    TOGGLE: { bg: '#fefce8', text: '#854d0e', dot: '#f59e0b' },
    LOGIN: { bg: '#e8eaf6', text: '#3949ab', dot: '#3949ab' },
    DEFAULT: { bg: '#f8fafc', text: '#64748b', dot: '#94a3b8' },
};

const TABLE_OPTIONS = [
    { value: '', label: 'Tất cả đối tượng' },
    { value: 'tour', label: 'Tour' },
    { value: 'booking', label: 'Booking' },
    { value: 'customer', label: 'Khách hàng' },
    { value: 'staff', label: 'Nhân viên' },
    { value: 'promotion', label: 'Voucher' },
    { value: 'destination', label: 'Điểm đến' },
];

const ROLE_OPTIONS = [
    { value: '', label: 'Tất cả vai trò' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'STAFF', label: 'Nhân viên' },
    { value: 'CUSTOMER', label: 'Khách hàng' },
    { value: 'SYSTEM', label: 'Hệ thống' },
];

const colorForAction = (action = '') => {
    const upper = action.toUpperCase();
    if (upper.startsWith('CREATE')) return ACTION_COLORS.CREATE;
    if (upper.startsWith('UPDATE')) return ACTION_COLORS.UPDATE;
    if (upper.startsWith('DELETE')) return ACTION_COLORS.DELETE;
    if (upper.startsWith('CANCEL')) return ACTION_COLORS.CANCEL;
    if (upper.startsWith('TOGGLE')) return ACTION_COLORS.TOGGLE;
    if (upper.startsWith('LOGIN')) return ACTION_COLORS.LOGIN;
    return ACTION_COLORS.DEFAULT;
};

const formatDateTime = (s) => {
    if (!s) return '—';
    try {
        const d = new Date(s);
        return d.toLocaleString('vi-VN', { hour12: false });
    } catch {
        return s;
    }
};

const AdminAuditLog = () => {
    const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0, page: 0, size: 20 });
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [tableName, setTableName] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [page, setPage] = useState(0);
    const size = 20;

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/audit-logs', {
                params: {
                    keyword: keyword || undefined,
                    tableName: tableName || undefined,
                    role: filterRole || undefined,
                    from: from || undefined,
                    to: to || undefined,
                    page,
                    size,
                },
            });
            setData(res.data);
        } catch (e) {
            console.error('Audit log load failed:', e);
            setData({ content: [], totalElements: 0, totalPages: 0, page: 0, size });
        } finally {
            setLoading(false);
        }
    }, [keyword, tableName, filterRole, from, to, page]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const resetFilters = () => {
        setKeyword('');
        setTableName('');
        setFilterRole('');
        setFrom('');
        setTo('');
        setPage(0);
    };

    const totalPages = data.totalPages || 0;
    const pages = useMemo(() => {
        const arr = [];
        const start = Math.max(0, page - 2);
        const end = Math.min(totalPages - 1, page + 2);
        for (let i = start; i <= end; i++) arr.push(i);
        return arr;
    }, [page, totalPages]);

    const inputStyle = {
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        padding: '9px 12px',
        fontSize: 13,
        color: '#334155',
        background: '#fff',
        outline: 'none',
    };

    return (
        <div className="page-container">
            {/* Page header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1
                        style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            letterSpacing: '-0.02em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                        }}
                    >
                        <ScrollText size={20} color="var(--color-primary)" />
                        Nhật ký hoạt động (Audit Log)
                    </h1>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                        Ghi lại toàn bộ thao tác của ADMIN / STAFF / khách hàng trên hệ thống.
                    </p>
                </div>
                <button
                    onClick={fetchLogs}
                    style={{
                        background: '#fff',
                        border: '1px solid var(--color-border)',
                        borderRadius: 8,
                        padding: '8px 14px',
                        fontSize: 13,
                        color: '#334155',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                    }}
                >
                    <RefreshCw size={14} /> Làm mới
                </button>
            </div>

            {/* Toolbar */}
            <div
                style={{
                    background: '#fff',
                    border: '1px solid var(--color-border)',
                    borderRadius: 12,
                    padding: 14,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 12,
                    boxShadow: 'var(--shadow-sm)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: '#fff',
                        border: '1px solid var(--color-border)',
                        borderRadius: 8,
                        padding: '8px 12px',
                        gridColumn: '1 / -1',
                    }}
                >
                    <Search size={14} color="#94a3b8" />
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
                        placeholder="Tìm theo tên đăng nhập, hành động hoặc mô tả..."
                        style={{ border: 'none', outline: 'none', fontSize: 13, flex: 1, color: '#334155', background: 'transparent' }}
                    />
                </div>
                <select
                    value={tableName}
                    onChange={(e) => { setTableName(e.target.value); setPage(0); }}
                    style={inputStyle}
                >
                    {TABLE_OPTIONS.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>
                <select
                    value={filterRole}
                    onChange={(e) => { setFilterRole(e.target.value); setPage(0); }}
                    style={inputStyle}
                >
                    {ROLE_OPTIONS.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>
                <input
                    type="date"
                    value={from}
                    onChange={(e) => { setFrom(e.target.value); setPage(0); }}
                    style={inputStyle}
                />
                <input
                    type="date"
                    value={to}
                    onChange={(e) => { setTo(e.target.value); setPage(0); }}
                    style={inputStyle}
                />
                {(keyword || tableName || filterRole || from || to) && (
                    <button
                        onClick={resetFilters}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--color-border)',
                            borderRadius: 8,
                            padding: '8px 12px',
                            fontSize: 12.5,
                            color: 'var(--color-danger)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            cursor: 'pointer',
                        }}
                    >
                        <X size={13} /> Xoá lọc
                    </button>
                )}
            </div>

            {/* Table */}
            <div
                style={{
                    background: '#fff',
                    border: '1px solid var(--color-border)',
                    borderRadius: 12,
                    boxShadow: 'var(--shadow-sm)',
                    overflow: 'hidden',
                }}
            >
                <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        Danh sách hoạt động
                    </h2>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                        Tổng: <strong style={{ color: 'var(--color-text-primary)' }}>{data.totalElements}</strong> bản ghi
                    </span>
                </div>

                <div className="table-scroll-wrapper">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                        <thead>
                            <tr>
                                {['Thời gian', 'Người thực hiện', 'Vai trò', 'Hành động', 'Đối tượng', 'Mô tả', 'IP'].map((h) => (
                                    <th
                                        key={h}
                                        style={{
                                            padding: '9px 16px',
                                            background: '#f8fafc',
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: '#94a3b8',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            textAlign: 'left',
                                            borderBottom: '1px solid var(--color-border-light)',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : data.content.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                        Không có hoạt động nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                data.content.map((row, idx) => {
                                    const c = colorForAction(row.action);
                                    return (
                                        <tr
                                            key={row.logId}
                                            style={{
                                                background: idx % 2 === 0 ? '#ffffff' : '#fafbfc',
                                                borderBottom: idx === data.content.length - 1 ? 'none' : '1px solid #f8fafc',
                                            }}
                                        >
                                            <td style={{ padding: '11px 16px', color: '#475569', fontFamily: 'monospace', fontSize: 12, whiteSpace: 'nowrap' }}>
                                                {formatDateTime(row.createdAt)}
                                            </td>
                                            <td style={{ padding: '11px 16px', fontWeight: 600, color: '#0f172a' }}>
                                                {row.username || '—'}
                                            </td>
                                            <td style={{ padding: '11px 16px', color: '#475569' }}>
                                                {row.role || '—'}
                                            </td>
                                            <td style={{ padding: '11px 16px' }}>
                                                <span
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 5,
                                                        padding: '3px 10px',
                                                        borderRadius: 20,
                                                        fontSize: 11.5,
                                                        fontWeight: 600,
                                                        background: c.bg,
                                                        color: c.text,
                                                        letterSpacing: '0.01em',
                                                    }}
                                                >
                                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot }} />
                                                    {row.action}
                                                </span>
                                            </td>
                                            <td style={{ padding: '11px 16px', color: '#475569' }}>
                                                {row.tableName || '—'}
                                                {row.entityId != null && (
                                                    <span style={{ color: '#94a3b8', fontFamily: 'monospace', marginLeft: 4 }}>
                                                        #{row.entityId}
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '11px 16px', color: '#475569', maxWidth: 360 }}>
                                                {row.description || '—'}
                                            </td>
                                            <td style={{ padding: '11px 16px', color: '#94a3b8', fontFamily: 'monospace', fontSize: 12 }}>
                                                {row.ipAddress || '—'}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, padding: 16 }}>
                        <button
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                            style={{ ...pageBtnStyle, opacity: page === 0 ? 0.4 : 1 }}
                        >
                            <ChevronLeft size={14} />
                        </button>
                        {pages[0] > 0 && (
                            <>
                                <button onClick={() => setPage(0)} style={pageBtnStyle}>1</button>
                                {pages[0] > 1 && <span style={{ color: '#94a3b8', fontSize: 13 }}>...</span>}
                            </>
                        )}
                        {pages.map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                style={{
                                    ...pageBtnStyle,
                                    background: p === page ? 'var(--color-primary)' : '#fff',
                                    color: p === page ? '#fff' : '#475569',
                                    borderColor: p === page ? 'var(--color-primary)' : 'var(--color-border)',
                                }}
                            >
                                {p + 1}
                            </button>
                        ))}
                        {pages[pages.length - 1] < totalPages - 1 && (
                            <>
                                {pages[pages.length - 1] < totalPages - 2 && <span style={{ color: '#94a3b8', fontSize: 13 }}>...</span>}
                                <button onClick={() => setPage(totalPages - 1)} style={pageBtnStyle}>{totalPages}</button>
                            </>
                        )}
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            style={{ ...pageBtnStyle, opacity: page >= totalPages - 1 ? 0.4 : 1 }}
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const pageBtnStyle = {
    width: 32,
    height: 32,
    borderRadius: 6,
    border: '1px solid var(--color-border)',
    background: '#fff',
    color: '#475569',
    fontSize: 13,
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
};

export default AdminAuditLog;
