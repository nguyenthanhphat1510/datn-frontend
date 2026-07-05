/**
 * Hiệu ứng "bay vào giỏ hàng": clone ảnh sản phẩm rồi cho bay theo một cung
 * cong lên icon giỏ hàng (#cart-icon-target) ở Navbar. Chạy thuần DOM nên gọi
 * được từ bất kỳ chỗ nào (trang chi tiết, thẻ sản phẩm...) mà không đụng state.
 *
 * @param sourceEl  Phần tử nguồn (ảnh sản phẩm) — dùng để lấy vị trí xuất phát.
 * @param imgUrl    URL ảnh hiển thị khi bay. Nếu bỏ trống, thử lấy từ sourceEl.
 */
export function flyToCart(sourceEl: HTMLElement | null, imgUrl?: string) {
  if (typeof window === "undefined" || !sourceEl) return;

  // Tôn trọng người dùng tắt hiệu ứng chuyển động
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  // Desktop: icon giỏ hàng; mobile: nút hamburger (icon giỏ ẩn trong menu).
  // Chỉ nhận phần tử đang thực sự hiển thị (offsetParent != null).
  const desktop = document.getElementById("cart-icon-target");
  const fallback = document.getElementById("cart-icon-fallback");
  const target =
    desktop && desktop.offsetParent !== null ? desktop : fallback;
  if (!target) return; // Không tìm thấy đích → bỏ qua, không có hiệu ứng

  const src = sourceEl.getBoundingClientRect();
  const dst = target.getBoundingClientRect();

  // Kích thước viên bay: nhỏ gọn, dựa theo ảnh nguồn nhưng giới hạn lại
  const size = Math.min(90, Math.max(48, src.width * 0.4));

  const url =
    imgUrl ||
    (sourceEl instanceof HTMLImageElement ? sourceEl.src : "") ||
    sourceEl.querySelector("img")?.getAttribute("src") ||
    "";

  const fly = document.createElement("img");
  fly.src = url;
  fly.setAttribute("aria-hidden", "true");

  const startX = src.left + src.width / 2 - size / 2;
  const startY = src.top + src.height / 2 - size / 2;
  const dx = dst.left + dst.width / 2 - (startX + size / 2);
  const dy = dst.top + dst.height / 2 - (startY + size / 2);

  Object.assign(fly.style, {
    position: "fixed",
    left: `${startX}px`,
    top: `${startY}px`,
    width: `${size}px`,
    height: `${size}px`,
    objectFit: "contain",
    borderRadius: "12px",
    background: "#fff",
    boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
    padding: "4px",
    zIndex: "9999",
    pointerEvents: "none",
    animation: "flyToCart 0.75s cubic-bezier(0.5, -0.25, 0.35, 1) forwards",
  });
  // Biến bù trừ cho keyframe flyToCart (custom property → dùng setProperty)
  fly.style.setProperty("--fly-dx", `${dx}px`);
  fly.style.setProperty("--fly-dy", `${dy}px`);

  document.body.appendChild(fly);
  fly.addEventListener("animationend", () => fly.remove(), { once: true });
  // Phòng trường hợp animationend không bắn (tab ẩn...)
  window.setTimeout(() => fly.remove(), 1000);
}
