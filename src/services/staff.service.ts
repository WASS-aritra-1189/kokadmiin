import { api } from "@/lib/axios";

const wrap = (r: any) => r.data?.data ?? r.data;

export type StaffDetail = {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  profilePicture?: string;
  employeeId?: string;
  joiningDate?: string;
  salary?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  idProof1Type?: string;
  idProof1Number?: string;
  idProof1Document?: string;
  idProof2Type?: string;
  idProof2Number?: string;
  idProof2Document?: string;
  addressProofType?: string;
  addressProofNumber?: string;
  addressProofDocument?: string;
  highestEducation?: string;
  educationInstitute?: string;
  educationYear?: string;
  educationCertificate?: string;
  skills?: string[];
  accountId: string;
  designationId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type StaffPayload = {
  firstName: string;
  middleName?: string;
  lastName: string;
  city?: string;
  aadhaarCardNumber?: string;
  joiningDate?: string;
  salary?: number;
  accountId: string;
  designationId?: string;
};

export type CreateStaffWithAccountPayload = {
  loginId: string;
  password: string;
  role?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  aadhaarCardNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  highestEducation?: string;
  educationInstitute?: string;
  educationYear?: string;
  joiningDate?: string;
  salary?: number;
  designationId: string;
};

export type StaffListResponse = {
  data: StaffDetail[];
  total: number;
  page: number;
  limit: number;
};

export const staffService = {
  getAll: (params?: { page?: number; limit?: number; search?: string; gender?: string[]; designationId?: string[] }) =>
    api.get("/staff-details", { params }).then(wrap),

  create: (payload: StaffPayload) =>
    api.post("/staff-details", payload).then(wrap),

  createWithAccount: (payload: CreateStaffWithAccountPayload) =>
    api.post("/accounts/staff", payload).then(wrap),

  getOne: (id: string) =>
    api.get(`/staff-details/${id}`).then(wrap),

  update: (id: string, payload: Partial<StaffPayload>) =>
    api.patch(`/staff-details/${id}`, payload).then(wrap),

  getProfile: () =>
    api.get("/staff-details/profile").then(wrap),
};
