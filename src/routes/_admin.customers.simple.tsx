import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { X, Search, Loader2, ShoppingBag, Package, CreditCard } from "lucide-react";
import { customersService, type Customer } from "@/services/customers.service";
import { ordersService, type Order } from "@/services/orders.service";
import { bunchOrderService, type BunchOrder } from "@/services/bunch.service";
import { transactionsService, type Transaction } from "@/services/transactions.service";

export const Route = createFileRoute("/_admin/customers/simple")({
  component: SimpleCustomersPage,
});

function SimpleCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "orders" | "bunch" | "transactions">("list");
  const [data, setData] = useState<Order[] | BunchOrder[] | Transaction[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

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

  const handleViewData = async (customer: Customer, type: "orders" | "bunch" | "transactions") => {
    setSelectedCustomer(customer);
    setViewMode(type);
    setDataLoading(true);
    
    try {
      if (type === "orders") {
        const res = await ordersService.getAll({ accountId: customer.accountId, limit: 50 });
        setData(Array.isArray(res) ? res : []);
      } else if (type === "bunch") {
        const res = await bunchOrderService.getAll({ accountId: customer.accountId, limit: 50 });
        setData(Array.isArray(res) ? res : []);
      } else if (type === "transactions") {
        const res = await transactionsService.findByUser(customer.accountId, { limit: 50 });
        setData(Array.isArray(res) ? res : []);
      }
    } catch {
      // Handle error
    } finally {
      setDataLoading(false);
    }
  };

  const backToList = () => {
    setViewMode("list");
    setSelectedCustomer(null);
    setData([]);
  };

  return (
    <div className="p-6">
      <div className="text-sm font-medium text-gray-500">Customers</div>
      <h1 className="text-2xl font-semibold">All Customers</h1>
      
      {viewMode === "list" ? (
        <>
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
                            onClick={() => handleViewData(customer, "orders")}
                            className="flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
                          >
                            <ShoppingBag className="h-4 w-4" />
                            Orders
                          </button>
                          <button
                            onClick={() => handleViewData(customer, "bunch")}
                            className="flex items-center gap-1 rounded-md bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-100"
                          >
                            <Package className="h-4 w-4" />
                            Bunch
                          </button>
                          <button
                            onClick={() => handleViewData(customer, "transactions")}
                            className="flex items-center gap-1 rounded-md bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-100"
                          >
                            <CreditCard className="h-4 w-4" />
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
        </>
      ) : (
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <button
                onClick={backToList}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                ← Back to customers
              </button>
              <h2 className="mt-2 text-xl font-semibold">
                {viewMode === "orders" && "Orders"}
                {viewMode === "bunch" && "Bunch Orders"}
                {viewMode === "transactions" && "Transactions"}
                {" for "}
                <span className="text-blue-600">{selectedCustomer?.name || selectedCustomer?.loginId}</span>
              </h2>
            </div>
            <button
              onClick={backToList}
              className="rounded-lg p-2 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white">
            {dataLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading data...</span>
              </div>
            ) : data.length === 0 ? (
              <div className="py-16 text-center text-gray-500">No data found</div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto p-4">
                {viewMode === "orders" && (
                  <div className="space-y-3">
                    {(data as Order[]).map((order) => (
                      <div key={order.id} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <div className="font-mono font-medium text-blue-600">{order.orderNumber}</div>
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Date</div>
                            <div className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Total</div>
                            <div className="font-medium">₹{Number(order.totalAmount).toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Payment</div>
                            <div className={`font-medium ${
                              order.paymentStatus === 'SUCCESS' ? 'text-green-600' :
                              order.paymentStatus === 'FAILED' ? 'text-red-600' :
                              'text-yellow-600'
                            }`}>
                              {order.paymentStatus}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === "bunch" && (
                  <div className="space-y-3">
                    {(data as BunchOrder[]).map((order) => (
                      <div key={order.id} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <div className="font-mono font-medium text-purple-600">{order.orderNumber}</div>
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                            order.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            order.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.orderStatus || 'PENDING'}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Bunch</div>
                            <div className="font-medium">{order.bunch?.name || '—'}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Date</div>
                            <div className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Total</div>
                            <div className="font-medium">₹{Number(order.totalAmount).toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === "transactions" && (
                  <div className="space-y-3">
                    {(data as Transaction[]).map((transaction) => (
                      <div key={transaction.id} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <div className="font-mono font-medium text-amber-600">{transaction.orderNumber}</div>
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                            transaction.paymentStatus === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                            transaction.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {transaction.paymentStatus}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Date</div>
                            <div className="font-medium">{new Date(transaction.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Method</div>
                            <div className="font-medium">{transaction.paymentMethod}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Amount</div>
                            <div className="font-medium">₹{Number(transaction.amount).toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}