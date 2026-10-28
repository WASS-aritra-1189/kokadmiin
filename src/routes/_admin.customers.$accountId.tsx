import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Loader2,
  User,
  ShoppingBag,
  Package,
  CreditCard,
  Heart,
  Tag,
  Search,
  ShoppingCart,
  MapPin,
} from "lucide-react";
import { customersService } from "@/services/customers.service";

export const Route = createFileRoute("/_admin/customers/$accountId")({
  component: CustomerProfilePage,
});

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white overflow-hidden">
      <div className="flex items-center gap-2 border-b border-[#F3F4F6] bg-[#FAFAF9] px-4 py-3">
        <Icon className="h-4 w-4 text-[#4F46E5]" />
        <h2 className="text-[13px] font-semibold text-[#111827]">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Badge({ value, green, red }: { value: string; green?: boolean; red?: boolean }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
      green ? "bg-[#DCFCE7] text-[#166534]" :
      red ? "bg-[#FEE2E2] text-[#991B1B]" :
      "bg-[#F3F4F6] text-[#4B5563]"
    }`}>
      {value}
    </span>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-[12px] text-[#9CA3AF] py-2">{text}</p>;
}

function CustomerProfilePage() {
  const { accountId } = Route.useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    customersService
      .getFullProfile(accountId)
      .then((res) => setData(res?.data ?? res))
      .catch(() => setError("Failed to load customer profile."))
      .finally(() => setLoading(false));
  }, [accountId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-[#6B7280]">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span className="text-[13px]">Loading profile…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <button onClick={() => navigate({ to: "/customers" })} className="flex items-center gap-1 text-[12px] text-[#4F46E5] hover:underline mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Customers
        </button>
        <p className="text-[13px] text-red-500">{error ?? "No data found."}</p>
      </div>
    );
  }

  const { profile, addresses, orders, bunchOrders, transactions, wishlist, couponsUsed, searchHistory, cart } = data;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <button onClick={() => navigate({ to: "/customers" })} className="flex items-center gap-1 text-[12px] text-[#4F46E5] hover:underline mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Customers
        </button>
        <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Customer Profile</div>
        <h1 className="text-[22px] font-semibold tracking-tight">{profile?.name ?? profile?.loginId ?? "—"}</h1>
        <p className="mt-0.5 text-[13px] text-[#6B7280]">Account ID: {accountId}</p>
      </div>

      {/* 1. Profile */}
      <Section icon={User} title="Profile Information">
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[12px] md:grid-cols-4">
          {[
            ["Login ID", profile?.loginId],
            ["Name", profile?.name],
            ["Email", profile?.email],
            ["Role", profile?.role],
            ["Status", profile?.status],
            ["Member Since", profile?.memberSince ? new Date(profile.memberSince).toLocaleDateString() : "—"],
            ["Location", profile?.location],
            ["Bio", profile?.bio],
          ].map(([label, val]) => (
            <div key={label as string}>
              <div className="text-[10px] text-[#9CA3AF] uppercase tracking-wide">{label}</div>
              <div className="font-medium text-[#111827] truncate">{val ?? "—"}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Addresses */}
      <Section icon={MapPin} title={`Saved Addresses (${addresses?.length ?? 0})`}>
        {!addresses?.length ? <Empty text="No saved addresses." /> : (
          <div className="grid gap-3 md:grid-cols-2">
            {addresses.map((a: any) => (
              <div key={a.id} className="rounded-md border border-[#E5E7EB] p-3 text-[12px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{a.name ?? "—"}</span>
                  {a.isDefault && <Badge value="Default" green />}
                </div>
                <div className="text-[#4B5563]">{[a.addressLine1, a.addressLine2, a.city, a.state, a.pincode, a.country].filter(Boolean).join(", ")}</div>
                {a.phone && <div className="text-[#9CA3AF] mt-0.5">{a.phone}</div>}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* 2. Orders */}
      <Section icon={ShoppingBag} title={`Orders (${orders?.stats?.total ?? 0})`}>
        {orders?.stats && (
          <div className="mb-3 flex gap-4 text-[12px]">
            <div><span className="text-[#9CA3AF]">Total Spent: </span><span className="font-semibold">₹{Number(orders.stats.totalSpent).toFixed(2)}</span></div>
            {Object.entries(orders.stats.byStatus ?? {}).map(([s, c]) => (
              <div key={s}><span className="text-[#9CA3AF]">{s}: </span><span className="font-medium">{c as number}</span></div>
            ))}
          </div>
        )}
        {!orders?.list?.length ? <Empty text="No orders found." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="text-[10px] uppercase tracking-wider text-[#6B7280] bg-[#FAFAF9]">
                <tr>
                  {["Order #", "Status", "Payment", "Total", "Paid", "Coupon", "Items", "Date"].map(h => (
                    <th key={h} className="px-2 py-1.5 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.list.map((o: any) => (
                  <tr key={o.id} className="border-t border-[#F3F4F6]">
                    <td className="px-2 py-1.5 font-mono text-[#4F46E5]">{o.orderNumber}</td>
                    <td className="px-2 py-1.5"><Badge value={o.status} green={o.status === "DELIVERED"} red={o.status === "CANCELLED"} /></td>
                    <td className="px-2 py-1.5"><Badge value={o.paymentStatus} green={o.paymentStatus === "SUCCESS"} red={o.paymentStatus === "FAILED"} /></td>
                    <td className="px-2 py-1.5">₹{Number(o.totalAmount).toFixed(2)}</td>
                    <td className="px-2 py-1.5">₹{Number(o.paidAmount).toFixed(2)}</td>
                    <td className="px-2 py-1.5">{o.couponCode ?? "—"}</td>
                    <td className="px-2 py-1.5">{o.items?.length ?? 0}</td>
                    <td className="px-2 py-1.5">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* 3. Bunch Orders */}
      <Section icon={Package} title={`Bunch Orders (${bunchOrders?.stats?.total ?? 0})`}>
        {bunchOrders?.stats && (
          <div className="mb-3 text-[12px]">
            <span className="text-[#9CA3AF]">Total Spent: </span>
            <span className="font-semibold">₹{Number(bunchOrders.stats.totalSpent).toFixed(2)}</span>
          </div>
        )}
        {!bunchOrders?.list?.length ? <Empty text="No bunch orders found." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="text-[10px] uppercase tracking-wider text-[#6B7280] bg-[#FAFAF9]">
                <tr>
                  {["Order #", "Bunch", "Status", "Payment", "Total", "Date"].map(h => (
                    <th key={h} className="px-2 py-1.5 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bunchOrders.list.map((bo: any) => (
                  <tr key={bo.id} className="border-t border-[#F3F4F6]">
                    <td className="px-2 py-1.5 font-mono text-[#7C3AED]">{bo.orderNumber}</td>
                    <td className="px-2 py-1.5">{bo.bunch?.name ?? "—"}</td>
                    <td className="px-2 py-1.5"><Badge value={bo.orderStatus ?? "PENDING"} green={bo.orderStatus === "DELIVERED"} red={bo.orderStatus === "CANCELLED"} /></td>
                    <td className="px-2 py-1.5"><Badge value={bo.paymentStatus} green={bo.paymentStatus === "SUCCESS"} red={bo.paymentStatus === "FAILED"} /></td>
                    <td className="px-2 py-1.5">₹{Number(bo.totalAmount).toFixed(2)}</td>
                    <td className="px-2 py-1.5">{new Date(bo.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* 4. Transactions */}
      <Section icon={CreditCard} title={`Transactions (${transactions?.length ?? 0})`}>
        {!transactions?.length ? <Empty text="No transactions found." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="text-[10px] uppercase tracking-wider text-[#6B7280] bg-[#FAFAF9]">
                <tr>
                  {["Order #", "Txn ID", "Method", "Order Status", "Payment", "Total", "Paid", "Razorpay ID", "Date"].map(h => (
                    <th key={h} className="px-2 py-1.5 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((t: any) => (
                  <tr key={t.id} className="border-t border-[#F3F4F6]">
                    <td className="px-2 py-1.5 font-mono text-[#4F46E5]">{t.orderNumber ?? "—"}</td>
                    <td className="px-2 py-1.5 font-mono text-[10px]">{t.transactionId ?? "—"}</td>
                    <td className="px-2 py-1.5">{t.paymentMethod ?? "—"}</td>
                    <td className="px-2 py-1.5"><Badge value={t.orderStatus} green={t.orderStatus === "DELIVERED"} red={t.orderStatus === "CANCELLED"} /></td>
                    <td className="px-2 py-1.5"><Badge value={t.paymentStatus} green={t.paymentStatus === "SUCCESS"} red={t.paymentStatus === "FAILED"} /></td>
                    <td className="px-2 py-1.5">₹{Number(t.totalAmount).toFixed(2)}</td>
                    <td className="px-2 py-1.5">₹{Number(t.paidAmount).toFixed(2)}</td>
                    <td className="px-2 py-1.5 font-mono text-[10px]">{t.razorpayPaymentId ?? "—"}</td>
                    <td className="px-2 py-1.5">{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* 5. Wishlist */}
      <Section icon={Heart} title={`Wishlist (${wishlist?.length ?? 0} items)`}>
        {!wishlist?.length ? <Empty text="No wishlist items." /> : (
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((item: any) => (
              <div key={item.bookId + item.wishlistId} className="rounded-md border border-[#E5E7EB] p-3 text-[12px]">
                <div className="font-medium truncate">{item.bookTitle ?? item.bookId}</div>
                <div className="text-[10px] text-[#9CA3AF] mt-0.5">ISBN: {item.bookIsbn ?? "—"} · ₹{item.bookPrice ?? "—"}</div>
                <div className="text-[10px] text-[#9CA3AF]">List: {item.wishlistName}</div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* 6. Coupons Used */}
      <Section icon={Tag} title={`Coupons Used (${couponsUsed?.length ?? 0})`}>
        {!couponsUsed?.length ? <Empty text="No coupons used." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="text-[10px] uppercase tracking-wider text-[#6B7280] bg-[#FAFAF9]">
                <tr>
                  {["Code", "Description", "Discount Applied", "Order ID", "Used At"].map(h => (
                    <th key={h} className="px-2 py-1.5 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {couponsUsed.map((c: any) => (
                  <tr key={c.couponId + c.usedAt} className="border-t border-[#F3F4F6]">
                    <td className="px-2 py-1.5 font-mono font-medium text-[#4F46E5]">{c.code ?? "—"}</td>
                    <td className="px-2 py-1.5 text-[#4B5563]">{c.description ?? "—"}</td>
                    <td className="px-2 py-1.5 text-green-600 font-medium">₹{Number(c.discountApplied).toFixed(2)}</td>
                    <td className="px-2 py-1.5 font-mono text-[10px]">{c.orderId ?? "—"}</td>
                    <td className="px-2 py-1.5">{new Date(c.usedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* 7. Search History */}
      <Section icon={Search} title={`Search History (${searchHistory?.length ?? 0})`}>
        {!searchHistory?.length ? (
          <p className="text-[12px] text-[#9CA3AF] py-2">
            No search history found. Searches are only captured if the user was signed in and the request was logged by the server.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((s: any, i: number) => (
              <span key={i} className="rounded-full bg-[#EEF2FF] px-3 py-1 text-[11px] text-[#4F46E5]" title={new Date(s.searchedAt).toLocaleString()}>
                {s.query}
              </span>
            ))}
          </div>
        )}
      </Section>

      {/* 8. Cart */}
      <Section icon={ShoppingCart} title={`Cart (${cart?.itemCount ?? 0} items)`}>
        {!cart?.items?.length ? <Empty text="Cart is empty." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="text-[10px] uppercase tracking-wider text-[#6B7280] bg-[#FAFAF9]">
                <tr>
                  {["Book", "ISBN", "Qty", "Price", "MRP", "Currency"].map(h => (
                    <th key={h} className="px-2 py-1.5 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cart.items.map((ci: any) => (
                  <tr key={ci.id} className="border-t border-[#F3F4F6]">
                    <td className="px-2 py-1.5 font-medium">{ci.bookTitle ?? ci.bookId}</td>
                    <td className="px-2 py-1.5 font-mono text-[10px]">{ci.isbn ?? "—"}</td>
                    <td className="px-2 py-1.5">{ci.quantity}</td>
                    <td className="px-2 py-1.5">₹{Number(ci.price).toFixed(2)}</td>
                    <td className="px-2 py-1.5">₹{Number(ci.mrp).toFixed(2)}</td>
                    <td className="px-2 py-1.5">{ci.currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}
