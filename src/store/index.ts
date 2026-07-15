import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import authReducer, { hydrateAuth } from "./slices/authSlice";
import booksReducer from "./slices/booksSlice";
import ordersReducer from "./slices/ordersSlice";

export function makeStore() {
  const s = configureStore({
    reducer: {
      auth: authReducer,
      books: booksReducer,
      orders: ordersReducer,
    },
  });
  if (typeof window !== "undefined") s.dispatch(hydrateAuth());
  return s;
}

// Client-side singleton — created once in the browser, never on the server
export const store = typeof window !== "undefined" ? makeStore() : (null as any);

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T) => useSelector(selector);
