import { formatPrice } from "./currency";

const SELLER = {
  name: "Katha-O-Kahini (Book Sellers) Pvt. Ltd.",
  brand: "KOK Books",
  address: "100 A, Kavi Sukanta Sarani, Kolkata - 700 085",
  email: "support@kokbooks.com",
  phone: "033 4180 2100",
  website: "kokbooks.com",
};

// Page geometry (A4, mm)
const PW = 210;
const ML = 12;
const MR = 12;
const COL = PW - ML - MR; // 186 mm usable

export async function createOrderPdf(order: any, logo?: string) {
  const [{ jsPDF }, { applyPlugin }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  applyPlugin(jsPDF);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const paintedPages = new Set([1]);

  const cur = (v: unknown) =>
    formatPrice(Number(v ?? 0), order.currency || "INR").replace("₹", "Rs. ");

  const addr = (a: any): string =>
    [
      a?.fullName,
      a?.addressLine1,
      a?.addressLine2,
      [a?.city, a?.state, a?.pincode].filter(Boolean).join(", "),
      a?.country,
      a?.phone ? `Phone: ${a.phone}` : "",
    ]
      .filter(Boolean)
      .join("\n");

  const ship = order.shippingAddress ?? {};
  const orderRef = order.orderNumber || order.id;
  const orderDate = new Date(order.createdAt);
  const dateStr = Number.isNaN(orderDate.getTime())
    ? "—"
    : orderDate.toLocaleDateString("en-IN");

  doc.setProperties({
    title: `Order Copy ${orderRef}`,
    author: SELLER.name,
  });

  // ── Header ────────────────────────────────────────────────────────────────
  if (logo) {
    try {
      doc.addImage(logo, "JPEG", ML, 10, 36, 14, undefined, "FAST");
    } catch {}
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(SELLER.brand, PW - MR, 17, { align: "right" });
  doc.setFontSize(10);
  doc.text("ORDER COPY / PAYMENT SUMMARY", PW - MR, 24, { align: "right" });

  let y = 32;

  // Helper: draw a table and advance y
  const table = (head: any[], body: any[], opts: any = {}) => {
    (doc as any).autoTable({
      startY: y,
      head,
      body,
      theme: "grid",
      margin: { left: ML, right: MR, top: 14, bottom: 16 },
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        lineColor: [200, 200, 200],
        lineWidth: 0.2,
        overflow: "linebreak",
        font: "helvetica",
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [30, 30, 30],
        fontStyle: "bold",
        fontSize: 8,
      },
      willDrawPage: () => {
        const pg = doc.getCurrentPageInfo().pageNumber;
        if (!paintedPages.has(pg)) {
          doc.setFillColor(255, 255, 255);
          doc.rect(0, 0, PW, 297, "F");
          paintedPages.add(pg);
        }
      },
      ...opts,
    });
    y = (doc as any).lastAutoTable.finalY + 3;
  };

  // ── Document details ──────────────────────────────────────────────────────
  table(
    [],
    [
      [
        `Order reference: ${orderRef}\nDate: ${dateStr}`,
        `Payment status: ${order.paymentStatus || "—"}\nTransaction ID: ${order.transactionId || "—"}`,
      ],
    ],
    {
      columnStyles: {
        0: { cellWidth: COL / 2 },
        1: { cellWidth: COL / 2 },
      },
    }
  );

  // ── Billed from / to ──────────────────────────────────────────────────────
  table(
    [["Billed From", "Billed To"]],
    [
      [
        `${SELLER.name}\n${SELLER.address}\n${SELLER.email} | ${SELLER.phone}`,
        addr(ship),
      ],
    ],
    {
      columnStyles: {
        0: { cellWidth: COL / 2 },
        1: { cellWidth: COL / 2 },
      },
    }
  );

  // ── Shipped to ────────────────────────────────────────────────────────────
  table(
    [["Shipped To"]],
    [[addr(ship)]],
    { columnStyles: { 0: { cellWidth: COL } } }
  );

  // ── Line items ────────────────────────────────────────────────────────────
  const items: any[] = order.items ?? [];
  const QTY_W = 14;
  const PRICE_W = 32;
  const TOTAL_W = 32;
  const TITLE_W = COL - QTY_W - PRICE_W - TOTAL_W; // 108

  table(
    [["Particulars", "Qty", "Unit Price (Rs.)", "Line Total (Rs.)"]],
    items.length
      ? items.map((item: any) => {
          const unitINR = Number(item.priceInINR ?? item.price ?? 0);
          const qty = Number(item.quantity ?? 1);
          const title = item.bookTitle || item.bookId || "Item";
          const isForeign =
            item.currency && item.currency.toUpperCase() !== "INR";
          const subtitle = isForeign
            ? `${item.currency?.toUpperCase()} ${Number(item.price).toFixed(2)} orig.`
            : item.bookId
            ? `ID: ${item.bookId}`
            : "";
          return [
            subtitle ? `${title}\n${subtitle}` : title,
            String(qty),
            `Rs. ${unitINR.toFixed(2)}`,
            `Rs. ${(unitINR * qty).toFixed(2)}`,
          ];
        })
      : [["No items", "", "", ""]],
    {
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [30, 30, 30],
        fontStyle: "bold",
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: TITLE_W },
        1: { cellWidth: QTY_W, halign: "center" },
        2: { cellWidth: PRICE_W, halign: "center" },
        3: { cellWidth: TOTAL_W, halign: "center" },
      },
    }
  );

  // ── Totals ────────────────────────────────────────────────────────────────
  const subtotal = Number(
    order.subtotal ??
      items.reduce(
        (s: number, i: any) =>
          s + Number(i.priceInINR ?? i.price ?? 0) * Number(i.quantity ?? 1),
        0
      )
  );
  const discount = Number(order.discount ?? 0);
  const shipping = Number(order.shippingCharge ?? 0);
  const tax = Number(order.tax ?? 0);
  const total = Number(order.totalAmount ?? subtotal + shipping + tax - discount);

  const LABEL_W = COL - 50;
  const VAL_W = 50;

  const totalsBody: any[] = [
    ["Subtotal", cur(subtotal)],
    ...(discount > 0
      ? [
          [
            `Discount${order.couponCode ? ` (${order.couponCode})` : ""}`,
            `- ${cur(discount)}`,
          ],
        ]
      : []),
    ["Shipping", cur(shipping)],
    ...(tax > 0 ? [["Tax", cur(tax)]] : []),
    ["Order Total", cur(total)],
  ];

  table([], totalsBody, {
    columnStyles: {
      0: { cellWidth: LABEL_W },
      1: { cellWidth: VAL_W, halign: "center" },
    },
    didParseCell: (data: any) => {
      if (data.row.index === totalsBody.length - 1) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fontSize = 9;
      }
    },
  });

  // ── Footer note ───────────────────────────────────────────────────────────
  table(
    [],
    [
      [
        `Order copy — not a tax invoice. Invoice number and tax details are not included.\nFor assistance: ${SELLER.email} | ${SELLER.phone} | ${SELLER.website}\nE. & O. E.`,
      ],
    ],
    {
      styles: { fontSize: 7, textColor: [100, 100, 100] },
      columnStyles: { 0: { cellWidth: COL } },
    }
  );

  // ── Page numbers ──────────────────────────────────────────────────────────
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${p} of ${pages}`, 105, 291, { align: "center" });
    doc.setTextColor(0, 0, 0);
  }

  return doc;
}

export async function downloadOrderInvoice(
  order: any,
  _variant: "invoice" | "receipt" = "invoice"
) {
  let logo: string | undefined;
  try {
    const res = await fetch("/koklogo.jpeg");
    if (res.ok) {
      const blob = await res.blob();
      logo = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch {}

  const doc = await createOrderPdf(order, logo);
  const ref = String(order.orderNumber || order.id).replace(
    /[^a-zA-Z0-9_-]/g,
    "_"
  );
  doc.save(`KOK-Order-${ref}.pdf`);
}

export async function downloadBunchOrderInvoice(bunchOrder: any) {
  // Fetch logo
  let logo: string | undefined;
  try {
    const res = await fetch("/koklogo.jpeg");
    if (res.ok) {
      const blob = await res.blob();
      logo = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch {}

  // Map bunch order fields to the shape createOrderPdf expects
  const books: any[] = bunchOrder.items ?? bunchOrder.bunch?.books ?? [];

  const mapped = {
    orderNumber: bunchOrder.orderNumber,
    id: bunchOrder.id,
    createdAt: bunchOrder.createdAt,
    paymentStatus: bunchOrder.paymentStatus,
    paymentMethod: bunchOrder.paymentMethod,
    transactionId: bunchOrder.transactionId ?? null,
    totalAmount: bunchOrder.totalAmount,
    paidAmount: bunchOrder.paidAmount,
    subtotal: bunchOrder.totalAmount,
    discount: 0,
    shippingCharge: 0,
    tax: 0,
    couponCode: null,
    shippingAddress: bunchOrder.shippingAddress ?? null,
    currency: "INR",
    // Line items: each book in the bunch
    items: books.length
      ? books.map((b: any) => ({
          bookTitle: b.bookTitle ?? b.title ?? b.name ?? "Book",
          bookId: b.bookId ?? b.id ?? null,
          quantity: b.quantity ?? 1,
          price: Number(b.price ?? b.offerPrice ?? 0),
          priceInINR: Number(b.price ?? b.offerPrice ?? 0),
        }))
      : [
          {
            bookTitle: bunchOrder.bunch?.name ?? "Bunch Order",
            quantity: 1,
            price: Number(bunchOrder.totalAmount ?? 0),
            priceInINR: Number(bunchOrder.totalAmount ?? 0),
          },
        ],
  };

  const doc = await createOrderPdf(mapped, logo);
  const ref = String(bunchOrder.orderNumber || bunchOrder.id).replace(/[^a-zA-Z0-9_-]/g, "_");
  doc.save(`KOK-BunchOrder-${ref}.pdf`);
}
