/**
 * GanttView Bileşeni
 * Görevleri startDate → dueDate aralığında yatay Gantt çubukları olarak gösterir.
 * Priority'e göre renk, assignee bilgisi ve bugünün konumunu gösterir.
 */

import React, { useMemo, useRef, useState } from "react";

/* ── Yardımcı sabitler ─────────────────────────────────────── */
const PRIORITY_COLORS = {
    low:    { bar: "#22c55e", bg: "rgba(34,197,94,0.15)",  text: "#22c55e" },
    medium: { bar: "#fbbf24", bg: "rgba(251,191,36,0.15)", text: "#fbbf24" },
    high:   { bar: "#ef4444", bg: "rgba(239,68,68,0.15)",  text: "#ef4444" },
};

const DEFAULT_COLOR = { bar: "#6366f1", bg: "rgba(99,102,241,0.15)", text: "#6366f1" };

const TR_MONTHS = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
const TR_DAYS   = ["Paz","Pzt","Sal","Çar","Per","Cum","Cmt"];

function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
}
function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}
function diffDays(a, b) {
    return Math.round((startOfDay(b) - startOfDay(a)) / 86400000);
}
function formatDate(d) {
    return `${d.getDate()} ${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/* ── Ana Bileşen ───────────────────────────────────────────── */
export default function GanttView({ tasks = [], project }) {
    const [tooltip, setTooltip] = useState(null); // { task, x, y }
    const [hoveredId, setHoveredId] = useState(null);
    const containerRef = useRef(null);

    /* Geçerli görevleri filtrele (en az dueDate olmalı) */
    const validTasks = useMemo(() =>
        tasks.filter(t => t.dueDate),
    [tasks]);

    /* Zaman aralığını hesapla */
    const { rangeStart, rangeEnd, totalDays } = useMemo(() => {
        if (!validTasks.length) {
            const today = startOfDay(new Date());
            return { rangeStart: today, rangeEnd: addDays(today, 30), totalDays: 30 };
        }

        let minDate = null, maxDate = null;

        validTasks.forEach(t => {
            const start = t.startDate ? startOfDay(new Date(t.startDate)) : startOfDay(new Date(t.dueDate));
            const end   = startOfDay(new Date(t.dueDate));

            if (!minDate || start < minDate) minDate = start;
            if (!maxDate || end   > maxDate) maxDate = end;
        });

        const rangeStart = addDays(minDate, -3);
        const rangeEnd   = addDays(maxDate,  5);
        const totalDays  = Math.max(diffDays(rangeStart, rangeEnd), 1);

        return { rangeStart, rangeEnd, totalDays };
    }, [validTasks]);

    /* Bugünün konumu */
    const todayOffset = useMemo(() => {
        const today = startOfDay(new Date());
        const d = diffDays(rangeStart, today);
        return Math.max(0, Math.min(d / totalDays * 100, 100));
    }, [rangeStart, totalDays]);

    /* Başlık günleri */
    const headerDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < totalDays; i++) {
            days.push(addDays(rangeStart, i));
        }
        return days;
    }, [rangeStart, totalDays]);

    /* Ay grupları (header ikinci satır) */
    const monthGroups = useMemo(() => {
        const groups = [];
        let current = null;
        headerDays.forEach((d, i) => {
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (!current || current.key !== key) {
                current = { key, label: `${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}`, start: i, count: 1 };
                groups.push(current);
            } else {
                current.count++;
            }
        });
        return groups;
    }, [headerDays]);

    /* Görev için bar bilgileri */
    function getBarInfo(task) {
        const start = task.startDate
            ? startOfDay(new Date(task.startDate))
            : startOfDay(new Date(task.dueDate));
        const end = startOfDay(new Date(task.dueDate));

        const left  = Math.max(0, diffDays(rangeStart, start)) / totalDays * 100;
        const width = Math.max(0.5, diffDays(start, end) + 1)  / totalDays * 100;
        const colors = PRIORITY_COLORS[task.priority?.toLowerCase()] || DEFAULT_COLOR;

        return { left, width: Math.min(width, 100 - left), colors };
    }

    /* Tooltip handler */
    function handleBarEnter(e, task) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        setTooltip({ task, x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 10 });
        setHoveredId(task._id);
    }
    function handleBarLeave() {
        setTooltip(null);
        setHoveredId(null);
    }

    /* Boş durum */
    if (!validTasks.length) {
        return (
            <div className="gantt-empty">
                <div className="gantt-empty-icon">📅</div>
                <h3>Zaman Çizelgesi Boş</h3>
                <p>Görevlere bitiş tarihi ekleyerek Gantt görünümünü etkinleştirebilirsiniz.</p>
            </div>
        );
    }

    const DAY_PX = Math.max(28, Math.min(60, 1200 / totalDays)); // responsive hücre genişliği
    const TOTAL_W = DAY_PX * totalDays;

    return (
        <div className="gantt-wrapper" ref={containerRef}>

            {/* Başlık + Izgara + Barlar */}
            <div className="gantt-scroll-area">
                <div className="gantt-inner" style={{ minWidth: TOTAL_W + 200 }}>

                    {/* Sol: Görev İsimleri */}
                    <div className="gantt-sidebar">
                        <div className="gantt-sidebar-header">
                            <span>Görev</span>
                        </div>
                        {validTasks.map(task => (
                            <div
                                key={task._id}
                                className={`gantt-row-label ${hoveredId === task._id ? "hovered" : ""}`}
                            >
                                <span
                                    className={`gantt-priority-dot priority-dot-${task.priority?.toLowerCase() || "default"}`}
                                />
                                <span className="gantt-task-name" title={task.task}>
                                    {task.task}
                                </span>
                                {task.assignee && (
                                    <span className="gantt-assignee-mini" title={task.assignee?.username || task.assignee}>
                                        {(task.assignee?.username || task.assignee || "?").charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Sağ: Takvim Izgarası */}
                    <div className="gantt-chart-area" style={{ width: TOTAL_W }}>

                        {/* Ay Başlıkları */}
                        <div className="gantt-month-row" style={{ width: TOTAL_W }}>
                            {monthGroups.map(g => (
                                <div
                                    key={g.key}
                                    className="gantt-month-cell"
                                    style={{ width: g.count * DAY_PX }}
                                >
                                    {g.label}
                                </div>
                            ))}
                        </div>

                        {/* Gün Başlıkları */}
                        <div className="gantt-day-row" style={{ width: TOTAL_W }}>
                            {headerDays.map((d, i) => {
                                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                const isToday   = diffDays(d, startOfDay(new Date())) === 0;
                                return (
                                    <div
                                        key={i}
                                        className={`gantt-day-cell ${isWeekend ? "weekend" : ""} ${isToday ? "today-header" : ""}`}
                                        style={{ width: DAY_PX }}
                                    >
                                        {DAY_PX >= 36 ? (
                                            <>
                                                <span className="day-num">{d.getDate()}</span>
                                                {DAY_PX >= 48 && <span className="day-name">{TR_DAYS[d.getDay()]}</span>}
                                            </>
                                        ) : (
                                            <span className="day-num">{d.getDate()}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Satırlar + Barlar */}
                        <div className="gantt-rows" style={{ width: TOTAL_W }}>

                            {/* Bugün çizgisi */}
                            <div
                                className="gantt-today-line"
                                style={{ left: `${todayOffset}%` }}
                            >
                                <span className="gantt-today-label">Bugün</span>
                            </div>

                            {/* Hafta sonu gölgesi */}
                            {headerDays.map((d, i) => {
                                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                if (!isWeekend) return null;
                                return (
                                    <div
                                        key={i}
                                        className="gantt-weekend-col"
                                        style={{ left: i * DAY_PX, width: DAY_PX }}
                                    />
                                );
                            })}

                            {/* Görev satırları */}
                            {validTasks.map(task => {
                                const { left, width, colors } = getBarInfo(task);
                                const isHovered = hoveredId === task._id;

                                return (
                                    <div
                                        key={task._id}
                                        className={`gantt-row ${isHovered ? "hovered" : ""}`}
                                    >
                                        {/* Izgara çizgileri */}
                                        {headerDays.map((_, i) => (
                                            <div
                                                key={i}
                                                className="gantt-grid-cell"
                                                style={{ width: DAY_PX }}
                                            />
                                        ))}

                                        {/* Gantt Çubuğu */}
                                        <div
                                            className={`gantt-bar ${isHovered ? "hovered" : ""}`}
                                            style={{
                                                left:    `${left}%`,
                                                width:   `${width}%`,
                                                background: colors.bar,
                                                boxShadow: isHovered
                                                    ? `0 4px 20px ${colors.bar}66`
                                                    : `0 2px 8px ${colors.bar}33`,
                                            }}
                                            onMouseEnter={e => handleBarEnter(e, task)}
                                            onMouseLeave={handleBarLeave}
                                        >
                                            <span className="gantt-bar-label">
                                                {task.task}
                                            </span>
                                            {task.assignee && (
                                                <span
                                                    className="gantt-bar-avatar"
                                                    title={task.assignee?.username || task.assignee}
                                                >
                                                    {(task.assignee?.username || task.assignee || "?").charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="gantt-tooltip"
                    style={{ left: tooltip.x, top: tooltip.y }}
                >
                    <div className="gantt-tooltip-title">{tooltip.task.task}</div>
                    <div className="gantt-tooltip-row">
                        <span>📅 Başlangıç:</span>
                        <span>{tooltip.task.startDate ? formatDate(new Date(tooltip.task.startDate)) : "—"}</span>
                    </div>
                    <div className="gantt-tooltip-row">
                        <span>🏁 Bitiş:</span>
                        <span>{tooltip.task.dueDate ? formatDate(new Date(tooltip.task.dueDate)) : "—"}</span>
                    </div>
                    <div className="gantt-tooltip-row">
                        <span>⚡ Öncelik:</span>
                        <span style={{ color: (PRIORITY_COLORS[tooltip.task.priority?.toLowerCase()] || DEFAULT_COLOR).text }}>
                            {tooltip.task.priority || "—"}
                        </span>
                    </div>
                    {tooltip.task.assignee && (
                        <div className="gantt-tooltip-row">
                            <span>👤 Atanan:</span>
                            <span>{tooltip.task.assignee?.username || tooltip.task.assignee}</span>
                        </div>
                    )}
                    {tooltip.task.status && (
                        <div className="gantt-tooltip-row">
                            <span>🔖 Durum:</span>
                            <span>{tooltip.task.status}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Açıklama (Legend) */}
            <div className="gantt-legend">
                {Object.entries(PRIORITY_COLORS).map(([key, val]) => (
                    <div key={key} className="gantt-legend-item">
                        <span className="gantt-legend-dot" style={{ background: val.bar }} />
                        <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    </div>
                ))}
                <div className="gantt-legend-item">
                    <span className="gantt-legend-today" />
                    <span>Bugün</span>
                </div>
            </div>
        </div>
    );
}