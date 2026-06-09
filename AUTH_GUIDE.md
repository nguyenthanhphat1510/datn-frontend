# Hướng dẫn: Hoàn thiện flow Đăng nhập / Đăng ký cho Storefront

> File này mô tả **kế hoạch implement** chức năng đăng nhập / đăng ký
> phía storefront (`frontend/`). Đọc kỹ trước khi bắt tay code.

---

## 1. Bối cảnh hiện tại

### Backend (đã sẵn sàng — KHÔNG sửa)

`backend/src/auth/auth.controller.ts` đã có:

| Endpoint | Method | Public? | Trả về |
|----------|--------|---------|--------|
| `/auth/register` | POST | ✅ | `{ message, user, access_token }` |
| `/auth/login` | POST | ✅ | `{ message, user, access_token }` |
| `/auth/profile` | GET | ❌ (cần JWT) | `{ id, email, fullName, role, ... }` |
| `/auth/google` | GET | ✅ | Redirect sang Google |
| `/auth/google/callback` | GET | ✅ | Redirect về `${FRONTEND_URL}/auth/callback?token=...` |

JWT payload: `{ sub: userId, email, role }`. Hết hạn 7 ngày.

### Frontend storefront (đang có gì)

- ✅ Trang `/dang-nhap` (`src/app/dang-nhap/page.tsx`)
- ✅ `AuthForm.tsx` đã gọi `/auth/login` + `/auth/register` thật, lưu
  `access_token` + `user` vào `localStorage`, rồi `window.location.href = "/"`.
- ✅ Nút Google → redirect `${API_BASE}/auth/google`.
- ❌ **Navbar không biết user đã login** — luôn hiện nút "Đăng nhập".
- ❌ **Không có nút Đăng xuất** ở đâu cả.
- ❌ **Không có route `/auth/callback`** — đăng nhập Google sẽ vỡ (vì
  backend redirect tới `/auth/callback?token=...` mà route này chưa tồn tại).
- ❌ Token lưu rồi nhưng chưa có helper nào tự gắn `Authorization` cho
  request API tiếp theo.

---

## 2. Flow tổng quát sau khi xong

### Flow A — Đăng ký bằng email/password

```
User mở /dang-nhap
  ↓ chuyển tab "Đăng ký", nhập email + password + tên
  ↓ submit
AuthForm gọi useAuth().register(email, pass, fullName)
  ↓ context gọi POST /auth/register tới backend
Backend tạo user, hash bcrypt, trả { user, access_token }
  ↓ context lưu vào state + localStorage
  ↓ AuthForm router.push("/")
Navbar re-render: thấy user trong context → hiện UserMenu (tên + dropdown)
```

### Flow B — Đăng nhập bằng email/password

Giống Flow A nhưng endpoint là `POST /auth/login`.

### Flow C — Đăng nhập bằng Google

```
User bấm nút Google ở /dang-nhap
  ↓ window.location.href = http://localhost:3000/auth/google
Backend redirect tới trang đăng nhập Google
  ↓ user chấp nhận
Google redirect về backend: /auth/google/callback
Backend tạo JWT, redirect: http://localhost:3001/auth/callback?token=eyJ...
  ↓ ← đây là chỗ MỚI cần tạo ở frontend
Trang /auth/callback (client component):
  1. Đọc token từ query string
  2. Gọi GET /auth/profile với Bearer <token> để lấy user info
  3. context.loginWithToken(token) → lưu vào state + localStorage
  4. router.push("/")
Navbar re-render: có user → UserMenu.
```

### Flow D — Đăng xuất

```
User bấm "Đăng xuất" trong dropdown UserMenu
  ↓ useAuth().logout()
Context: clear state + xóa localStorage
  ↓ Navbar re-render: không có user → hiện link "Đăng nhập"
```

### Flow E — Reload trang (giữ login)

```
App mount
  ↓ AuthProvider useEffect chạy
  ↓ đọc localStorage "access_token" + "user"
  ↓ nếu có → set state user (đồng thời có thể gọi /auth/profile để verify token còn hạn)
Navbar hiển thị đúng trạng thái ngay từ lần render đầu tiên (sau hydrate)
```

---

## 3. Danh sách file sẽ tạo / sửa

### Tạo mới (6 file)

#### 3.1 `frontend/src/types/user.ts`

Định nghĩa shape của user. Tách riêng để tái sử dụng.

```ts
export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  avatar?: string;
  role: UserRole;
}
```

