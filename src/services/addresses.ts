import { apiGet, apiPost } from "@/lib/api";

/* ─── Shape khớp với backend Address (addresses entity/dto) ─── */
export interface Address {
  _id: string;
  fullName: string;
  phone: string;
  address: string; // địa chỉ đầy đủ (1 chuỗi gộp)
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Body khớp CreateAddressDto. */
export interface AddressInput {
  fullName: string;
  phone: string;
  address: string;
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

/** GET /addresses — danh sách địa chỉ của user (mặc định lên đầu). */
export function getAddresses(): Promise<Address[]> {
  return apiGet<Address[]>("/addresses", undefined, { auth: true });
}

/** POST /addresses — thêm địa chỉ mới vào sổ. */
export function createAddress(dto: AddressInput): Promise<Address> {
  return apiPost<Address>("/addresses", dto, { auth: true });
}
