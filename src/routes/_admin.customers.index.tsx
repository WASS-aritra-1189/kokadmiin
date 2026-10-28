import { toast } from "sonner";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { X, Search, Loader2, ArrowRight } from "lucide-react";
import { customersService, type Customer } from "@/services/customers.service";
import { ordersService, type Order } from "@/services/orders.service";
import { bunchOrderService, type BunchOrder } from "@/services/bunch.service";
import { transactionsService, type Transaction } from "@/services/transactions.service";

export const Route = createFileRoute("/_admin/customers/")({
  component: CustomersPage,
});

function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState<{
    type: 'orders' | 'bunch' | 'transactions';
    customer: Customer;
    data: Order[] | BunchOrder[] | Transaction[];
    loading: boolean;
  } | null>(null);

  const limit = 20;

  useEffect(() => {
    fetchCustomers();
  }, [search, page]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await customersService.getAll({ search, page, limit });
      setCustomers(res.data.data);
      setTotal(res.data.total);
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const openModal = async (customer: Customer, type: 'orders' | 'bunch' | 'transactions') => {
    setModal({ type, customer, data: [], loading: true });
    
    try {
      let data: Order[] | BunchOrder[] | Transaction[] = [];
      
      if (type === 'orders') {
        const res = await ordersService.getAll({ accountId: customer.accountId, limit: 50 });
        // Try different response structures
        if (Array.isArray(res)) {
          data = res;
        } else if (Array.isArray(res?.data)) {
          data = res.data;
        } else if (Array.isArray(res?.data?.data)) {
          data = res.data.data;
        }
      } else if (type === 'bunch') {
        const res = await bunchOrderService.getAll({ accountId: customer.accountId, limit: 50 });
        // Try different response structures
        if (Array.isArray(res)) {
          data = res;
        } else if (Array.isArray(res?.data)) {
          data = res.data;
        } else if (Array.isArray(res?.data?.data)) {
          data = res.data.data;
        }
      } else if (type === 'transactions') {
        const res = await transactionsService.findByUser(customer.accountId, { limit: 50 });
        // Try different response structures
        if (Array.isArray(res)) {
          data = res;
        } else if (Array.isArray(res?.data)) {
          data = res.data;
        } else if (Array.isArray(res?.data?.data)) {
          data = res.data.data;
        }
      }
      
      setModal(prev => prev ? { ...prev, data, loading: false } : null);
    } catch (error) {
      setModal(prev => prev ? { ...prev, loading: false } : null);
    }
  };

  const closeModal = () => setModal(null);
  const navigate = useNavigate();

  const goToFullPage = (type: 'orders' | 'bunch' | 'transactions', accountId: string) => {
    closeModal();
    if (type === 'orders') navigate({ to: '/orders', search: { accountId } });
    else if (type === 'bunch') navigate({ to: '/bunch/orders', search: { accountId } });
    else navigate({ to: '/payments/transactions', search: { accountId } });
  };

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Customers</div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">All Customers</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">{total} customers</p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#F3F4F6] px-3 py-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search name or email…"
              className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[12px] outline-none focus:border-[#4F46E5]"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-[#6B7280]">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-[13px]">Loading customers…</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-[#9CA3AF] text-[13px]">No customers found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
                  <tr className="border-b border-[#E5E7EB] bg-[#FAFAF9]">
                    <th className="px-3 py-2 text-left">Customer</th>
                    <th className="px-3 py-2 text-left">Phone / Login</th>
                    <th className="px-3 py-2 text-left">Total Orders</th>
                    <th className="px-3 py-2 text-left">Default Address</th>
                    <th className="px-3 py-2 text-left">Gender</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Joined</th>
                    <th className="px-3 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAF9]"
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] text-[10px] font-semibold text-[#4F46E5]">
                            {(customer.name || customer.loginId).split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{customer.name || "—"}</div>
                            <div className="text-[10px] text-[#6B7280]">{customer.email || customer.loginId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-[#4B5563]">{customer.loginId}</td>
                      <td className="px-3 py-2 text-center">
                        <span className="inline-flex items-center justify-center rounded-full bg-[#EEF2FF] px-2.5 py-0.5 text-[10px] font-medium text-[#4F46E5]">
                          {customer.totalOrders || 0}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-[#4B5563] max-w-[150px] truncate" title={customer.defaultAddress ? `${customer.defaultAddress.addressLine1 || ''} ${customer.defaultAddress.city || ''}` : "No address"}>
                        {customer.defaultAddress ? (
                          <div className="truncate">
                            <div className="text-[10px] font-medium">{customer.defaultAddress.city || "—"}</div>
                            <div className="text-[9px] text-[#9CA3AF] truncate">{customer.defaultAddress.addressLine1 || ""}</div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#9CA3AF]">No address</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-[#4B5563] capitalize">{customer.gender || "—"}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          customer.status === "ACTIVE" ? "bg-[#DCFCE7] text-[#166534]" :
                          customer.status === "INACTIVE" ? "bg-[#F3F4F6] text-[#4B5563]" :
                          customer.status === "SUSPENDED" ? "bg-[#FEE2E2] text-[#991B1B]" :
                          customer.status === "BLOCKED" ? "bg-[#FEE2E2] text-[#991B1B]" :
                          "bg-[#F3F4F6] text-[#4B5563]"
                        }`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-[#4B5563]">{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "—"}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <button
                            onClick={() => navigate({ to: '/customers/$accountId', params: { accountId: customer.accountId } })}
                            className="flex items-center gap-1 rounded-md bg-[#F0FDF4] px-2 py-1 text-[10px] font-medium text-[#166534] hover:bg-[#DCFCE7] transition-colors"
                            title="View Full Profile"
                          >
                            Profile
                          </button>
                          <button
                            onClick={() => openModal(customer, "orders")}
                            className="flex items-center gap-1 rounded-md bg-[#EEF2FF] px-2 py-1 text-[10px] font-medium text-[#4F46E5] hover:bg-[#E0E7FF] transition-colors"
                            title="View Normal Orders"
                          >
                            Orders
                          </button>
                          <button
                            onClick={() => openModal(customer, "bunch")}
                            className="flex items-center gap-1 rounded-md bg-[#F0F9FF] px-2 py-1 text-[10px] font-medium text-[#0369A1] hover:bg-[#E0F2FE] transition-colors"
                            title="View Bunch Orders"
                          >
                            Bunch
                          </button>
                          <button
                            onClick={() => openModal(customer, "transactions")}
                            className="flex items-center gap-1 rounded-md bg-[#FEF3C7] px-2 py-1 text-[10px] font-medium text-[#92400E] hover:bg-[#FDE68A] transition-colors"
                            title="View Transaction History"
                          >
                            Transactions
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#F3F4F6] px-3 py-2 text-[11px] text-[#6B7280]">
                <div>
                  Showing <span className="font-medium text-[#111827]">{((page - 1) * limit) + 1}</span> to <span className="font-medium text-[#111827]">{Math.min(page * limit, total)}</span> of <span className="font-medium text-[#111827]">{total}</span> customers
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="h-7 rounded px-2 text-[11px] border border-[#E5E7EB] disabled:opacity-40 hover:bg-[#F3F4F6]"
                  >
                    Prev
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`h-7 w-7 rounded text-[11px] font-medium ${
                            page === pageNum
                              ? 'bg-[#4F46E5] text-white'
                              : 'border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {totalPages > 5 && page < totalPages - 2 && (
                      <span className="px-1 text-[#9CA3AF]">…</span>
                    )}
                    
                    {totalPages > 5 && page < totalPages - 2 && (
                      <button
                        onClick={() => setPage(totalPages)}
                        className={`h-7 w-7 rounded text-[11px] font-medium ${
                          page === totalPages
                            ? 'bg-[#4F46E5] text-white'
                            : 'border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6]'
                        }`}
                      >
                        {totalPages}
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="h-7 rounded px-2 text-[11px] border border-[#E5E7EB] disabled:opacity-40 hover:bg-[#F3F4F6]"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 flex h-[80vh] w-full max-w-4xl flex-col rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {modal.type === "orders" && "Orders"}
                  {modal.type === "bunch" && "Bunch Orders"}
                  {modal.type === "transactions" && "Transactions"}
                  {" for "}
                  <span className="text-blue-600">{modal.customer.name || modal.customer.loginId}</span>
                </h2>
                <p className="text-sm text-gray-500">Customer ID: {modal.customer.accountId}</p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {modal.loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600">Loading data...</span>
                </div>
              ) : modal.data.length === 0 ? (
                <div className="py-16 text-center text-gray-500">No data found</div>
              ) : (
                <div className="space-y-4">
                  {modal.type === "orders" && (
                    (modal.data as Order[]).map((item) => (
                      <div key={item.id} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <div className="font-mono font-medium text-blue-600">{item.orderNumber}</div>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                              item.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                              item.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.status}
                            </span>
                            <button
                              onClick={() => goToFullPage('orders', modal.customer.accountId)}
                              className="flex items-center gap-1 rounded-md bg-[#EEF2FF] px-2 py-1 text-[10px] font-medium text-[#4F46E5] hover:bg-[#E0E7FF] transition-colors"
                            >
                              See more <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                          <div>
                            <div className="text-gray-500">Date</div>
                            <div className="font-medium">{new Date(item.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Total</div>
                            <div className="font-medium">₹{Number(item.totalAmount).toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Payment</div>
                            <div className={`font-medium ${
                              item.paymentStatus === 'SUCCESS' ? 'text-green-600' :
                              item.paymentStatus === 'FAILED' ? 'text-red-600' :
                              'text-yellow-600'
                            }`}>
                              {item.paymentStatus}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Items</div>
                            <div className="font-medium">{item.items?.length || 0}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {modal.type === "bunch" && (
                    (modal.data as BunchOrder[]).map((item) => (
                      <div key={item.id} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <div className="font-mono font-medium text-purple-600">{item.orderNumber}</div>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                              item.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                              item.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.orderStatus || 'PENDING'}
                            </span>
                            <button
                              onClick={() => goToFullPage('bunch', modal.customer.accountId)}
                              className="flex items-center gap-1 rounded-md bg-[#F5F3FF] px-2 py-1 text-[10px] font-medium text-[#7C3AED] hover:bg-[#EDE9FE] transition-colors"
                            >
                              See more <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                          <div>
                            <div className="text-gray-500">Bunch</div>
                            <div className="font-medium">{item.bunch?.name || '—'}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Date</div>
                            <div className="font-medium">{new Date(item.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Total</div>
                            <div className="font-medium">₹{Number(item.totalAmount).toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Payment</div>
                            <div className={`font-medium ${
                              item.paymentStatus === 'SUCCESS' ? 'text-green-600' :
                              item.paymentStatus === 'FAILED' ? 'text-red-600' :
                              'text-yellow-600'
                            }`}>
                              {item.paymentStatus}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {modal.type === "transactions" && (
                    (modal.data as Transaction[]).map((item) => (
                      <div key={item.id} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <div className="font-mono font-medium text-amber-600">{item.orderNumber}</div>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                              item.paymentStatus === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                              item.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.paymentStatus}
                            </span>
                            <button
                              onClick={() => goToFullPage('transactions', modal.customer.accountId)}
                              className="flex items-center gap-1 rounded-md bg-[#FFFBEB] px-2 py-1 text-[10px] font-medium text-[#92400E] hover:bg-[#FEF3C7] transition-colors"
                            >
                              See more <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                          <div>
                            <div className="text-gray-500">Date</div>
                            <div className="font-medium">{new Date(item.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Method</div>
                            <div className="font-medium">{item.paymentMethod}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Amount</div>
                            <div className="font-medium">₹{Number(item.amount).toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Order Status</div>
                            <div className={`font-medium ${
                              item.orderStatus === 'DELIVERED' ? 'text-green-600' :
                              item.orderStatus === 'CANCELLED' ? 'text-red-600' :
                              'text-yellow-600'
                            }`}>
                              {item.orderStatus}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 text-sm text-gray-500">
              <span>Showing {modal.data.length} {modal.type === "orders" ? "order" : modal.type === "bunch" ? "bunch order" : "transaction"}{modal.data.length !== 1 ? "s" : ""}</span>
              <button
                onClick={() => goToFullPage(modal.type, modal.customer.accountId)}
                className="flex items-center gap-1.5 rounded-md bg-[#111827] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#374151] transition-colors"
              >
                View all for this customer <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}