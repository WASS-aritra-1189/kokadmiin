import { createFileRoute } from "@tanstack/react-router";
import { orders } from "@/mock/data";

export const Route = createFileRoute("/print/label/$id")({
  component: Label,
});

function Label() {
  const { id } = Route.useParams();
  const order = orders.find((o) => o.id.replace("#", "") === id) ?? orders[0];
  const awb = order.awb ?? `AWB${Math.floor(1_000_000 + Math.random() * 8_999_999)}`;

  return (
    <div className="min-h-screen bg-[#F3F4F6] py-8 print:bg-white print:py-0">
      <div className="mx-auto w-[420px] bg-white p-5 shadow-md print:shadow-none" style={{ minHeight: 595 }}>
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <div className="text-[13px] font-bold">{order.courier.toUpperCase()}</div>
          <div className="text-[10px]">Prepaid · {order.payment}</div>
        </div>

        <div className="mt-3">
          <div className="text-[9px] uppercase tracking-widest text-[#6B7280]">Ship to</div>
          <div className="mt-1 text-[13px] font-semibold leading-tight">{order.customer}</div>
          <div className="mt-1 text-[12px] leading-snug">
            {order.address.line1}<br />
            {order.address.line2}<br />
            {order.address.city}, {order.address.state}<br />
            <span className="text-[16px] font-bold tracking-widest">{order.address.pincode}</span><br />
            {order.address.phone}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
          <div className="border border-black p-1.5">
            <div className="uppercase text-[#6B7280]">Weight</div>
            <div className="text-[13px] font-bold">0.65 kg</div>
          </div>
          <div className="border border-black p-1.5">
            <div className="uppercase text-[#6B7280]">Dimensions</div>
            <div className="text-[13px] font-bold">22×15×4 cm</div>
          </div>
        </div>

        <div className="mt-3 border-2 border-black p-3 text-center">
          <div className="text-[9px] uppercase tracking-widest">AWB</div>
          <div className="mt-0.5 font-mono text-[18px] font-bold tracking-wider">{awb}</div>
          <div className="mt-2 flex h-14 items-end justify-center gap-[2px]" aria-hidden>
            {Array.from({ length: 60 }).map((_, i) => (
              <div key={i} className="bg-black" style={{ width: (i * 7) % 3 === 0 ? 3 : 1, height: (i * 11) % 4 === 0 ? "100%" : "80%" }} />
            ))}
          </div>
          <div className="mt-1 font-mono text-[10px] tracking-widest">{awb}</div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
          <div>
            <div className="uppercase text-[#6B7280]">Order</div>
            <div className="font-mono text-[12px] font-semibold">{order.id}</div>
          </div>
          <div className="text-right">
            <div className="uppercase text-[#6B7280]">Date</div>
            <div className="text-[12px] font-semibold">{order.date}</div>
          </div>
        </div>

        <div className="mt-3 border-t border-black pt-2 text-[9px] leading-snug">
          <div className="uppercase text-[#6B7280]">From</div>
          BookAdmin Bookstore Pvt. Ltd. · Warehouse #1<br />
          12 Rosewood Complex, Andheri West, Mumbai 400058<br />
          GSTIN 27AABCB1234C1Z5
        </div>

        <div className="mt-4 flex justify-end print:hidden">
          <button onClick={() => window.print()} className="rounded-md bg-[#111827] px-3 py-1.5 text-[11px] font-medium text-white">Print label</button>
        </div>
      </div>
    </div>
  );
}
