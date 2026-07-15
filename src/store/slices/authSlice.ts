import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { authService, type LoginPayload, type LoginResponse } from "@/services/auth.service";

export interface AuthUser {
  id: string;
  loginId: string;
  roles: string;
  status: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}

const TOKEN_KEY = "bookadmin.token";
const USER_KEY = "bookadmin.user";

function getStorage(key: string): string | null {
  try { return typeof window !== "undefined" ? localStorage.getItem(key) : null; } catch { return null; }
}

function setStorage(key: string, value: string) {
  try { if (typeof window !== "undefined") localStorage.setItem(key, value); } catch { /* noop */ }
}

function removeStorage(key: string) {
  try { if (typeof window !== "undefined") localStorage.removeItem(key); } catch { /* noop */ }
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk("auth/login", async (payload: LoginPayload, { rejectWithValue }) => {
  try {
    return await authService.login(payload);
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message ?? "Login failed");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      removeStorage(TOKEN_KEY);
      removeStorage(USER_KEY);
    },
    clearError(state) {
      state.error = null;
    },
    hydrateAuth(state) {
      const token = getStorage(TOKEN_KEY);
      const raw = getStorage(USER_KEY);
      if (token && raw) {
        try {
          state.user = JSON.parse(raw);
          state.accessToken = token;
        } catch { /* noop */ }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false;
        const { account, tokens } = action.payload.data;
        state.user = {
          id: account.id,
          loginId: account.loginId,
          roles: account.roles,
          status: account.status,
        };
        state.accessToken = tokens.accessToken;
        setStorage(TOKEN_KEY, tokens.accessToken);
        setStorage(USER_KEY, JSON.stringify({ id: account.id, loginId: account.loginId, roles: account.roles, status: account.status }));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;
