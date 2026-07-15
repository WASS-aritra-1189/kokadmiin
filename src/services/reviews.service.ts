import { api } from "@/lib/axios";

const wrap = (r: any) => r.data?.data ?? r.data;
const wrapData = (r: any) => r.data?.data ?? r.data;

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ReviewBook {
  id: string;
  title: string;
  isbn?: string;
  coverImage?: string | null;
  price?: string;
}

export interface Review {
  id: string;
  accountId: string;
  bookId: string;
  bookTitle?: string | null;
  book?: ReviewBook | null;
  rating: number;
  review: string | null;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsQuery {
  page?: number;
  limit?: number;
  bookId?: string;
  status?: ReviewStatus;
  accountId?: string;
}

export const reviewsService = {
  getAll: (params: ReviewsQuery = {}): Promise<{ data: Review[]; total: number; page: number; limit: number }> =>
    api.get("/rating-review", { params }).then(wrap),

  updateStatus: (id: string, status: ReviewStatus): Promise<Review> =>
    api.patch(`/rating-review/${id}/status`, { status }).then(wrapData),

  adminDelete: (id: string): Promise<void> =>
    api.delete(`/rating-review/${id}/admin`).then(wrap),
};
