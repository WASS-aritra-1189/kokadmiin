import { useEffect, useState } from "react";

export type Role = "admin" | "manager" | "warehouse" | "support";

export type StaffUser = {
  name: string;
  email: string;
  role: Role;
};

const KEY = "bookadmin.user";

function read(): StaffUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StaffUser) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(read());
    setReady(true);
    const onStorage = () => setUser(read());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = (u: StaffUser) => {
    window.localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
  };
  const logout = () => {
    window.localStorage.removeItem(KEY);
    setUser(null);
  };

  return { user, ready, login, logout };
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrator",
  manager: "Store Manager",
  warehouse: "Warehouse Staff",
  support: "Customer Support",
};
