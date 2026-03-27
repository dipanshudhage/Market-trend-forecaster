// src/services/reportsService.js
import httpClient from "./httpClient";

export async function generateReport({
  type,      // "summary" | "trend" | "alerts" | "topics"
  format,    // "pdf" | "xlsx"
  brand,
  channel,
  fromDate,
  toDate,
}) {
  const params = {
    type,
    format,
    brand,
    channel,
    from: fromDate || undefined,
    to: toDate || undefined,
  };

  // IMPORTANT: override responseType for this one request
  const response = await httpClient.get("/api/reports", {
    params,
    responseType: "blob",
  });

  const mimeType =
    format === "pdf"
      ? "application/pdf"
      : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  const blob = new Blob([response.data], { type: mimeType });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  const ts = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `report-${type}-${ts}.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function getReportPreview({ type, brand, channel, fromDate, toDate }) {
  const params = {
    type,
    brand,
    channel,
    from: fromDate || undefined,
    to: toDate || undefined,
  };

  const response = await httpClient.get("/api/reports/preview", { params });
  return response.data;
}
