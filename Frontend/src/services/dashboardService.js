import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

/** Returns a human-readable relative-time string like "12 minutes ago" */
function relativeTime(minutesAgo) {
  if (minutesAgo < 1) return "just now";
  if (minutesAgo < 60) return `${minutesAgo} minute${minutesAgo !== 1 ? "s" : ""} ago`;
  const h = Math.round(minutesAgo / 60);
  return `${h} hour${h !== 1 ? "s" : ""} ago`;
}

/** Severity → alert level mapping expected by AlertsPreviewPanel */
const SEV_LEVEL = { Critical: "High", Medium: "Medium", Low: "Low" };

/** Build a rich 3-sentence AI insight from available data */
function buildInsight(data, brands = [], backendInsight = "") {
  // Use the backend's own curated insight if available
  if (backendInsight) return backendInsight;

  // Best sentiment brand
  const topBrand = brands.length
    ? brands.reduce((a, b) => (a.avg_sentiment > b.avg_sentiment ? a : b))
    : null;

  // Top trending topic
  const topics = data.topics || [];
  const topTopic = topics.length
    ? topics.reduce((a, b) => (a.popularity > b.popularity ? a : b))
    : null;

  // Most at-risk brand (lowest sentiment)
  const riskBrand = brands.length
    ? brands.reduce((a, b) => (a.avg_sentiment < b.avg_sentiment ? a : b))
    : null;

  const parts = [];
  if (topBrand) {
    const score = ((topBrand.avg_sentiment + 1) / 2 * 100).toFixed(0);
    parts.push(`${topBrand.name} leads with the strongest positive sentiment at ${score}% across all monitored channels.`);
  }
  if (topTopic) {
    parts.push(`"${topTopic.name}" is the top trending topic with ${(topTopic.popularity || 0).toFixed(0)}% topic share — monitor for sentiment shifts.`);
  }
  if (riskBrand && (!topBrand || riskBrand.name !== topBrand.name)) {
    const score = ((riskBrand.avg_sentiment + 1) / 2 * 100).toFixed(0);
    parts.push(`${riskBrand.name} shows the lowest sentiment score (${score}%) and may need attention to address negative signal patterns.`);
  }

  return parts.length
    ? parts.join(" ")
    : `Analysis complete. ${data.summary?.mentions?.toLocaleString() || 0} total mentions tracked across all products.`;
}

export async function getDashboardOverview(filters) {
  try {
    const sentimentParams = {
      product: filters.product,
      platform: filters.source,
      range: filters.range
    };

    // Add custom dates if provided
    if (filters.from) sentimentParams.from = filters.from;
    if (filters.to) sentimentParams.to = filters.to;

    const sentimentReq = axios.get(`${API_BASE_URL}/sentiment`, {
      params: sentimentParams
    });

    const brandsReq = axios.get(`${API_BASE_URL}/sentiment/brands`)
      .catch(() => ({ data: { brands: [], insight: "" } }));

    const alertsReq = axios.get(`${API_BASE_URL}/sentiment/alerts`)
      .catch(() => ({ data: { alerts: [] } }));

    const [sentimentResp, brandsResp, alertsResp] = await Promise.all([
      sentimentReq,
      brandsReq,
      alertsReq
    ]);

    const data = sentimentResp.data;
    const brands = brandsResp.data.brands || [];
    const backendInsight = brandsResp.data.insight || "";

    const liveAlerts = (alertsResp.data.alerts || [])
      .slice(0, 4)
      .map((a) => ({
        level: SEV_LEVEL[a.severity] || "Low",
        message: a.description || `${a.type} detected for ${a.product}`,
        time: relativeTime(a.minutes_ago ?? 0),
      }));

    return {
      summary: data.summary,
      trend_comparison: data.trend_comparison,
      topics: (data.topics || []).map((t) => ({
        name: t.name,
        mentions: t.mentions || 0,
        sentiment: t.sentiment || 0,
        popularity: t.popularity || 0,
      })),
      channels: Object.entries(data.platform_breakdown || {}).map(([name, mentions]) => ({
        name,
        mentions,
      })),
      recent_data: data.recent_data,
      alerts: liveAlerts,
      summaryText: buildInsight(data, brands, backendInsight),
    };

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
}

export async function getSentimentExplorerData(filters) {
  try {
    const response = await axios.get(`${API_BASE_URL}/sentiment/explorer`, {
      params: {
        product: filters.product,
        platform: filters.source,
        sentiment: filters.sentiment,
        topic: filters.topic,
        search: filters.search,
        page: filters.page,
        page_size: 20
      }
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching explorer data:", error);
    throw error;
  }
}

export async function getAlerts() {
  try {
    const response = await axios.get(`${API_BASE_URL}/sentiment/alerts`);
    return response.data;
  } catch (error) {
    console.error("Error fetching alerts:", error);
    throw error;
  }
}

export async function getBrandComparison(range = "30d") {
  try {
    const response = await axios.get(`${API_BASE_URL}/sentiment/brands`, {
      params: { range }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching brand comparison data:", error);
    throw error;
  }
}
