import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

const PRODUCT_COLORS = {
  "echo-dot": {
    border: "rgba(56, 189, 248, 1)",
    bg: "rgba(56, 189, 248, 0.1)",
    label: "Echo Dot"
  },
  "nest-mini": {
    border: "rgba(16, 185, 129, 1)",
    bg: "rgba(16, 185, 129, 0.1)",
    label: "Nest Mini"
  },
  "homepod-mini": {
    border: "rgba(139, 92, 246, 1)",
    bg: "rgba(139, 92, 246, 0.1)",
    label: "HomePod Mini"
  }
};

const TrendPanel = ({ trendData, activeProduct }) => {
  const isComparisonMode = activeProduct === "all" || !activeProduct;

  const getDatasets = () => {
    if (!trendData) return [];

    if (isComparisonMode) {
      // Comparison Mode: Multiple lines for sentiment
      return Object.entries(trendData).map(([productId, points]) => ({
        label: `${PRODUCT_COLORS[productId]?.label || productId} Sentiment`,
        data: points.map(p => p.sentiment),
        borderColor: PRODUCT_COLORS[productId]?.border || "#cbd5e1",
        backgroundColor: PRODUCT_COLORS[productId]?.bg || "transparent",
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        yAxisID: "y-axis-1"
      }));
    } else {
      // Single Product Mode: Sentiment vs Volume
      const points = trendData[activeProduct] || [];
      return [
        {
          label: "Sentiment Score",
          data: points.map(p => p.sentiment),
          borderColor: PRODUCT_COLORS[activeProduct]?.border || "#38bdf8",
          backgroundColor: PRODUCT_COLORS[activeProduct]?.bg || "rgba(56, 189, 248, 0.1)",
          tension: 0.4,
          fill: true,
          yAxisID: "y-axis-1",
        },
        {
          label: "Mentions",
          data: points.map(p => p.mentions),
          borderColor: "rgba(244, 63, 94, 1)",
          backgroundColor: "rgba(244, 63, 94, 0.05)",
          tension: 0.4,
          fill: true,
          borderDash: [5, 5],
          yAxisID: "y-axis-2",
        }
      ];
    }
  };

  const labels = trendData && Object.values(trendData)[0]?.map(p => p.date) || [];

  const chartData = {
    labels,
    datasets: getDatasets(),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#94a3b8",
          font: { weight: "bold", size: 11 },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "#f1f5f9",
        bodyColor: "#94a3b8",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (items) => {
            return `Analysis for ${items[0].label}`;
          },
          label: function (context) {
            const productId = isComparisonMode
              ? Object.keys(trendData)[context.datasetIndex]
              : activeProduct;
            const productName = PRODUCT_COLORS[productId]?.label || productId;
            const point = (isComparisonMode ? trendData[productId] : trendData[activeProduct])[context.dataIndex];

            const lines = [
              `Product: ${productName}`,
              `Sentiment: ${(point.sentiment * 100).toFixed(1)}%`,
              `Mentions: ${point.mentions.toLocaleString()}`
            ];
            return lines;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { color: "#64748b", font: { size: 10 } }
      },
      "y-axis-1": {
        position: "left",
        min: -1,
        max: 1,
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: {
          color: "#94a3b8",
          callback: (val) => `${(val * 100).toFixed(0)}%`
        },
        title: { display: true, text: "Sentiment", color: "#64748b", font: { size: 10, weight: "bold" } }
      },
      "y-axis-2": {
        position: "right",
        display: !isComparisonMode,
        grid: { drawOnChartArea: false },
        ticks: { color: "#f43f5e" },
        title: { display: true, text: "Mentions", color: "#f43f5e", font: { size: 10, weight: "bold" } }
      }
    },
    interaction: { mode: "index", intersect: false }
  };

  return (
    <div className="glass-card p-6 min-h-125 flex flex-col gap-6">
      <div>
        <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="text-primary">📈</span> Sentiment & Volume Trends
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          {isComparisonMode
            ? "Comparing brand sentiment performance across all segments"
            : `Deep dive into performance metrics for ${PRODUCT_COLORS[activeProduct]?.label || activeProduct}`}
        </p>
      </div>

      <div className="flex-1 min-h-87.5">
        {trendData && Object.keys(trendData).length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 border border-dashed border-white/10 rounded-2xl bg-white/5">
            No trend data found for this selection
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendPanel;
