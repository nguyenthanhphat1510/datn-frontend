# Flow gọi API sản phẩm — Giải thích chi tiết

Tài liệu này giải thích luồng dữ liệu từ backend → frontend cho trang sản phẩm trang chủ, và vai trò của từng file đã tạo.

---

## 1. Sơ đồ tổng quan

```
┌─────────────────────────────────────────────────────────────────────┐
│                          BACKEND (NestJS)                            │
│                       http://localhost:3000                          │
│                                                                      │
│   GET /products?page=1&limit=6&categoryId=...&search=...&...        │
│   GET /categories                                                    │
└────────────────────────────┬─────────────────────────────────────────┘
                             │ HTTP (fetch)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       FRONTEND (Next.js)                             │
│                                                                      │
│   ┌──────────────────┐                                              │
│   │  .env.local      │  NEXT_PUBLIC_API_URL=http://localhost:3000   │
│   └────────┬─────────┘                                              │
│            │                                                         │
│            ▼                                                         │
│   ┌──────────────────┐                                              │
│   │  lib/api.ts      │  Wrapper fetch dùng chung: apiGet<T>()       │
│   └────────┬─────────┘                                              │
│            │                                                         │
│            ▼                                                         │
│   ┌──────────────────────┐                                          │
│   │ services/products.ts │  fetchProducts(), fetchCategories()      │
│   └────────┬─────────────┘                                          │
│            │ trả về data đã có type Product[], Category[]           │
│            ▼                                                         │
│   ┌──────────────────────┐                                          │
│   │  ProductList.tsx     │  Container: state, filter, gọi API       │
│   │  (Smart component)   │                                          │
│   └────────┬─────────────┘                                          │
│            │ truyền product: Product xuống                          │
│            ▼                                                         │
│   ┌──────────────────────┐                                          │
│   │  ProductItem.tsx     │  Presentational: chỉ render 1 sản phẩm   │
│   │  (Dumb component)    │  → ProductCard (grid) / ProductRow (list)│
│   └──────────────────────┘                                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. API được call ở đâu?

**Câu trả lời ngắn:** trong `ProductList.tsx`, qua 2 `useEffect`.

### 2.1 Lần fetch đầu tiên (mount component)

[ProductList.tsx](./ProductList.tsx) — `useEffect` đầu, chạy 1 lần khi component mount:

```ts
useEffect(() => {
  fetchCategories()
    .then((cats) => setCategories(cats.filter((c) => c.isActive)))
    .catch(() => setCategories([]));

  fetchProducts({ limit: 3, page: 1 })
    .then((res) => setNewest(res.data))
    .catch(() => setNewest([]));
}, []);
```

- `fetchCategories()` → đổ vào sidebar "Danh mục".
- `fetchProducts({ limit: 3 })` → lấy 3 sản phẩm mới nhất cho box "Sản phẩm mới nhất" ở sidebar.

### 2.2 Fetch lại mỗi khi filter thay đổi

`useEffect` thứ 2, phụ thuộc `[activeCategory, priceRange, search, page, reloadKey]`:

```ts
useEffect(() => {
  const timer = setTimeout(() => {
    setLoading(true);
    fetchProducts({
      page,
      limit: PAGE_SIZE,
      categoryId: activeCategory !== ALL_CATEGORY ? activeCategory : undefined,
      search: search.trim() || undefined,
      minPrice: priceRange[0] > PRICE_MIN ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < PRICE_MAX ? priceRange[1] : undefined,
    })
      .then((res) => { setProducts(res.data); setTotal(res.total); })
      .catch((err) => { setError(err.message); ... })
      .finally(() => setLoading(false));
  }, 300); // ← debounce 300ms (chủ yếu cho ô search)
  return () => clearTimeout(timer);
}, [activeCategory, priceRange, search, page, reloadKey]);
```

**Khi nào fetch chạy lại?**
- User click 1 danh mục ở sidebar → `activeCategory` đổi → fetch lại.
- User kéo slider giá → `priceRange` đổi → fetch lại.
- User gõ vào ô tìm kiếm → `search` đổi → đợi 300ms (debounce, tránh spam request mỗi keystroke) → fetch lại.
- User click phân trang → `page` đổi → fetch lại.
- User nhấn nút "Thử lại" khi có lỗi → `reloadKey++` → fetch lại.

**Lưu ý sort:** sort không gọi lại API. Backend chỉ sort theo `createdAt DESC`. Khi user chọn "Giá tăng/giảm", frontend sort client-side trên 6 item của page hiện tại (xem `displayed` trong [ProductList.tsx](./ProductList.tsx)).

---

## 3. Vai trò từng file

### 3.1 `frontend/.env.local`

Chứa biến môi trường `NEXT_PUBLIC_API_URL=http://localhost:3000`.

