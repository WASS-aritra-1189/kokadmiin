import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ordersService, type Order, type OrderStatus, type OrdersQuery } from "@/services/orders.service";

interface OrdersState {
  items: Order[];
  total: number;
  page: number;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  items: [],
  total: 0,
  page: 1,
  loading: false,
  saving: false,
  error: null,
};

export const fetchOrders = createAsyncThunk("orders/fetchAll", async (params: OrdersQuery, { rejectWithValue }) => {
  try {
    return await ordersService.getAll(params) as { data: Order[]; total: number; page: number; limit: number };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message ?? "Failed to fetch orders");
  }
});

export const updateOrderStatus = createAsyncThunk(
  "orders/updateStatus",
  async ({ id, status, notes }: { id: string; status: OrderStatus; notes?: string }, { rejectWithValue }) => {
    try {
      return await ordersService.updateStatus(id, status, notes) as Order;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? "Failed to update order status");
    }
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateOrderStatus.pending, (state) => { state.saving = true; })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.saving = false;
        const idx = state.items.findIndex((o) => o.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = ordersSlice.actions;
export default ordersSlice.reducer;
