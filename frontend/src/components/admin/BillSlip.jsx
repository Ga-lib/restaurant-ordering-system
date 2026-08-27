import { formatTk } from "../../utils/formatCurrency";

function printBill(order) {
  const shortId = order.id.slice(0, 8);
  const printWindow = window.open("", "_blank", "width=420,height=640");

  if (!printWindow) {
    alert("Please allow pop-ups for this site to print the bill.");
    return;
  }

  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:4px 0;">${item.name} &times; ${item.quantity}</td>
          <td style="padding:4px 0; text-align:right;">${formatTk(item.subtotal)}</td>
        </tr>`
    )
    .join("");

  const extraRows = `
    ${order.discount_amount > 0 ? `<tr><td>Discount</td><td style="text-align:right;">&minus;${formatTk(order.discount_amount)}</td></tr>` : ""}
    ${order.tax_amount > 0 ? `<tr><td>Tax (${order.tax_percent}%)</td><td style="text-align:right;">${formatTk(order.tax_amount)}</td></tr>` : ""}
    ${order.service_charge_amount > 0 ? `<tr><td>Service Charge (${order.service_charge_percent}%)</td><td style="text-align:right;">${formatTk(order.service_charge_amount)}</td></tr>` : ""}
  `;

  const total = formatTk(order.final_amount || order.total_amount);
  const fileTitle = `Bill-${shortId}`;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>${fileTitle}</title>
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          color: #111;
          background: #fff;
          padding: 28px;
          max-width: 380px;
          margin: 0 auto;
        }
        h1 { font-size: 20px; text-align: center; margin: 0 0 4px; }
        .sub { text-align: center; font-size: 11px; color: #555; margin-bottom: 18px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .divider-table { margin-top: 10px; border-top: 1px solid #ccc; padding-top: 8px; }
        .total-row td { font-weight: bold; font-size: 16px; padding-top: 10px; border-top: 1px solid #111; }
      </style>
    </head>
    <body>
      <h1>Bill</h1>
      <p class="sub">Order ID: ${order.id}</p>
      <table>
        <tbody>${itemsHtml}</tbody>
      </table>
      <table class="divider-table">
        <tbody>
          ${extraRows}
          <tr class="total-row">
            <td>Total</td>
            <td style="text-align:right;">${total}</td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.document.title = fileTitle;
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 300);
}

function BillSlip({ order, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="liquid-glass-dropdown rounded-3xl max-w-sm w-full p-6">
        <h2 className="text-xl text-center mb-1" style={{ fontWeight: 500, color: "var(--text-primary)" }}>Bill</h2>
        <p className="text-xs text-center mb-4" style={{ color: "var(--text-faint)" }}>Order ID: {order.id}</p>

        <div className="border-t border-b py-3 mb-3" style={{ borderColor: "var(--glass-border-soft)" }}>
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm py-1" style={{ color: "var(--text-secondary)" }}>
              <span>{item.name} × {item.quantity}</span>
              <span>{formatTk(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          {order.discount_amount > 0 && (
            <div className="flex justify-between mb-1"><span>Discount</span><span>−{formatTk(order.discount_amount)}</span></div>
          )}
          {order.tax_amount > 0 && (
            <div className="flex justify-between mb-1"><span>Tax ({order.tax_percent}%)</span><span>{formatTk(order.tax_amount)}</span></div>
          )}
          {order.service_charge_amount > 0 && (
            <div className="flex justify-between mb-1"><span>Service Charge ({order.service_charge_percent}%)</span><span>{formatTk(order.service_charge_amount)}</span></div>
          )}
        </div>

        <div className="flex justify-between font-bold text-lg mb-6 border-t pt-3" style={{ borderColor: "var(--glass-border-soft)", color: "var(--text-primary)" }}>
          <span>Total</span>
          <span>{formatTk(order.final_amount || order.total_amount)}</span>
        </div>

        <div className="flex gap-3">
          <button onClick={() => printBill(order)} className="flex-1 liquid-glass-strong py-2.5 rounded-full font-medium hover:scale-105 transition-transform" style={{ color: "var(--text-primary)" }}>
            Print
          </button>
          <button onClick={onClose} className="flex-1 liquid-glass py-2.5 rounded-full font-medium hover:scale-105 transition-transform" style={{ color: "var(--text-muted)" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default BillSlip;