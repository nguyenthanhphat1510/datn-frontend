import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";

/* ─── Shape khớp với backend Address (addresses entity/dto) ─── */
export interface Address {
  _id: string;
  fullName: string;
  phone: string;
  address: string; // địa chỉ đầy đủ (1 chuỗi gộp)
  lat?: number; // toạ độ (nếu địa chỉ được lưu qua resolve)
  lon?: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Body khớp CreateAddressDto. */
export interface AddressInput {
  fullName: string;
  phone: string;
  address: string;
  lat?: number; // toạ độ resolve từ gogoduk — để tính phí ship
  lon?: number;
  isDefault?: boolean;
}

/* ─── Gợi ý địa chỉ (proxy gogoduk qua /api/address-suggest) ─── */
export interface AddressPrediction {
  placeId: string;
  text: string; // chuỗi địa chỉ đầy đủ
  mainText: string;
  secondaryText: string;
}

/** GET /address-suggest?input=... — gợi ý địa chỉ. Public, không cần auth. */
export function suggestAddress(
  input: string,
): Promise<{ predictions: AddressPrediction[] }> {
  return apiGet<{ predictions: AddressPrediction[] }>("/address-suggest", {
    input,
  });
}

/* ─── Địa chỉ chi tiết (proxy gogoduk /v1/place/resolve) ─── */
export interface PlaceDetail {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  district: string;
  city: string;
  country: string;
}

/**
 * GET /address-suggest/resolve?id=... — lấy địa chỉ chi tiết từ placeId.
 * Trả null nếu không resolve được. Public.
 */
export function resolvePlace(placeId: string): Promise<PlaceDetail | null> {
  return apiGet<PlaceDetail | null>("/address-suggest/resolve", {
    id: placeId,
  });
}

/** GET /addresses — danh sách địa chỉ của user (mặc định lên đầu). */
export function getAddresses(): Promise<Address[]> {
  return apiGet<Address[]>("/addresses", undefined, { auth: true });
}

/** POST /addresses — thêm địa chỉ mới vào sổ. */
export function createAddress(dto: AddressInput): Promise<Address> {
  return apiPost<Address>("/addresses", dto, { auth: true });
}

/** PATCH /addresses/:id — cập nhật địa chỉ. */
export function updateAddress(
  id: string,
  dto: Partial<AddressInput>,
): Promise<Address> {
  return apiPatch<Address>(`/addresses/${id}`, dto, { auth: true });
}

/** PATCH /addresses/:id/default — đặt làm địa chỉ mặc định. */
export function setDefaultAddress(id: string): Promise<Address> {
  return apiPatch<Address>(`/addresses/${id}/default`, undefined, {
    auth: true,
  });
}

/** DELETE /addresses/:id — xóa địa chỉ khỏi sổ. */
export function deleteAddress(id: string): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/addresses/${id}`, { auth: true });
}
