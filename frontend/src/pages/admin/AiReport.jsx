import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { generateAiReport } from "../../services/aiReportService";
import { formatTk } from "../../utils/formatCurrency";

function AiReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setError("");
    try {
      const data = await generateAiReport();
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl" style={{ fontWeight: 500, color: "var(--text-primary)" }}>AI Reports & Analytics</h1>
        <button onClick={handleGenerate} disabled={loading}
          className="liquid-glass-strong px-5 py-2.5 rounded-full font-medium disabled:opacity-50 hover:scale-105 transition-transform" style={{ color: "var(--text-primary)" }}>
          {loading ? "Generating..." : "Generate Report"}
        </button>
      </div>

      {error && <p className="text-red-400 mb-4">Error: {error}</p>}

      {report && (
        <>
          {report.warning && <div className="liquid-glass rounded-xl p-4 text-sm mb-6" style={{ color: "#f59e0b" }}>{report.warning}</div>}

          {report.ai_report && (
            <div className="liquid-glass rounded-2xl p-6 mb-6" style={{ color: "var(--text-secondary)" }}>
              <ReactMarkdown>{report.ai_report}</ReactMarkdown>
            </div>
          )}

          <div className="liquid-glass rounded-2xl p-6">
            <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-muted)" }}>Raw Data Used</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p style={{ color: "var(--text-muted)" }}>Completed Orders</p>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>{report.raw_data.total_completed_orders}</p>
              </div>
              <div>
                <p style={{ color: "var(--text-muted)" }}>Total Revenue</p>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>{formatTk(report.raw_data.total_revenue_tk)}</p>
              </div>
              <div>
                <p style={{ color: "var(--text-muted)" }}>Total Menu Items</p>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>{report.raw_data.total_menu_items}</p>
              </div>
              <div>
                <p style={{ color: "var(--text-muted)" }}>Order Type Breakdown</p>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {Object.entries(report.raw_data.order_type_breakdown).map(([type, count]) => `${type}: ${count}`).join(", ")}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {!report && !loading && <p style={{ color: "var(--text-muted)" }}>Click "Generate Report" to get AI-powered insights based on your current sales data.</p>}
    </div>
  );
}

export default AiReport;