- Tiền tố `NEXT_PUBLIC_` bắt buộc để client component (chạy trên browser) đọc được biến này.
- Khi deploy lên server thật, chỉ cần đổi URL ở đây, không phải sửa code.
- File này **không commit lên git** (đã có trong `.gitignore` mặc định của Next.js).

### 3.2 `frontend/src/lib/api.ts`

Wrapper fetch dùng chung cho **toàn bộ project**.

```ts
export async function apiGet<T>(path, params?): Promise<T>
```

**Lợi ích:**
- Không phải viết `fetch("http://localhost:3000/products?page=1&...")` mỗi chỗ.
- Tự build query string an toàn (URL-encode), bỏ tham số `undefined/null/""`.
- Tự throw error khi `res.ok === false`, để service không cần check lại.
- Sau này thêm auth token / interceptor chỉ sửa 1 file.

**Dùng ở đâu khác?** Khi viết các service mới (orders, cart, users…), import `apiGet` từ đây.

### 3.3 `frontend/src/types/product.ts`

Định nghĩa TypeScript types **dùng chung** cho cả app:

- `Product`: shape giống backend entity (`_id`, `name`, `price`, `images[]`, `categoryId`, …) + vài field UI optional (`rating`, `badge`, `originalPrice`) mà backend chưa có.
- `Category`: shape category backend.
- `Paginated<T>`: shape response phân trang `{ data, total, page, limit }`.

**Lợi ích:** sửa shape 1 chỗ, cả app báo lỗi đúng nơi nếu dùng sai field.

### 3.4 `frontend/src/services/products.ts`

Lớp service — abstraction trên `apiGet`.

```ts
fetchProducts(params)  → Promise<Paginated<Product>>
fetchCategories()      → Promise<Category[]>
```

**Tại sao tách service riêng thay vì gọi `apiGet` thẳng trong component?**
- Component không cần biết endpoint là `/products` hay tham số tên gì.
- Nếu mai backend đổi route từ `/products` → `/api/v1/products`, chỉ sửa file này.
- Dễ mock khi viết test cho component.
- Tái sử dụng: trang chi tiết, trang giỏ hàng, trang admin… đều import cùng `fetchProducts`.

### 3.5 `frontend/src/lib/format.ts`

Hàm `fmt(n)` → format số thành tiền VN: `80000` → `"80.000₫"`.

Tách ra file riêng vì dùng ở nhiều chỗ (ProductCard, ProductRow, sidebar newest, sau này là CartPage, DetailPage…).

### 3.6 `frontend/src/components/Stars.tsx`

Component vẽ 5 ngôi sao đánh giá theo prop `rating: number`. Dùng ở `ProductCard`, `ProductRow`, sidebar.

### 3.7 `frontend/src/components/icons.tsx`

Gom tất cả icon SVG inline (giỏ hàng, tim, mắt, lưới, lá, …) + constant `BADGE_STYLES` ở 1 file.

**Tại sao không cài thư viện icon?** Project đang dùng SVG inline tùy biến, không cần thêm dependency. Gom 1 chỗ để dễ tìm và tái sử dụng.

### 3.8 `frontend/src/components/home/ProductItem.tsx` — Presentational

Export **2 component**:
- `ProductCard` — hiển thị 1 sản phẩm dạng **thẻ vuông** (chế độ lưới).
- `ProductRow` — hiển thị 1 sản phẩm dạng **hàng ngang** (chế độ danh sách).

**Đặc điểm:**
- Chỉ nhận 1 prop: `product: Product`.
- Không biết gì về API, filter, paging.
- Không có state phức tạp (chỉ `carted`, `wished` cho hiệu ứng nút local).
- "Câm" — đưa data nào thì hiện đúng data đó.

**Có thể tái sử dụng:** trang `/phan-bon`, `/thuoc-bvtv`, `/tim-kiem`, trang chi tiết (gợi ý sản phẩm liên quan), giỏ hàng (gợi ý)… đều dùng được.

### 3.9 `frontend/src/components/home/ProductList.tsx` — Container