**Tại sao có file này?** Cả AuthContext, UserMenu, callback page đều cần
type này — đặt riêng tránh import vòng.

#### 3.2 `frontend/src/contexts/AuthContext.tsx`

Quản lý auth state ở client. Đây là trái tim của tính năng này.

**Shape:**

```ts
interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;          // true khi đang hydrate hoặc đang call API
  login: (email, password) => Promise<void>;
  register: (email, password, fullName?) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;  // cho Google callback
  logout: () => void;
}
```

**Logic chính:**

- `useState` cho user, loading.
- `useEffect` lần đầu mount: đọc `localStorage.getItem("access_token")`
  và `"user"` → nếu có, set state. (Optional: gọi `/auth/profile` để
  verify token chưa hết hạn — nếu 401 thì xóa luôn).
- `login(email, password)`:
  1. Gọi `apiLogin(email, password)` từ `auth-api.ts`.
  2. Lưu `access_token`, `user` vào localStorage.
  3. setState user.
- `register(...)`: tương tự, gọi `apiRegister`.
- `loginWithToken(token)`:
  1. Lưu token vào localStorage.
  2. Gọi `apiGetProfile(token)` để lấy user.
  3. Lưu user vào localStorage + setState.
- `logout()`: xóa localStorage 2 key, setState user = null.

**Sử dụng:**

```tsx
const { user, login, logout } = useAuth();
```

`useAuth()` ném lỗi nếu dùng ngoài provider — bắt bug sớm.

#### 3.3 `frontend/src/lib/auth-api.ts`

Functions thuần fetch — tách khỏi context để dễ test.

```ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function apiLogin(email, password): Promise<{ user, access_token }>
export async function apiRegister(email, password, fullName?): Promise<{ user, access_token }>
export async function apiGetProfile(token): Promise<AuthUser>
```

Mỗi function ném `Error` với `.message` từ backend nếu res không ok.

#### 3.4 `frontend/src/app/auth/callback/page.tsx`

Route bắt redirect từ backend sau Google OAuth.

```tsx
"use client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = sp.get("token");
    if (!token) { setError("Thiếu token"); return; }
    loginWithToken(token)
      .then(() => router.replace("/"))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div>Lỗi: {error}</div>;
  return <div>Đang đăng nhập với Google...</div>;  // spinner đẹp hơn ở phase polish
}
```

**Tại sao cần?** Backend redirect tới URL này. Hiện không tồn tại →
Next 404. Đây là cầu nối duy nhất để Google OAuth chạy được.

#### 3.5 `frontend/src/components/Navbar/UserMenu.tsx`

Component thay thế nút "Đăng nhập" trong Navbar.

```tsx
"use client";

interface Props { variant: 'desktop' | 'mobile'; onNavigate?: () => void; }

export default function UserMenu({ variant, onNavigate }: Props) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) {
    // Render link "Đăng nhập" giữ nguyên style như Navbar cũ
    return <Link href="/dang-nhap" ...>...</Link>;
  }

  // Đã login: avatar + dropdown
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}>
        <Avatar /> {user.fullName || user.email}
      </button>
      {open && (
        <div className="absolute ...">
          <Link href="/tai-khoan">Tài khoản của tôi</Link>
          <Link href="/don-hang">Đơn hàng</Link>  {/* placeholder */}
          <button onClick={() => { logout(); onNavigate?.(); }}>
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
```

`variant` để giữ đúng style desktop vs mobile (2 chỗ cần thay trong
Navbar hiện tại).

#### 3.6 (Optional) `frontend/src/lib/api.ts`

**Nếu file này đã tồn tại** (theo Explore trước đó là có `apiGet`),
thì *sửa* thay vì tạo:

```ts
export async function authFetch(path: string, init: RequestInit = {}) {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("access_token")
    : null;
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
```

Helper này dùng sau này khi storefront cần gọi API có auth (giỏ hàng,
đặt hàng, profile...). **Chưa dùng ngay trong scope này** — chỉ để sẵn.

---

### Sửa file có sẵn (3 file)

#### 3.7 `frontend/src/app/layout.tsx`

Bọc body trong `<AuthProvider>`.

```tsx
import { AuthProvider } from "@/contexts/AuthContext";

// ...
<body>
  <AuthProvider>
    {children}
  </AuthProvider>
</body>
```

#### 3.8 `frontend/src/components/Navbar/Navbar.tsx`

Hiện có 2 chỗ hardcoded link `/dang-nhap`:

