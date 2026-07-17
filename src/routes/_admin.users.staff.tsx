import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Search, X, Edit3 } from "lucide-react";
import { staffService, type StaffDetail, type CreateStaffWithAccountPayload, type StaffPayload } from "@/services/staff.service";
import { designationService } from "@/services/designation.service";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export const Route = createFileRoute("/_admin/users/staff")({ component: StaffPage });

const LIMIT = 12;

function StaffPage() {
  const [items, setItems] = useState<StaffDetail[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [sheet, setSheet] = useState<{ open: boolean; item: StaffDetail | null }>({ open: false, item: null });

  const load = async (p = page, search = q) => {
    setLoading(true);
    try {
      const res = await staffService.getAll({ page: p, limit: LIMIT, ...(search ? { search } : {}) });
      setItems(res?.data ?? []);
      setTotal(res?.total ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="p-6">
      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Users & Admin</div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-[#111827]">Staff Members</h1>
          <p className="mt-1 max-w-2xl text-[13px] text-[#6B7280]">Manage staff members, their profiles, designations, and salaries.</p>
        </div>
        <button
          onClick={() => setSheet({ open: true, item: null })}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-[#111827] px-4 text-[12px] font-semibold text-white shadow-sm hover:bg-[#1F2937]"
        >
          <Plus className="h-4 w-4" /> Add staff member
        </button>
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-[#F3F4F6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); load(1, q); } }}
              placeholder="Search staff members…"
              className="h-10 w-full rounded-full border border-[#E5E7EB] bg-white pl-10 pr-4 text-[12px] outline-none focus:border-[#4F46E5]"
            />
          </div>
          <div className="text-[12px] text-[#6B7280]">{items.length} of {total} staff members</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px] table-auto">
            <thead className="bg-[#FAFAFB] text-[10px] uppercase tracking-wider text-[#6B7280]">
              <tr>
                <th className="px-4 py-3 text-left">Employee ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">City</th>
                <th className="px-4 py-3 text-left">Aadhaar</th>
                <th className="px-4 py-3 text-left">Joining Date</th>
                <th className="px-4 py-3 text-left">Salary</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-[#6B7280]">Loading...</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-[#6B7280]">No staff members found.</td></tr>
              )}
              {!loading && items.map((item) => (
                <tr key={item.id} className="border-t border-[#F3F4F6] hover:bg-[#F9FAFB]">
                  <td className="px-4 py-3 font-semibold text-[#111827]">{item.employeeId || "—"}</td>
                  <td className="px-4 py-3 font-medium text-[#111827]">{item.firstName} {item.lastName}</td>
                  <td className="px-4 py-3 text-[#6B7280]">{item.city || "—"}</td>
                  <td className="px-4 py-3 text-[#6B7280]">{item.aadhaarCardNumber || "—"}</td>
                  <td className="px-4 py-3 text-[#6B7280]">{item.joiningDate ? new Date(item.joiningDate).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3 text-[#111827] font-medium">₹ {item.salary ? Number(item.salary).toLocaleString("en-IN") : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => setSheet({ open: true, item })}
                        className="inline-flex h-8 items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 text-[11px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#F3F4F6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[11px] text-[#6B7280]">Page {page} of {totalPages}</div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-full border border-[#E5E7EB] px-3 py-1 text-[11px] disabled:opacity-40"
            >Prev</button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-full border border-[#E5E7EB] px-3 py-1 text-[11px] disabled:opacity-40"
            >Next</button>
          </div>
        </div>
      </div>

      {sheet.open && (
        <StaffSheet
          item={sheet.item}
          onClose={() => setSheet({ open: false, item: null })}
          onSaved={() => { setSheet({ open: false, item: null }); load(1, q); }}
        />
      )}
    </div>
  );
}

type StaffFormData = StaffPayload & {
  loginId?: string;
  password?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  highestEducation?: string;
  educationInstitute?: string;
  educationYear?: string;
};

function StaffSheet({ item, onClose, onSaved }: { item: StaffDetail | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!item;
  const { user } = useSelector((s: RootState) => s.auth);

  const [form, setForm] = useState<StaffFormData>({
    firstName: item?.firstName ?? "",
    middleName: item?.middleName ?? "",
    lastName: item?.lastName ?? "",
    email: item?.email ?? "",
    phone: item?.phone ?? "",
    dateOfBirth: item?.dateOfBirth?.split("T")[0] ?? "",
    gender: item?.gender ?? "",
    address: item?.address ?? "",
    city: item?.city ?? "",
    state: item?.state ?? "",
    zipCode: item?.zipCode ?? "",
    country: item?.country ?? "",
    aadhaarCardNumber: item?.idProof1Number ?? "",
    emergencyContactName: item?.emergencyContactName ?? "",
    emergencyContactPhone: item?.emergencyContactPhone ?? "",
    emergencyContactRelation: item?.emergencyContactRelation ?? "",
    highestEducation: item?.highestEducation ?? "",
    educationInstitute: item?.educationInstitute ?? "",
    educationYear: item?.educationYear ?? "",
    joiningDate: item?.joiningDate?.split("T")[0] ?? "",
    salary: item?.salary ?? 0,
    designationId: item?.designationId ?? "",
    loginId: "",
    password: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [designations, setDesignations] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await designationService.getAll({ page: 1, limit: 100 });
        setDesignations(res?.data ?? []);
      } catch { /* Silent fail */ }
    })();
  }, []);

  const setField = (key: keyof StaffFormData, value: string | number) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.firstName || !form.lastName) {
      setError("First name and last name are required");
      return;
    }

    if (!isEdit) {
      if (!form.loginId || !form.password) {
        setError("Login ID and password are required");
        return;
      }
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      if (!form.designationId) {
        setError("Designation is required");
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      if (isEdit && item) {
        const { loginId, password, ...updatePayload } = form;
        await staffService.update(item.id, updatePayload);
      } else {
        const createPayload: CreateStaffWithAccountPayload = {
          loginId: form.loginId!,
          password: form.password!,
          firstName: form.firstName,
          middleName: form.middleName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          address: form.address,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          country: form.country,
          aadhaarCardNumber: form.aadhaarCardNumber,
          emergencyContactName: form.emergencyContactName,
          emergencyContactPhone: form.emergencyContactPhone,
          emergencyContactRelation: form.emergencyContactRelation,
          highestEducation: form.highestEducation,
          educationInstitute: form.educationInstitute,
          educationYear: form.educationYear,
          joiningDate: form.joiningDate,
          salary: form.salary,
          designationId: form.designationId!,
        };
        await staffService.createWithAccount(createPayload);
      }
      onSaved();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? "Unable to save staff member.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="flex h-full w-full max-w-3xl flex-col overflow-hidden bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">{isEdit ? "Edit staff member" : "Add staff member"}</div>
            <div className="mt-1 text-[17px] font-semibold text-[#111827]">{item ? `${item.firstName} ${item.lastName}` : "Create new staff record"}</div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-[#6B7280] hover:bg-[#F3F4F6]"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {error && (
              <div className="rounded-2xl border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-3 text-[12px] text-[#B91C1C]">{error}</div>
            )}

            {/* Personal Information */}
            <div>
              <div className="text-[12px] font-semibold text-[#374151] mb-3">Personal Information</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#374151]">First name *</label>
                  <input required value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} placeholder="First name" className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]" />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#374151]">Last name *</label>
                  <input required value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} placeholder="Last name" className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]" />
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-1 block text-[11px] font-medium text-[#374151]">Middle name</label>
                <input value={form.middleName ?? ""} onChange={(e) => setField("middleName", e.target.value)} placeholder="Middle name" className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]" />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#374151]">Date of Birth</label>
                  <input type="date" value={form.dateOfBirth ?? ""} onChange={(e) => setField("dateOfBirth", e.target.value)} className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]" />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#374151]">Gender</label>
                  <select value={form.gender ?? ""} onChange={(e) => setField("gender", e.target.value)} className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]">
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <div className="text-[12px] font-semibold text-[#374151] mb-3">Contact Information</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#374151]">Email</label>
                  <input type="email" value={form.email ?? ""} onChange={(e) => setField("email", e.target.value)} placeholder="Email" className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]" />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#374151]">Phone</label>
                  <input value={form.phone ?? ""} onChange={(e) => setField("phone", e.target.value)} placeholder="Phone" className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]" />
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-1 block text-[11px] font-medium text-[#374151]">Address</label>
                <input value={form.address ?? ""} onChange={(e) => setField("address", e.target.value)} placeholder="Address" className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]" />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#374151]">City</label>
                  <input value={form.city ?? ""} onChange={(e) => setField("city", e.target.value)} placeholder="City" className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]" />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#374151]">State</label>
                  <input value={form.state ?? ""} onChange={(e) => setField("state", e.target.value)} placeholder="State" className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]" />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#374151]">Zip Code</label>
                  <input value={form.zipCode ?? ""} onChange={(e) => setField("zipCode", e.target.value)} placeholder="Zip Code" className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]" />
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-1 block text-[11px] font-medium text-[#374151]">Country</label>
                <input value={form.country ?? ""} onChange={(e) => setField("country", e.target.value)} placeholder="Country" className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]" />
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <div className="text-[12px] font-semibold text-[#374151] mb-3">Professional Information</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#374151]">Joining Date</label>
                  <input type="date" value={form.joiningDate ?? ""} onChange={(e) => setField("joiningDate", e.target.value)} className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]" />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#374151]">Salary (₹)</label>
                  <input type="number" step="0.01" min="0" value={form.salary ?? ""} onChange={(e) => setField("salary", e.target.value ? parseFloat(e.target.value) : 0)} placeholder="0.00" className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]" />
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-1 block text-[11px] font-medium text-[#374151]">Designation {isEdit ? "" : "*"}</label>
                <select required={!isEdit} value={form.designationId ?? ""} onChange={(e) => setField("designationId", e.target.value)} className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]">
                  <option value="">Select a designation</option>
                  {designations.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Document Information */}
            <div>
              <div className="text-[12px] font-semibold text-[#374151] mb-3">Document Information</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#374151]">Aadhaar Card Number</label>
                  <input value={form.aadhaarCardNumber ?? ""} onChange={(e) => setField("aadhaarCardNumber", e.target.value)} placeholder="Aadhaar number" className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]" />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <div className="text-[12px] font-semibold text-[#374151] mb-3">Emergency Contact</div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#374151]">Name</label>
                  <input value={form.emergencyContactName ?? ""} onChange={(e) => setField("emergencyContactName", e.target.value)} placeholder="Contact name" className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]" />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#374151]">Phone</label>
                  <input value={form.emergencyContactPhone ?? ""} onChange={(e) => setField("emergencyContactPhone", e.target.value)} placeholder="Contact phone" className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]" />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#374151]">Relation</label>
                  <input value={form.emergencyContactRelation ?? ""} onChange={(e) => setField("emergencyContactRelation", e.target.value)} placeholder="Relation" className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]" />
                </div>
              </div>
            </div>

            {/* Education */}
            <div>
              <div className="text-[12px] font-semibold text-[#374151] mb-3">Education</div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#374151]">Highest Education</label>
                  <input value={form.highestEducation ?? ""} onChange={(e) => setField("highestEducation", e.target.value)} placeholder="Education" className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]" />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#374151]">Institute</label>
                  <input value={form.educationInstitute ?? ""} onChange={(e) => setField("educationInstitute", e.target.value)} placeholder="Institute" className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]" />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#374151]">Year</label>
                  <input value={form.educationYear ?? ""} onChange={(e) => setField("educationYear", e.target.value)} placeholder="Year" className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]" />
                </div>
              </div>
            </div>

            {/* Login Credentials - Only for new staff */}
            {!isEdit && (
              <div>
                <div className="text-[12px] font-semibold text-[#374151] mb-3">Login Credentials</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-[#374151]">Login ID *</label>
                    <input required value={form.loginId ?? ""} onChange={(e) => setField("loginId", e.target.value)} placeholder="Login ID" className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-[#374151]">Password *</label>
                    <input type="password" required value={form.password ?? ""} onChange={(e) => setField("password", e.target.value)} placeholder="Password (min 6 chars)" className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none focus:border-[#4F46E5]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[#E5E7EB] px-5 py-4">
            <button type="button" onClick={onClose} className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-4 text-[12px] font-medium text-[#374151]">Cancel</button>
            <button type="submit" disabled={saving} className="h-10 rounded-xl bg-[#111827] px-4 text-[12px] font-medium text-white disabled:opacity-60">
              {saving ? "Saving…" : isEdit ? "Update staff" : "Add staff member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}