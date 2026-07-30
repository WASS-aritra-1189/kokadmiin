import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { booksService, type BookItem, type BooksQuery, type CreateBookPayload } from "@/services/books.service";

interface BooksState {
  items: BookItem[];
  total: number;
  page: number;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: BooksState = {
  items: [],
  total: 0,
  page: 1,
  loading: false,
  saving: false,
  error: null,
};

export const fetchBooks = createAsyncThunk("books/fetchAll", async (params: BooksQuery, { rejectWithValue }) => {
  try { return await booksService.getAll(params); }
  catch (err: any) { return rejectWithValue(err.response?.data?.message ?? "Failed to fetch books"); }
});

export const createBook = createAsyncThunk("books/create", async (data: CreateBookPayload, { rejectWithValue }) => {
  try { return await booksService.create(data); }
  catch (err: any) { return rejectWithValue(err.response?.data?.message ?? "Failed to create book"); }
});

export const updateBook = createAsyncThunk("books/update", async ({ id, data }: { id: string; data: Partial<CreateBookPayload> }, { rejectWithValue }) => {
  try { return await booksService.update(id, data); }
  catch (err: any) { return rejectWithValue(err.response?.data?.message ?? "Failed to update book"); }
});

export const deleteBook = createAsyncThunk("books/delete", async (id: string, { rejectWithValue }) => {
  try { await booksService.delete(id); return id; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message ?? "Failed to delete book"); }
});

export const deleteMultipleBooks = createAsyncThunk("books/deleteMultiple", async (ids: string[], { rejectWithValue }) => {
  try {
    await Promise.all(ids.map(id => booksService.delete(id)));
    return ids;
  } catch (err: any) { return rejectWithValue(err.response?.data?.message ?? "Failed to delete books"); }
});

const booksSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Books
      .addCase(fetchBooks.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data; // Fixed: data is already the array
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.error = null;
      })
      .addCase(fetchBooks.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload as string; 
      })

      // Create Book
      .addCase(createBook.pending, (state) => { 
        state.saving = true; 
        state.error = null; 
      })
      .addCase(createBook.fulfilled, (state, action) => {
        state.saving = false;
        state.items = [action.payload, ...state.items]; // Add new book to list
        state.error = null;
      })
      .addCase(createBook.rejected, (state, action) => { 
        state.saving = false; 
        state.error = action.payload as string; 
      })

      // Update Book
      .addCase(updateBook.pending, (state) => { 
        state.saving = true; 
        state.error = null; 
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        state.saving = false;
        const idx = state.items.findIndex((b) => b.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        state.error = null;
      })
      .addCase(updateBook.rejected, (state, action) => { 
        state.saving = false; 
        state.error = action.payload as string; 
      })

      // Delete Single Book
      .addCase(deleteBook.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.filter((b) => b.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })

      // Delete Multiple Books
      .addCase(deleteMultipleBooks.pending, (state) => { 
        state.saving = true; 
        state.error = null; 
      })
      .addCase(deleteMultipleBooks.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.filter((b) => !action.payload.includes(b.id));
        state.error = null;
      })
      .addCase(deleteMultipleBooks.rejected, (state, action) => { 
        state.saving = false; 
        state.error = action.payload as string; 
      });
  },
});

export const { clearError } = booksSlice.actions;
export default booksSlice.reducer;