Component "thông minh", lo:
1. **State**: `products`, `categories`, `newest`, `loading`, `error`, `activeCategory`, `priceRange`, `sort`, `view`, `page`, `search`, `drawerOpen`.
2. **Gọi API**: 2 `useEffect` mô tả ở mục 2.
3. **Layout**: breadcrumb, header, sidebar (desktop + mobile drawer), toolbar (search, view toggle, sort), grid/list area, pagination.
4. **Trạng thái UI**:
   - Loading → skeleton 6 ô xám pulse.
   - Error → banner đỏ + nút "Thử lại".
   - Empty → icon lá + nút "Đặt lại bộ lọc".
   - Có data → render `<ProductCard>` hoặc `<ProductRow>` qua `displayed.map(...)`.

**Không biết gì về:**
- Cách render 1 product trông như nào (đẩy cho `ProductItem`).
- Cấu trúc URL backend (đẩy cho `services/products`).
- Cách build query string (đẩy cho `lib/api`).

---

## 4. Flow 1 lượt user thao tác

Ví dụ: user click danh mục "Thuốc bảo vệ thực vật" ở sidebar.

```
1. User click button trong SidebarContent
       ↓
2. setActiveCategory("65abc...")  ← _id của category
       ↓
3. activeCategory state đổi → useEffect thứ 2 re-run
       ↓
4. setTimeout 300ms → fetchProducts({ categoryId: "65abc...", page: 1, limit: 6 })
       ↓
5. fetchProducts() gọi apiGet("/products", { categoryId, page, limit, isActive: true })
       ↓
6. apiGet() build URL: http://localhost:3000/products?categoryId=65abc...&page=1&limit=6&isActive=true
       ↓
7. fetch() request đi đến NestJS backend
       ↓
8. Backend trả { data: Product[], total, page, limit }
       ↓
9. .then(res => { setProducts(res.data); setTotal(res.total); })
       ↓
10. React re-render → displayed.map(p => <ProductCard product={p} />)
       ↓
11. Mỗi ProductCard render: ảnh, tên, giá, nút hành động
```

---

## 5. So sánh với cách cũ (mock data)

| Khía cạnh | Trước (mock) | Sau (API) |
|---|---|---|
| Data source | Mảng `ALL_PRODUCTS` hardcode trong file | Backend MongoDB |
| Filter | `.filter()` client trên mảng | Query param gửi backend |
| Phân trang | `.slice(start, end)` client | `page` + `limit` query param |
| Total | `ALL_PRODUCTS.length` cố định | `res.total` từ backend |
| Đổi dữ liệu | Sửa code | Sửa DB (qua admin) |
| Refresh | Không có | F5 hoặc nút "Thử lại" |
| Loading state | Không cần | Skeleton |
| Error state | Không cần | Banner đỏ |

---

## 6. Field backend chưa có

Backend chỉ có: `_id, name, description, price, stock, categoryId, manufacturer, usageInstructions, images, isActive`.

Frontend UI mong muốn thêm: `rating, ratingCount, badge ("Sale"|"Hot"|"Mới"), originalPrice`.

**Xử lý hiện tại:** ẩn UI tương ứng khi field không có:
- `rating` không có → ẩn block sao đánh giá.
- `badge` không có → không hiện nhãn góc.
- `originalPrice` không có hoặc `<= price` → không hiện giá gạch và % giảm giá.
- `images` rỗng → fallback icon lá.

Nếu sau này muốn có thật, thêm field vào `backend/src/products/entities/product.entity.ts` + DTO + form admin.

---

## 7. Cách verify

1. `cd backend && npm run start:dev` (port 3000).
2. Tạo data mẫu qua Postman/Thunder Client:
   - `POST http://localhost:3000/categories` body `{ "name": "Phân bón", "slug": "phan-bon" }`
   - `POST http://localhost:3000/products` body `{ "name": "Phân NPK", "price": 320000, "stock": 100, "categoryId": "<id_vừa_tạo>" }`
3. `cd frontend && npm run dev`.
4. Mở trang chủ, mở DevTools → Network:
   - Thấy request `GET /products?page=1&limit=6&isActive=true`.
   - Thấy request `GET /categories`.
   - Thấy request `GET /products?limit=3&page=1&isActive=true` (cho box "mới nhất").
5. Click danh mục, gõ search, kéo slider giá → Network thấy request mới với query phù hợp.
6. Tắt backend → trang hiện banner đỏ + nút "Thử lại".
