import { api } from "@/lib/axios";

export interface Customer {
  id: string;
  loginId: string;
  roles: string;
  status: string;
  createdAt: string;
  name: string;
  email: string;
  dateOfBirth?: string;
  gender?: string;
  profilePicture?: string;
  bio?: string;
  isActive: boolean;
  accountId: string;
}

export interface CustomersResponse {
  success: boolean;
  data: {
    data: Customer[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface CustomersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface WishlistBook {
  id: string;
  title: string;
  isbn: string;
  price: string;
  discountPrice: string;
  coverImage: string | null;
  status: string;
}

export interface WishlistItem {
  id: string;
  bookId: string;
  book: WishlistBook;
}

export interface Wishlist {
  id: string;
  name: string;
  isDefault: boolean;
  accountId: string;
  items: WishlistItem[];
}

export interface WishlistResponse {
  success: boolean;
  data: {
    data: Wishlist[];
    total: number;
    page: number;
    limit: number;
  };
}

export const wishlistService = {
  getByAccount: (accountId: string, page = 1, limit = 10) =>
    api
      .get<WishlistResponse>(`/wishlist/admin?page=${page}&limit=${limit}&accountId=${accountId}`)
      .then((r) => r.data),
};

export const customersService = {
  getAll: (query: CustomersQuery = {}) => {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.search) params.set("search", query.search);
    if (query.status) params.set("status", query.status);
    return api
      .get<CustomersResponse>(`/accounts/users?${params.toString()}`)
      .then((r) => r.data);
  },

  getById: (id: string) =>
    api.get(`/accounts/users/${id}`).then((r) => r.data),
};
