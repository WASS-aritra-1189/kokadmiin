import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { X, Search, Loader2, ShoppingBag, Package, CreditCard } from "lucide-react";
import { customersService, type Customer } from "@/services/customers.service";
import { ordersService, type Order } from "@/services/orders.service";
import { bunchOrderService, type BunchOrder } from "@/services/bunch.service";
import { transactionsService, type Transaction } from "@/services/transactions.service";

export const Route = createFileRoute("/_admin/customers/popup")({
  component: PopupCustomersPage,
});

function PopupCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{
    type: "orders" | "bunch" | "transactions";
    customer: Customer;
    data: Order[] | BunchOrder[] | Transaction[];
    loading: boolean;
  } | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await customersService.getAll({ search, limit: 20 });
      setCustomers(res.data.data);
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const openModal = async (customer: Customer, type: "orders" | "bunch" | "transactions") => {
    setModal({ type, customer, data: [], loading: true });
    
    try {
      let data: Order[] | BunchOrder[] | Transaction[] = [];
      
      if (type === "orders") {
        const res = await ordersService.getAll({ accountId: customer.accountId, limit: 50 });
        data = Array.isArray(res) ? res : [];
      } else if (type === "bunch") {
        const res = await bunchOrderService.getAll({ accountId: customer.accountId, limit: 50 });
        data = Array.isArray(res) ? res : [];
      } else if (type === "transactions") {
        const res = await transactionsService.findByUser(customer.accountId, { limit: 50 });
        data = Array.isArray(res) ? res : [];
      }
      
      setModal(prev => prev ? { ...prev, data, loading: false } : null);
    } catch {
      setModal(prev => prev ? { ...prev, loading: false } : null);
    }
  };

  const closeModal = () => setModal(null);

  return (
    <div className="p-6">
      <div className="text-sm font-medium text-gray-500">Customers</div>
      <h1 className="text-2xl font-semibold">All Customers</h1>
      
      <div className="mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="mt-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading customers...</span>
        </div>
      ) : customers.length === 0 ? (
        <div className="mt-8 text-center text-gray-500">No customers found</div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Phone</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{customer.name || customer.loginId}</div>
                    <div className="text-sm text-gray-500">{customer.email || "No email"}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">{customer.loginId}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      customer.status === "ACTIVE" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(customer, "orders")}
                        className="rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
                      >
                        Orders
                      </button>
                      <button
                        onClick={() => openModal(customer, "bunch")}
                        className="rounded-md bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-100"
                      >
                        Bunch
                      </button>
                      <button
                        onClick={() => openModal(customer, "transactions")}
                        className="rounded-md bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-100"
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
      )}

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
                    modal.data.map((item: Order) => (
                      <div key={item.id} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <div className="font-mono font-medium text-blue-600">{item.orderNumber}</div>
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                            item.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            item.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.status}
                          </span>
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
                    modal.data.map((item: BunchOrder) => (
                      <div key={item.id} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <div className="font-mono font-medium text-purple-600">{item.orderNumber}</div>
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                            item.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            item.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.orderStatus || 'PENDING'}
                          </span>
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
                    modal.data.map((item: Transaction) => (
                      <div key={item.id} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <div className="font-mono font-medium text-amber-600">{item.orderNumber}</div>
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                            item.paymentStatus === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                            item.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.paymentStatus}
                          </span>
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
            
            <div className="border-t border-gray-200 px-6 py-4 text-sm text-gray-500">
              Showing {modal.data.length} {modal.type === "orders" ? "order" : modal.type === "bunch" ? "bunch order" : "transaction"}{modal.data.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}