- Dòng ~227-234 (desktop): `<Link href="/dang-nhap">...Đăng nhập</Link>`
- Dòng ~283-290 (mobile menu): tương tự

Thay cả 2 thành:

```tsx
<UserMenu variant="desktop" />        {/* hoặc "mobile" */}
```

UserMenu tự lo cả 2 trạng thái (chưa login → link cũ, đã login → dropdown).

#### 3.9 `frontend/src/components/auth/AuthForm.tsx`

Hiện đang:
- Tự gọi fetch.
- Tự `localStorage.setItem(...)`.
- `window.location.href = "/"`.

Sửa thành:

```tsx
const { login, register } = useAuth();
const router = useRouter();

// trong onSubmit, sau validate:
if (isLogin) {
  await login(email, password);
} else {
  await register(email, password, fullName || undefined);
}
setSuccess(...);
setTimeout(() => router.push("/"), 800);
```

**Tại sao đổi?**
- Context lo toàn bộ phần lưu state. AuthForm giờ chỉ là UI + gọi 1 hàm.
- `router.push` (next/navigation) giữ SPA — không full reload nên Navbar
  re-render mượt.
- Tránh duplicate logic localStorage (sau này đổi sang cookie chỉ phải sửa
  1 chỗ trong context).

Validation client-side (≥6 ký tự, confirm password match) **giữ nguyên**.

---

## 4. Thứ tự thực hiện đề xuất

1. Tạo `types/user.ts` (nhanh, không phụ thuộc gì).
2. Tạo `lib/auth-api.ts`.
3. Tạo `contexts/AuthContext.tsx`.
4. Sửa `app/layout.tsx` bọc Provider.
5. Sửa `AuthForm.tsx` dùng context — **test ngay**: đăng nhập/đăng ký
   bằng email/password thấy lưu localStorage và redirect được.
6. Tạo `Navbar/UserMenu.tsx` + sửa `Navbar.tsx` — **test**: navbar
   chuyển đổi đúng giữa 2 trạng thái, logout chạy.
7. Tạo `app/auth/callback/page.tsx` — **test**: Google OAuth (cần backend
   có `GOOGLE_CLIENT_ID/SECRET` trong `.env`).
8. (Optional) thêm `authFetch` vào `lib/api.ts` cho dùng sau.

Mỗi bước test xong mới qua bước tiếp.

---

## 5. Verification checklist

```
[ ] cd backend && npm run start:dev  → :3000
[ ] cd frontend && npm run dev       → :3001

[ ] Đăng ký test@a.com / 123456 / "Test User"
    → toast success, redirect "/", Navbar hiện "Test User"

[ ] DevTools → Application → Local Storage:
    → có "access_token" (JWT chuỗi dài)
    → có "user" (JSON)

[ ] Reload trang → Navbar VẪN hiện "Test User" (không nháy về "Đăng nhập")

[ ] Click dropdown → "Đăng xuất"
    → localStorage trống
    → Navbar về nút "Đăng nhập"

[ ] Đăng nhập lại → vào được

[ ] Sai mật khẩu → hiện đỏ "Email hoặc mật khẩu không đúng"

[ ] (Nếu có Google config) Bấm Google
    → redirect Google → callback /auth/callback?token=...
    → spinner ngắn → redirect "/" → navbar có user
```

---

## 6. Không trong scope (làm sau)

- Trang `/tai-khoan` chi tiết (đổi tên, đổi mật khẩu, đổi avatar).
- Trang `/don-hang` (lịch sử đơn).
- Route guard server-side bằng `middleware.ts` (hiện chỉ guard
  client-side, dễ bypass — chấp nhận cho MVP storefront vì chưa có data
  nhạy cảm ở storefront).
- Refresh token — JWT 7 ngày là đủ cho prototype.
- Đổi localStorage → httpOnly cookie (cần khi đưa lên production).
- Auth cho admin panel — làm session riêng.

---

## 7. Lưu ý kỹ thuật

- **'use client'** ở tất cả file dùng `useAuth()` hoặc localStorage.
- Khi đọc localStorage trong hook, **luôn check `typeof window !== "undefined"`**
  vì Next có thể render server-side trước.
- Navbar đang là `"use client"` (có useState, useEffect) — OK để dùng
  context.
- Trang `/dang-nhap` (AuthForm) cũng đã `"use client"`.
- Layout root là server component — OK bọc Provider client component vào
  được (Next cho phép).
- Token bị compromise (XSS) sẽ lộ — đây là trade-off của localStorage.
  Khắc phục dài hạn: httpOnly cookie + CSRF token.
