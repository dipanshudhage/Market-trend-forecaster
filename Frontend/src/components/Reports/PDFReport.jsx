import React from "react";

/**
 * PDFReport Component
 * Designed specifically for html2pdf.js export.
 * Uses safe colors (HEX/RGBA) and avoids Tailwind opacity utilities (/5, /10)
 * to prevent oklch and color function parsing errors in html2canvas.
 */
const PDFReport = ({ data, reportType, brand, channel, timeframe, trend }) => {
    if (!data) return null;

    const sentiment = data?.summary?.sentimentScore ?? 0;
    const sentimentFormatted = (Number(sentiment) * 100).toFixed(1);
    const isPositive = Number(sentiment) >= 0;

    // Safe color constants
    const COLORS = {
        bg: "#0f172a",
        cardBg: "rgba(30, 41, 59, 0.5)",
        border: "rgba(255, 255, 255, 0.1)",
        textPrimary: "#ffffff",
        textSecondary: "#94a3b8",
        accent: "#3b82f6",
        emerald: "#10b981",
        rose: "#f43f5e",
        amber: "#f59e0b",
        blueSoft: "rgba(59, 130, 246, 0.15)",
        blueBorder: "rgba(59, 130, 246, 0.3)"
    };

    // Simple SVG chart generator
    const renderChart = () => {
        if (!trend || trend.length === 0) return null;

        const width = 720; // Full width for PDF
        const height = 200;
        const padding = 20;

        const minX = 0;
        const maxX = trend.length - 1;
        const sentiments = trend.map(d => d.sentiment);
        const minY = Math.min(...sentiments);
        const maxY = Math.max(...sentiments);
        const rangeY = (maxY - minY) || 1;

        const getX = (i) => (i / maxX) * (width - 2 * padding) + padding;
        const getY = (val) => height - (((val - minY) / rangeY) * (height - 2 * padding) + padding);

        if (reportType === "forecast") {
            // Area Chart Style
            const points = trend.map((d, i) => `${getX(i)},${getY(d.sentiment)}`).join(" ");
            const areaPoints = `${getX(0)},${height} ${points} ${getX(maxX)},${height}`;
            return (
                <svg width={width} height={height} style={{ display: "block", marginTop: "20px", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "12px" }}>
                    <path d={`M ${areaPoints}`} fill="rgba(16, 185, 129, 0.1)" />
                    <polyline fill="none" stroke={COLORS.emerald} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={points} />
                </svg>
            );
        }

        if (reportType === "topics" || reportType === "alerts") {
            // Bar Chart Style
            const barWidth = (width - 2 * padding) / trend.length - 10;
            return (
                <svg width={width} height={height} style={{ display: "block", marginTop: "20px", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "12px" }}>
                    {trend.map((d, i) => {
                        const h = ((d.sentiment - minY) / rangeY) * (height - 2 * padding) + 10;
                        const x = getX(i) - barWidth / 2;
                        const y = height - h;
                        return (
                            <rect
                                key={i}
                                x={x}
                                y={y}
                                width={barWidth}
                                height={h}
                                fill={reportType === "alerts" ? COLORS.rose : ['#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#f43f5e'][i % 5]}
                                rx="4"
                            />
                        );
                    })}
                </svg>
            );
        }

        // Default Line Chart
        const points = trend.map((d, i) => `${getX(i)},${getY(d.sentiment)}`).join(" ");
        return (
            <svg width="100%" height={height} style={{ display: "block", marginTop: "20px", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "12px" }}>
                <polyline fill="none" stroke={COLORS.accent} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={points} />
            </svg>
        );
    };

    return (
        <div
            id="pdf-content-root"
            style={{
                backgroundColor: COLORS.bg,
                color: COLORS.textPrimary,
                width: "794px",
                padding: "40px",
                fontFamily: "Arial, sans-serif",
                minHeight: "1100px",
                display: "block",
                boxSizing: "border-box",
                overflow: "hidden",
                lineHeight: "1.4"
            }}
        >
            {/* 🔥 SAFE INNER WRAPPER: Prevents layout leakage */}
            <div style={{ maxWidth: "100%", overflow: "hidden" }}>
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "32px",
                        paddingBottom: "24px",
                        borderBottom: `1px solid ${COLORS.border}`,
                        width: "100%",
                        boxSizing: "border-box"
                    }}
                >
                    <div>
                        <h1 style={{ color: COLORS.textPrimary, fontSize: "28px", fontWeight: "bold", marginBottom: "8px", margin: 0 }}>
                            Market Intelligence Report: {reportType?.toUpperCase()}
                        </h1>
                        <p style={{ color: COLORS.textSecondary, fontSize: "14px", margin: 0 }}>Generated on {new Date().toLocaleDateString()}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: COLORS.textSecondary, marginBottom: "4px" }}>Report ID</div>
                        <p style={{ color: COLORS.textPrimary, fontFamily: "monospace", fontSize: "14px", margin: 0 }}>MTF-{Math.floor(1000 + Math.random() * 9000)}</p>
                    </div>
                </div>

                {/* Configuration Metadata */}
                <div style={{ display: "flex", gap: "16px", marginBottom: "40px", width: "100%" }}>
                    {[
                        { label: "Target Brand", value: brand || "All Brands" },
                        { label: "Channel", value: channel || "All Channels" },
                        { label: "Timeframe", value: timeframe || "30 Days" }
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            style={{
                                padding: "10px 18px",
                                borderRadius: "8px",
                                backgroundColor: COLORS.cardBg,
                                border: `1px solid ${COLORS.border}`,
                                flex: 1
                            }}
                        >
                            <span style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", display: "block", marginBottom: "4px", color: COLORS.textSecondary }}>{item.label}</span>
                            <span style={{ color: COLORS.textPrimary, fontSize: "13px", fontWeight: "bold" }}>{item.value}</span>
                        </div>
                    ))}
                </div>

                {/* KPI Section - 2 columns for better spacing */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                    marginBottom: "40px",
                    width: "100%",
                    pageBreakInside: "avoid"
                }}>
                    <div style={{ flex: 1, padding: "20px", borderRadius: "12px", backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
                        <p style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "12px", color: COLORS.textSecondary }}>
                            {reportType === "forecast" ? "Growth Projection" :
                                reportType === "alerts" ? "Active Alerts" :
                                    reportType === "topics" ? "Total Themes" : "Sentiment Score"}
                        </p>
                        <div style={{ marginBottom: "4px" }}>
                            <span style={{ fontSize: "28px", fontWeight: "bold", color: reportType === "alerts" ? COLORS.rose : (isPositive ? COLORS.emerald : COLORS.rose) }}>
                                {reportType === "forecast" ? data.growth || "+14.2%" :
                                    reportType === "alerts" ? data.risks?.length || 0 :
                                        reportType === "topics" ? data.topics?.length || 0 :
                                            `${sentimentFormatted}%`}
                            </span>
                        </div>
                        <div style={{ marginTop: "12px", height: "4px", width: "100%", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "2px" }}>
                            <div style={{
                                width: `${reportType === 'forecast' ? 75 : reportType === 'alerts' ? 40 : reportType === 'topics' ? 85 : Math.abs(sentiment * 100)}%`,
                                height: "100%",
                                backgroundColor: reportType === "alerts" ? COLORS.rose : (isPositive ? COLORS.emerald : COLORS.rose),
                                borderRadius: "2px"
                            }} />
                        </div>
                    </div>

                    <div style={{ flex: 1, padding: "20px", borderRadius: "12px", backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
                        <p style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "12px", color: COLORS.textSecondary }}>
                            {reportType === "forecast" ? "Model Confidence" :
                                reportType === "alerts" ? "High Risk Spikes" :
                                    "Engagement Volume"}
                        </p>
                        <span style={{ color: COLORS.textPrimary, fontSize: "28px", fontWeight: "bold" }}>
                            {reportType === "forecast" ? "94%" :
                                reportType === "alerts" ? (data.risks?.length > 2 ? "3" : "1") :
                                    data.summary?.mentions?.toLocaleString() || "12.4k"}
                        </span>
                        <p style={{ fontSize: "11px", marginTop: "10px", color: COLORS.textSecondary }}>
                            {reportType === "forecast" ? "AI historical delta" : "Total mentions analyzed"}
                        </p>
                    </div>

                    <div style={{ flex: 1, padding: "20px", borderRadius: "12px", backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
                        <p style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "12px", color: COLORS.textSecondary }}>
                            {reportType === "forecast" ? "Forecast Horizon" :
                                reportType === "alerts" ? "Risk Status" :
                                    reportType === "topics" ? "Trend Velocity" : "System Status"}
                        </p>
                        <span style={{ fontSize: "28px", fontWeight: "bold", color: (reportType === "alerts" && data.risks?.length > 0) ? COLORS.rose : COLORS.emerald }}>
                            {reportType === "forecast" ? "90D" :
                                reportType === "alerts" ? (data.risks?.length > 0 ? "Critical" : "Stable") :
                                    reportType === "topics" ? "High" : "Stable"}
                        </span>
                        <p style={{ fontSize: "11px", marginTop: "10px", color: COLORS.textSecondary }}>{reportType === 'forecast' ? 'Projected through Q3' : 'Live monitoring active'}</p>
                    </div>
                </div>

                {/* Specialized Chart Area */}
                <div style={{ marginBottom: "40px" }}>
                    <h2 style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "16px", color: COLORS.textSecondary }}>
                        {reportType === 'forecast' ? 'Predictive Sentiment Growth' :
                            reportType === 'alerts' ? 'Daily Alert Frequency' :
                                reportType === 'topics' ? 'Thematic Mention Distribution' :
                                    'Sentiment Trend Analysis'}
                    </h2>
                    {renderChart()}
                </div>

                {/* Insights & Trends Section */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "20px",
                    marginBottom: "40px",
                    width: "100%",
                    pageBreakInside: "avoid"
                }}>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: "13px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "24px", color: COLORS.textSecondary }}>Executive Insights</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {data.insights?.map((insight, idx) => (
                                <div key={idx} style={{ display: "flex", gap: "16px", padding: "18px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.05)", border: `1px solid ${COLORS.border}` }}>
                                    <div style={{ marginTop: "6px", width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0, backgroundColor: COLORS.accent }} />
                                    <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#cbd5e1", margin: 0 }}>{insight}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: "13px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "24px", color: COLORS.textSecondary }}>Trending Topics</h2>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                            {data.topics?.map((topic, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        padding: "8px 14px",
                                        borderRadius: "8px",
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                        backgroundColor: COLORS.blueSoft,
                                        border: `1px solid ${COLORS.blueBorder}`,
                                        color: COLORS.accent
                                    }}
                                >
                                    {topic}
                                </div>
                            ))}
                        </div>

                        {data.risks?.length > 0 && (
                            <div style={{ marginTop: "40px" }}>
                                <h2 style={{ fontSize: "13px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "18px", color: COLORS.amber }}>Detected Risks</h2>
                                <div style={{ padding: "18px", borderRadius: "12px", backgroundColor: "rgba(245, 158, 11, 0.08)", border: `1px solid rgba(245, 158, 11, 0.2)` }}>
                                    {data.risks.map((risk, idx) => (
                                        <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
                                            <span style={{ color: COLORS.amber }}>•</span>
                                            <p style={{ fontSize: "12px", fontWeight: "600", color: "#fed7aa", margin: 0 }}>{risk}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Data Snapshot Table */}
                <div style={{ marginTop: "40px", width: "100%", pageBreakBefore: "auto" }}>
                    <h2 style={{ fontSize: "13px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "24px", color: COLORS.textSecondary }}>Market Data Snapshot</h2>
                    <div style={{ borderRadius: "12px", overflow: "hidden", border: `1px solid ${COLORS.border}`, pageBreakInside: "avoid" }}>
                        <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                                    <th style={{ padding: "18px", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: COLORS.textSecondary, borderBottom: `1px solid ${COLORS.border}` }}>Date</th>
                                    <th style={{ padding: "18px", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: COLORS.textSecondary, borderBottom: `1px solid ${COLORS.border}` }}>Platform</th>
                                    <th style={{ padding: "18px", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: COLORS.textSecondary, borderBottom: `1px solid ${COLORS.border}` }}>Product</th>
                                    <th style={{ padding: "18px", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: COLORS.textSecondary, borderBottom: `1px solid ${COLORS.border}` }}>Sentiment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.table?.map((row, idx) => (
                                    <tr key={idx} style={{ borderBottom: idx === data.table.length - 1 ? "none" : `1px solid ${COLORS.border}` }}>
                                        <td style={{ color: COLORS.textPrimary, padding: "18px", fontSize: "13px", fontWeight: "500" }}>{new Date(row.date).toLocaleDateString()}</td>
                                        <td style={{ color: COLORS.textPrimary, padding: "18px", fontSize: "13px", fontWeight: "bold", textTransform: "uppercase" }}>{row.platform}</td>
                                        <td style={{ color: COLORS.textPrimary, padding: "18px", fontSize: "13px" }}>{row.product}</td>
                                        <td style={{ padding: "18px", fontSize: "13px", fontWeight: "bold", color: row.sentiment_label === "Positive" ? COLORS.emerald : row.sentiment_label === "Negative" ? COLORS.rose : COLORS.amber }}>
                                            {row.sentiment_label}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: "80px", paddingTop: "40px", textAlign: "center", borderTop: `1px solid ${COLORS.border}` }}>
                    <p style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "2.5px", color: COLORS.textSecondary, margin: 0 }}>
                        Confidential • Market Trend Forecaster AI Analysis
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PDFReport;
