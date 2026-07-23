import { api } from "@/lib/axios";

export interface DropdownItem { id: string; name: string; }
export interface BookAuthor extends DropdownItem {}
export interface BookCategory extends DropdownItem {}
export interface BookLanguage { id: string; name: string; code: string; }
export interface BookGenre extends DropdownItem {}
export interface BookBoard extends DropdownItem {}
export interface BookClass extends DropdownItem { boardId: string; }
export interface BookSubject extends DropdownItem { classId: string; boardId: string; }

export interface BookItem {
  id: string;
  title: string;
  isbn: string;
  authorId: string | null;
  author: BookAuthor | null;
  productCategoryId: string | null;
  productCategory: BookCategory | null;
  boardId: string | null;
  board: BookBoard | null;
  classId: string | null;
  schoolClass: BookClass | null;
  subjectId: string | null;
  subject: BookSubject | null;
  genreId: string | null;
  genre: BookGenre | null;
  languageId: string | null;
  language: BookLanguage | null;
  description: string | null;
  publisher: string | null;
  publishedYear: string | null;
  pages: number | null;
  price: string;
  discountPrice: string | null;
  coverImage: string | null;
  insiderImages: string[] | null;
  quantity: number;
  weight: number | null;
  status: string;
  createdAt: string;
}

export interface BooksListResponse {
  success: boolean;
  data: {
    data: BookItem[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface BooksQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface CreateBookPayload {
  title: string;
  authorId?: string;
  productCategoryId?: string;
  boardId?: string;
  classId?: string;
  subjectId?: string;
  genreId?: string;
  languageId?: string;
  description?: string;
  publisher?: string;
  publishedYear?: string;
  pages?: number;
  price?: number;
  discountPrice?: number;
  quantity?: number;
  weight?: number;
  status?: string;
}

const wrap = (r: any) => r.data;

export const booksService = {
  getAll: (params: BooksQuery = {}) => api.get("/books", { params }).then(wrap),
  getById: (id: string) => api.get(`/books/${id}`).then(wrap),
  create: (data: CreateBookPayload) => api.post("/books", data).then(wrap),
  update: (id: string, data: Partial<CreateBookPayload>) => api.patch(`/books/${id}`, data).then(wrap),
  updateStatus: (id: string, status: string) => api.patch(`/books/status/${id}`, { status }).then(wrap),
  uploadCover: (id: string, file: File) => {
    const fd = new FormData(); fd.append("file", file);
    return api.put(`/books/cover/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } }).then(wrap);
  },
  uploadInsiderImages: (id: string, files: File[]) => {
    const fd = new FormData();
    files.forEach((file) => fd.append("files", file));
    return api.put(`/books/insider-images/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } }).then(wrap);
  },
  delete: (id: string) => api.delete(`/books/${id}`).then(wrap),
};

const logDrop = (key: string, raw: any, result: any[]) => {
  console.group(`[catalogApi] ${key}`);
  console.log("raw response:", raw);
  console.log("raw.data:", raw?.data);
  console.log("extracted array:", result);
  console.log("count:", result.length);
  console.groupEnd();
};

export const catalogApi = {
  authors: () =>
    api.get("/authors/active").then((r) => {
      const result = r.data?.data ?? [];
      logDrop("authors", r.data, result);
      return result;
    }).catch((e) => { console.error("[catalogApi] authors ERROR", e.response?.status, e.response?.data); return []; }),

  productCategories: () =>
    api.get("/product-categories/active").then((r) => {
      const result = r.data?.data ?? [];
      logDrop("productCategories", r.data, result);
      return result;
    }).catch((e) => { console.error("[catalogApi] productCategories ERROR", e.response?.status, e.response?.data); return []; }),

  genres: () =>
    api.get("/genres/active").then((r) => {
      const result = r.data?.data ?? [];
      logDrop("genres", r.data, result);
      return result;
    }).catch((e) => { console.error("[catalogApi] genres ERROR", e.response?.status, e.response?.data); return []; }),

  languages: () =>
    api.get("/languages/active").then((r) => {
      const result = r.data?.data ?? [];
      logDrop("languages", r.data, result);
      return result;
    }).catch((e) => { console.error("[catalogApi] languages ERROR", e.response?.status, e.response?.data); return []; }),

  boards: () =>
    api.get("/boards/active").then((r) => {
      const result = r.data?.data ?? [];
      logDrop("boards", r.data, result);
      return result;
    }).catch((e) => { console.error("[catalogApi] boards ERROR", e.response?.status, e.response?.data); return []; }),

  classesByBoard: (boardId: string) =>
    api.get(`/school-classes/by-board/${boardId}`).then((r) => {
      const result = r.data?.data ?? [];
      logDrop(`classesByBoard(${boardId})`, r.data, result);
      return result;
    }).catch((e) => { console.error("[catalogApi] classesByBoard ERROR", e.response?.status, e.response?.data); return []; }),

  subjectsByBoardClass: (boardId: string, classId: string) =>
    api.get(`/subjects/by-board-class/${boardId}/${classId}`).then((r) => {
      const result = r.data?.data ?? [];
      logDrop(`subjectsByBoardClass(${boardId},${classId})`, r.data, result);
      return result;
    }).catch((e) => { console.error("[catalogApi] subjectsByBoardClass ERROR", e.response?.status, e.response?.data); return []; }),
};
