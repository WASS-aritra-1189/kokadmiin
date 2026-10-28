import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { customersService } from "@/services/customers.service";
import { ordersService } from "@/services/orders.service";
import { bunchOrderService } from "@/services/bunch.service";
import { transactionsService } from "@/services/transactions.service";

export const Route = createFileRoute("/_admin/customers/minimal")({
  component: MinimalCustomersPage,
});

function MinimalCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await customersService.getAll({ search, limit: 20 });
      setCustomers(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  const openModal = async (customer, type) => {
    setModal({ type, customer, data: [], loading: true });
    
    try {
      let data = [];
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
      setModal(prev => ({ ...prev, data, loading: false }));
    } catch {
      setModal(prev => ({ ...prev, loading: false }));
    }
  };

  const closeModal = () => setModal(null);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customers</h1>
      
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search customers..."
        className="w-full p-2 border rounded mb-4"
      />

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : customers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No customers found</div>
      ) : (
        <div className="border rounded overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium">{customer.name || customer.loginId}</div>
                    <div className="text-sm text-gray-500">{customer.email}</div>
                  </td>
                  <td className="p-3">{customer.loginId}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(customer, "orders")}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Orders
                      </button>
                      <button
                        onClick={() => openModal(customer, "bunch")}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                      >
                        Bunch
                      </button>
                      <button
                        onClick={() => openModal(customer, "transactions")}
                        className="px-3 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200"
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

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {modal.type === "orders" ? "Orders" : 
                 modal.type === "bunch" ? "Bunch Orders" : "Transactions"}
                {" for "}{modal.customer.name || modal.customer.loginId}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              {modal.loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : modal.data.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No data found</div>
              ) : (
                <div className="space-y-3">
                  {modal.data.map((item) => (
                    <div key={item.id} className="border rounded p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">{item.orderNumber}</div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          (item.status || item.orderStatus) === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          (item.status || item.orderStatus) === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status || item.orderStatus || 'PENDING'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Date</div>
                          <div>{new Date(item.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Total</div>
                          <div>₹{Number(item.totalAmount || item.amount).toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Payment</div>
                          <div className={item.paymentStatus === 'SUCCESS' ? 'text-green-600' : 
                                         item.paymentStatus === 'FAILED' ? 'text-red-600' : 
                                         'text-yellow-600'}>
                            {item.paymentStatus}
                          </div>
                        </div>
                        {modal.type === "bunch" && (
                          <div>
                            <div className="text-gray-500">Bunch</div>
                            <div>{item.bunch?.name || '—'}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t text-sm text-gray-500">
              Showing {modal.data.length} items
            </div>
          </div>
        </div>
      )}
    </div>
  );
}