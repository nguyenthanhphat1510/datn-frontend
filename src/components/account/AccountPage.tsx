"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  type Address,
} from "@/services/addresses";
import AddressForm, {
  EMPTY_ADDRESS,
  validateAddress,
  type AddressFormValues,
} from "@/components/checkout/AddressForm";
import type { PlaceDetail } from "@/services/addresses";

/* ─────────────────────────────────────────
   Icon nhỏ dùng trong trang
───────────────────────────────────────── */
function IconUser() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0"
      />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zM19.5 7.125L16.875 4.5"
      />
    </svg>
  );
}

function IconPin() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4 text-[#007e42]"
    >
      <path
        fillRule="evenodd"
        d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────
   Trang "Tài khoản của tôi"
───────────────────────────────────────── */
export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, updateUser } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [error, setError] = useState("");

  /* ── CRUD sổ địa chỉ ── */
  // null = đóng form; "new" = thêm; string = đang sửa địa chỉ có _id đó.
  const [addrEditing, setAddrEditing] = useState<"new" | string | null>(null);
  const [addrForm, setAddrForm] = useState<AddressFormValues>(EMPTY_ADDRESS);
  const [addrErrors, setAddrErrors] = useState<
    Partial<Record<keyof AddressFormValues, string>>
  >({});
  // Toạ độ resolve được khi thêm/sửa (để lưu kèm, phục vụ tính phí ship).
  const [addrPlace, setAddrPlace] = useState<PlaceDetail | null>(null);
  const [savingAddr, setSavingAddr] = useState(false);
  // _id đang bị xóa (để disable nút trong lúc gọi API).
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openAddAddress() {
    setAddrEditing("new");
    setAddrForm({ ...EMPTY_ADDRESS, saveToBook: false });
    setAddrErrors({});
    setAddrPlace(null);
    setError("");
  }

  function openEditAddress(addr: Address) {
    setAddrEditing(addr._id);
    setAddrForm({
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.address,
      saveToBook: false,
    });
    setAddrErrors({});
    // Giữ toạ độ cũ nếu địa chỉ chưa bị sửa chuỗi.
    setAddrPlace(
      addr.lat != null && addr.lon != null
        ? ({ address: addr.address, lat: addr.lat, lon: addr.lon } as PlaceDetail)
        : null,
    );
    setError("");
  }

  function closeAddrForm() {
    setAddrEditing(null);
    setAddrErrors({});
    setAddrPlace(null);
  }

  async function saveAddress() {
    const errs = validateAddress(addrForm);
    if (Object.keys(errs).length > 0) {
      setAddrErrors(errs);
      return;
    }
    setAddrErrors({});
    setSavingAddr(true);
    setError("");

    // Chỉ kèm lat/lon khi đúng địa chỉ vừa resolve (chưa sửa tay sau đó).
    const resolved =
      addrPlace && addrPlace.address === addrForm.address.trim()
        ? addrPlace
        : null;
    const payload = {
      fullName: addrForm.fullName.trim(),
      phone: addrForm.phone.trim(),
      address: addrForm.address.trim(),
      lat: resolved?.lat,
      lon: resolved?.lon,
    };

    try {
      if (addrEditing === "new") {
        const created = await createAddress({
          ...payload,
          isDefault: addresses.length === 0, // địa chỉ đầu tiên → mặc định
        });
        setAddresses((prev) => [...prev, created]);
      } else if (addrEditing) {
        const updated = await updateAddress(addrEditing, payload);
        setAddresses((prev) =>
          prev.map((a) => (a._id === updated._id ? updated : a)),
        );
      }
      closeAddrForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lưu địa chỉ thất bại");
    } finally {
      setSavingAddr(false);
    }
  }

  async function handleSetDefault(id: string) {
    setError("");
    try {
      await setDefaultAddress(id);
      // Cập nhật cờ mặc định cục bộ (chỉ 1 cái true).
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a._id === id })),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đặt mặc định thất bại",
      );
    }
  }

  async function handleDeleteAddress(id: string) {
    if (!window.confirm("Xóa địa chỉ này khỏi sổ?")) return;
    setError("");
    setDeletingId(id);
    try {
      await deleteAddress(id);
      // Đồng bộ lại từ server vì xóa địa chỉ mặc định có thể promote cái khác.
      const list = await getAddresses();
      setAddresses(list);
      if (addrEditing === id) closeAddrForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xóa địa chỉ thất bại");
    } finally {
      setDeletingId(null);
    }
  }

  /* ── Chỉnh sửa thông tin cá nhân ── */
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  function startEdit() {
    setNameDraft(user?.fullName || "");
    setProfileMsg("");
    setEditing(true);
  }

  async function saveProfile() {
    const name = nameDraft.trim();
    if (!name) {
      setProfileMsg("Vui lòng nhập họ tên");
      return;
    }
    setSavingProfile(true);
    setProfileMsg("");
    try {
      // TODO: gọi API cập nhật profile khi backend sẵn sàng.
      // Hiện chỉ cập nhật local (context + localStorage) để xem luồng UI.
      await new Promise((r) => setTimeout(r, 400)); // giả lập độ trễ mạng
      updateUser({ fullName: name });
      setEditing(false);
    } catch {
      setProfileMsg("Cập nhật thất bại, vui lòng thử lại");
    } finally {
      setSavingProfile(false);
    }
  }

  /* ── Chặn chưa đăng nhập ── */
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/dang-nhap");
    }
  }, [authLoading, user, router]);

  /* ── Tải sổ địa chỉ ── */
  useEffect(() => {
    if (!user) return;
    let active = true;
    getAddresses()
      .then((list) => {
        if (active) setAddresses(list);
      })
      .catch((err) => {
        if (active)
          setError(
            err instanceof Error ? err.message : "Không tải được địa chỉ",
          );
      })
      .finally(() => {
        if (active) setLoadingAddr(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  /* ── Guard states ── */
  if (authLoading || (!user && !authLoading)) {
    return (
      <section className="min-h-screen bg-[#e5e7eb] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center text-sm text-gray-400">
          Đang tải...
        </div>
      </section>
    );
  }

  if (!user) return null;

  const displayName = user.fullName || user.email.split("@")[0];
  const initial = (user.fullName?.[0] || user.email[0] || "U").toUpperCase();
  const roleLabel = user.role === "admin" ? "Quản trị viên" : "Khách hàng";

  return (
    <section className="min-h-screen bg-[#e5e7eb] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="flex items-center gap-2 text-xl font-extrabold text-gray-800">
          <span className="text-[#007e42]">
            <IconUser />
          </span>
          Tài Khoản Của Tôi
        </h1>
        <p className="mb-5 mt-1 text-sm text-gray-500">
          Thông tin cá nhân và sổ địa chỉ giao hàng của bạn
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* ── Thẻ thông tin tài khoản ── */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md shadow-gray-200/60">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#007e42] text-2xl font-extrabold text-white">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold text-gray-800">
                {displayName}
              </p>
              <p className="truncate text-sm text-gray-500">{user.email}</p>
              <span className="mt-1.5 inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-[#007e42]">
                {roleLabel}
              </span>
            </div>
          </div>

          {editing ? (
            /* ── Chế độ chỉnh sửa ── */
            <div className="mt-6 flex flex-col gap-4 border-t border-gray-100 pt-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  placeholder="Nhập họ và tên"
                  className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#007e42] focus:ring-1 focus:ring-[#007e42]/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Email
                </label>
                <input
                  type="text"
                  value={user.email}
                  disabled
                  className="mt-1.5 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  Email là định danh đăng nhập, không thể thay đổi.
                </p>
              </div>

              {profileMsg && (
                <p className="text-xs font-medium text-red-500">{profileMsg}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="rounded-lg bg-[#007e42] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#005f32] disabled:opacity-50"
                >
                  {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  disabled={savingProfile}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            /* ── Chế độ xem ── */
            <>
              <dl className="mt-6 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Họ và tên
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-800">
                    {user.fullName || "Chưa cập nhật"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Email
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-800">
                    {user.email}
                  </dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={startEdit}
                className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-[#007e42]/30 bg-[#007e42]/5 px-4 py-2 text-sm font-semibold text-[#007e42] transition hover:bg-[#007e42]/10"
              >
                <IconEdit />
                Chỉnh sửa thông tin
              </button>
            </>
          )}
        </div>

        {/* ── Sổ địa chỉ ── */}
        <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-md shadow-gray-200/60">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-gray-800">
              Sổ Địa Chỉ
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">
                {addresses.length} địa chỉ
              </span>
              {addrEditing === null && (
                <button
                  type="button"
                  onClick={openAddAddress}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#007e42] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#005f32]"
                >
                  + Thêm địa chỉ
                </button>
              )}
            </div>
          </div>

          {/* Form thêm mới (hiện ngay dưới header) */}
          {addrEditing === "new" && (
            <div className="mt-4 rounded-xl border-2 border-[#007e42]/20 bg-[#007e42]/[0.03] p-4">
              <p className="mb-3 text-sm font-bold text-gray-700">
                Thêm địa chỉ mới
              </p>
              <AddressForm
                values={addrForm}
                errors={addrErrors}
                showSave={false}
                onChange={setAddrForm}
                onResolve={setAddrPlace}
              />
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={saveAddress}
                  disabled={savingAddr}
                  className="rounded-lg bg-[#007e42] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#005f32] disabled:opacity-50"
                >
                  {savingAddr ? "Đang lưu..." : "Lưu địa chỉ"}
                </button>
                <button
                  type="button"
                  onClick={closeAddrForm}
                  disabled={savingAddr}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          {loadingAddr ? (
            <p className="mt-4 text-sm text-gray-400">Đang tải địa chỉ...</p>
          ) : addresses.length === 0 && addrEditing !== "new" ? (
            <p className="mt-4 rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
              Bạn chưa lưu địa chỉ nào. Nhấn “Thêm địa chỉ” để tạo mới.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {addresses.map((addr) =>
                addrEditing === addr._id ? (
                  /* ── Form sửa địa chỉ này ── */
                  <div
                    key={addr._id}
                    className="rounded-xl border-2 border-[#007e42]/30 bg-[#007e42]/[0.03] p-4"
                  >
                    <p className="mb-3 text-sm font-bold text-gray-700">
                      Sửa địa chỉ
                    </p>
                    <AddressForm
                      values={addrForm}
                      errors={addrErrors}
                      showSave={false}
                      onChange={setAddrForm}
                      onResolve={setAddrPlace}
                    />
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={saveAddress}
                        disabled={savingAddr}
                        className="rounded-lg bg-[#007e42] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#005f32] disabled:opacity-50"
                      >
                        {savingAddr ? "Đang lưu..." : "Lưu thay đổi"}
                      </button>
                      <button
                        type="button"
                        onClick={closeAddrForm}
                        disabled={savingAddr}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Hiển thị địa chỉ ── */
                  <div
                    key={addr._id}
                    className="rounded-xl border-2 border-gray-200 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-gray-800">
                        {addr.fullName}
                      </span>
                      <span className="text-sm text-gray-400">|</span>
                      <span className="text-sm text-gray-600">
                        {addr.phone}
                      </span>
                      {addr.isDefault && (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-[#007e42]">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <p className="mt-2 flex items-start gap-1.5 text-sm text-gray-600">
                      <span className="mt-0.5 shrink-0">
                        <IconPin />
                      </span>
                      {addr.address}
                    </p>

                    {/* Hành động: đặt mặc định / sửa / xóa */}
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                      {!addr.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(addr._id)}
                          className="rounded-lg border border-[#007e42]/30 bg-[#007e42]/5 px-3 py-1.5 text-xs font-semibold text-[#007e42] transition hover:bg-[#007e42]/10"
                        >
                          Đặt làm mặc định
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openEditAddress(addr)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                      >
                        <IconEdit />
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr._id)}
                        disabled={deletingId === addr._id}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === addr._id ? "Đang xóa..." : "Xóa"}
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {/* ── Hành động nhanh ── */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link
            href="/don-hang"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#007e42] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#007e42]/25 transition hover:bg-[#005f32]"
          >
            Đơn hàng của tôi
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace("/");
            }}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </section>
  );
}
