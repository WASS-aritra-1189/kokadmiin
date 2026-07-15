import { createFileRoute } from "@tanstack/react-router";
import { orders, currency } from "@/mock/data";

export const Route = createFileRoute("/print/invoice/$id")({
  component: Invoice,
});

function Invoice() {
  const { id } = Route.useParams();
  const order = orders.find((o) => o.id.replace("#", "") === id) ?? orders[0];
  const sub = order.lines.reduce((s, l) => s + l.qty * l.price, 0);
  const gst = Math.round(sub * 0.05);
  const ship = 49;
  const total = sub + gst + ship;

  return (
    <div className="min-h-screen bg-[#F3F4F6] py-8 print:bg-white print:py-0">
      <div className="mx-auto max-w-[820px] bg-white p-10 shadow-md print:shadow-none">
        <div className="flex items-start justify-between border-b border-[#E5E7EB] pb-6">
          <div>
            <div className="text-[22px] font-semibold tracking-tight">BookAdmin Bookstore Pvt. Ltd.</div>
            <div className="mt-1 text-[11px] text-[#6B7280]">
              12 Rosewood Complex, Andheri West, Mumbai 400058<br />
              GSTIN: 27AABCB1234C1Z5 · CIN: U74999MH2021PTC123456
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">Tax invoice</div>
            <div className="mt-1 font-mono text-[16px] font-semibold text-[#4F46E5]">{order.id}</div>
            <div className="text-[11px] text-[#6B7280]">Date: {order.date}</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6 text-[12px]">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#6B7280]">Billed to</div>
            <div className="mt-1 leading-relaxed">
              <div className="font-semibold">{order.customer}</div>
              {order.address.line1}<br />{order.address.line2}<br />
              {order.address.city}, {order.address.state} {order.address.pincode}<br />
              {order.address.phone}<br />{order.email}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#6B7280]">Payment</div>
            <div className="mt-1"><span className="font-medium">Method:</span> {order.payment}</div>
            <div><span className="font-medium">Status:</span> Paid</div>
            <div className="mt-3 text-[10px] uppercase tracking-wider text-[#6B7280]">Shipment</div>
            <div className="mt-1"><span className="font-medium">Courier:</span> {order.courier}</div>
            <div><span className="font-medium">AWB:</span> {order.awb ?? "—"}</div>
          </div>
        </div>

        <table className="mt-6 w-full text-[12px]">
          <thead className="border-b-2 border-[#111827] text-[10px] uppercase tracking-wider text-[#374151]">
            <tr>
              <th className="py-2 text-left">#</th>
              <th className="py-2 text-left">Description</th>
              <th className="py-2 text-left">HSN</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Rate</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.lines.map((l, i) => (
              <tr key={i} className="border-b border-[#F3F4F6]">
                <td className="py-2.5">{i + 1}</td>
                <td className="py-2.5"><div className="font-medium">{l.title}</div><div className="font-mono text-[10px] text-[#6B7280]">{l.bookId}</div></td>
                <td className="py-2.5 text-[#4B5563]">4901</td>
                <td className="py-2.5 text-right tabular-nums">{l.qty}</td>
                <td className="py-2.5 text-right tabular-nums">{currency(l.price)}</td>
                <td className="py-2.5 text-right font-medium tabular-nums">{currency(l.qty * l.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto max-w-[280px] space-y-1 text-[12px]">
          <Row label="Subtotal" value={currency(sub)} />
          <Row label="CGST @ 2.5%" value={currency(Math.round(gst / 2))} />
          <Row label="SGST @ 2.5%" value={currency(gst - Math.round(gst / 2))} />
          <Row label="Shipping" value={currency(ship)} />
          <div className="mt-2 border-t-2 border-[#111827] pt-2"><Row label="Grand total" value={currency(total)} bold /></div>
        </div>

        <div className="mt-10 border-t border-[#E5E7EB] pt-4 text-[10px] text-[#6B7280]">
          Books are exempt from GST on selling price (HSN 4901). GST shown on shipping and services only. Thank you for shopping with BookAdmin.
        </div>

        <div className="mt-4 flex justify-end gap-2 print:hidden">
          <button onClick={() => window.print()} className="rounded-md bg-[#111827] px-3 py-1.5 text-[12px] font-medium text-white">Print / Save PDF</button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={"flex justify-between " + (bold ? "text-[14px] font-semibold" : "text-[#4B5563]")}>
      <span>{label}</span><span className="tabular-nums text-[#111827]">{value}</span>
    </div>
  );
}
