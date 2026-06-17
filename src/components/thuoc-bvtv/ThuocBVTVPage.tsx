"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import ThuocBVTVHero from "./ThuocBVTVHero";

/* ── Typings ── */
interface Product {
  id: number;
  name: string;
  category: string;        // group code
  categoryLabel: string;   // group label
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  ratingCount: number;
  badge?: string;
  toxicity: "I" | "II" | "III" | "IV"; // WHO toxicity class
  targetPests: string[];
  description: string;
  usageInstructions: string;
  preHarvest: string;
  specs: {
    volume: string;
    origin: string;
    form: string;
    activeIngredient: string;
  };
}

/* ── Realistic Mock Data ── */
const BRANDS = ["Syngenta", "Bayer", "Lộc Trời", "Adama", "Việt Thắng", "Sumitomo", "Nông Phát"];

const PESTICIDES: Product[] = [
  {
    id: 201,
    name: "Chess® 50WG đặc trị rầy nâu",
    category: "TruSau",
    categoryLabel: "Thuốc trừ sâu",
    brand: "Syngenta",
    price: 95000,
    originalPrice: 110000,
    rating: 5,
    ratingCount: 32,
    badge: "Bán chạy",
    toxicity: "IV",
    targetPests: ["Rầy nâu", "Rầy lưng trắng", "Bọ trĩ"],
    description:
      "Thuốc trừ rầy nâu thế hệ mới hoạt chất Pymetrozine. Cơ chế ngừng ăn ngay sau khi tiếp xúc, rầy chết trong 2-3 ngày, an toàn cho thiên địch và ong mật.",
    usageInstructions:
      "Pha 7,5g/bình 20L. Phun khi rầy ở tuổi 2-3, mật độ 750-1000 con/m². Phun ướt đều thân, lá và gốc lúa.",
    preHarvest: "Cách ly 7 ngày trước thu hoạch",
    specs: {
      volume: "Gói 7,5g / 15g / 100g",
      origin: "Thuỵ Sĩ (Syngenta)",
      form: "Hạt phân tán trong nước (WG)",
      activeIngredient: "Pymetrozine 50% w/w",
    },
  },
  {
    id: 202,
    name: "Filia® 525SE phòng trị đạo ôn",
    category: "TruBenh",
    categoryLabel: "Thuốc trừ bệnh",
    brand: "Syngenta",
    price: 165000,
    rating: 4.9,
    ratingCount: 24,
    badge: "Hot",
    toxicity: "III",
    targetPests: ["Đạo ôn lá", "Đạo ôn cổ bông", "Lem lép hạt"],
    description:
      "Hỗn hợp Tricyclazole + Propiconazole, vừa phòng vừa trị đạo ôn cổ bông cực mạnh, lưu dẫn nội hấp, kéo dài 14-21 ngày.",
    usageInstructions:
      "Pha 25ml/bình 25L. Phun 2 lần: trước trổ 5-7 ngày và sau trổ đều. Lượng nước 400-500L/ha.",
    preHarvest: "Cách ly 14 ngày",
    specs: {
      volume: "Chai 240ml / 480ml",
      origin: "Thuỵ Sĩ",
      form: "Hỗn dịch nhũ dầu (SE)",
      activeIngredient: "Tricyclazole 300g/L + Propiconazole 225g/L",
    },
  },
  {
    id: 203,
    name: "Vimicpc 25WP trừ rầy phổ rộng",
    category: "TruSau",
    categoryLabel: "Thuốc trừ sâu",
    brand: "Việt Thắng",
    price: 78000,
    rating: 4.6,
    ratingCount: 41,
    badge: "Giá tốt",
    toxicity: "III",
    targetPests: ["Rầy nâu", "Sâu cuốn lá", "Bọ xít"],
    description:
      "Thuốc trừ sâu nội địa, hoạt chất Isoprocarb tiếp xúc, vị độc tác động nhanh. Phù hợp giai đoạn lúa đẻ nhánh đến làm đòng.",
    usageInstructions:
      "Pha 40-50g/bình 25L. Phun ướt đều thân lá. Sử dụng 0,8-1,2 kg/ha.",
    preHarvest: "Cách ly 14 ngày",
    specs: {
      volume: "Gói 50g / 100g / 1kg",
      origin: "Việt Nam",
      form: "Bột thấm nước (WP)",
      activeIngredient: "Isoprocarb 25% w/w",
    },
  },
  {
    id: 204,
    name: "Anvil® 5SC trị khô vằn, vàng lá",
    category: "TruBenh",
    categoryLabel: "Thuốc trừ bệnh",
    brand: "Syngenta",
    price: 125000,
    originalPrice: 140000,
    rating: 4.8,
    ratingCount: 28,
    badge: "Khuyên dùng",
    toxicity: "III",
    targetPests: ["Khô vằn", "Vàng lá chín sớm", "Lem lép"],
    description:
      "Hexaconazole nội hấp lưu dẫn, đặc trị khô vằn và các bệnh nấm hại lá. An toàn cây lúa giai đoạn làm đòng.",
    usageInstructions:
      "Pha 20-25ml/bình 25L. Phun 2 lần cách nhau 7-10 ngày khi bệnh chớm xuất hiện.",
    preHarvest: "Cách ly 14 ngày",
    specs: {
      volume: "Chai 240ml / 480ml / 1L",
      origin: "Thuỵ Sĩ",
      form: "Hỗn dịch đậm đặc (SC)",
      activeIngredient: "Hexaconazole 50g/L",
    },
  },
  {
    id: 205,
    name: "Sofit® 300EC trừ cỏ tiền nảy mầm",
    category: "TruCo",
    categoryLabel: "Thuốc trừ cỏ",
    brand: "Syngenta",
    price: 220000,
    rating: 4.7,
    ratingCount: 19,
    toxicity: "IV",
    targetPests: ["Cỏ lồng vực", "Cỏ đuôi phụng", "Cỏ chác lác"],
    description:
      "Thuốc trừ cỏ tiền nảy mầm cho lúa sạ. Pretilachlor + Fenclorim, an toàn tuyệt đối cho hạt lúa.",
    usageInstructions:
      "Phun 1-3 ngày sau sạ. Liều 1,0-1,2 L/ha. Giữ ruộng đủ ẩm, không để khô nứt nẻ.",
    preHarvest: "Không áp dụng (thuốc tiền nảy mầm)",
    specs: {
      volume: "Chai 480ml / 1L",
      origin: "Thuỵ Sĩ",
      form: "Nhũ dầu (EC)",
      activeIngredient: "Pretilachlor 300g/L + Fenclorim",
    },
  },
  {
    id: 206,
    name: "Karate® 2.5EC trừ sâu cuốn lá",
    category: "TruSau",
    categoryLabel: "Thuốc trừ sâu",
    brand: "Syngenta",
    price: 88000,
    rating: 4.8,
    ratingCount: 35,
    badge: "Mới",
    toxicity: "II",
    targetPests: ["Sâu cuốn lá nhỏ", "Sâu đục bẹ", "Bọ xít"],
    description:
      "Lambda-cyhalothrin tiếp xúc, vị độc, xông hơi nhẹ. Hiệu lực nhanh, kéo dài 7-10 ngày, lưu lượng thấp.",
    usageInstructions:
      "Pha 15-20ml/bình 25L. Phun khi sâu non tuổi 1-2, mật độ 20-30 con/m².",
    preHarvest: "Cách ly 14 ngày",
    specs: {
      volume: "Chai 100ml / 240ml",
      origin: "Thuỵ Sĩ",
      form: "Nhũ dầu (EC)",
      activeIngredient: "Lambda-cyhalothrin 25g/L",
    },
  },
  {
    id: 207,
    name: "Regent® 800WG sâu đục thân",
    category: "TruSau",
    categoryLabel: "Thuốc trừ sâu",
    brand: "Bayer",
    price: 145000,
    originalPrice: 165000,
    rating: 4.9,
    ratingCount: 22,
    badge: "Hàng chất lượng",
    toxicity: "II",
    targetPests: ["Sâu đục thân", "Sâu cuốn lá", "Bọ trĩ"],
    description:
      "Fipronil tác động hệ thần kinh côn trùng, hiệu quả vượt trội với sâu đục thân lúa hai chấm và sâu non chống chịu.",
    usageInstructions:
      "Pha 1g/bình 16L. Phun khi bướm xuất hiện rộ + 5-7 ngày. Lượng nước 400L/ha.",
    preHarvest: "Cách ly 14 ngày",
    specs: {
      volume: "Gói 0,8g / 1g / 800g",
      origin: "Đức (Bayer)",
      form: "Hạt phân tán trong nước (WG)",
      activeIngredient: "Fipronil 80% w/w",
    },
  },
  {
    id: 208,
    name: "Tilt® Super 300EC phổ rộng",
    category: "TruBenh",
    categoryLabel: "Thuốc trừ bệnh",
    brand: "Syngenta",
    price: 195000,
    rating: 4.7,
    ratingCount: 18,
    toxicity: "III",
    targetPests: ["Đạo ôn", "Khô vằn", "Lem lép hạt", "Vàng lá"],
    description:
      "Propiconazole + Difenoconazole phổ rộng, một lần phun trị nhiều bệnh. Lưu dẫn hai chiều, hiệu quả 14-21 ngày.",
    usageInstructions:
      "Pha 15-20ml/bình 25L. Phun trước trổ 5-7 ngày và sau trổ. Lượng nước 400-500L/ha.",
    preHarvest: "Cách ly 14 ngày",
    specs: {
      volume: "Chai 240ml / 480ml",
      origin: "Thuỵ Sĩ",
      form: "Nhũ dầu (EC)",
      activeIngredient: "Propiconazole 150g/L + Difenoconazole 150g/L",
    },
  },
  {
    id: 209,
    name: "Sirius® 10WP trừ cỏ hậu nảy mầm",
    category: "TruCo",
    categoryLabel: "Thuốc trừ cỏ",
    brand: "Bayer",
    price: 175000,
    rating: 4.6,
    ratingCount: 14,
    toxicity: "IV",
    targetPests: ["Cỏ lồng vực", "Cỏ năng", "Cỏ chác lác"],
    description:
      "Pyrazosulfuron-ethyl chọn lọc, an toàn lúa, diệt cỏ rộng phổ giai đoạn 7-15 ngày sau sạ.",
    usageInstructions:
      "Pha 5-8g/bình 25L. Phun khi cỏ 2-3 lá thật. Giữ nước ngập ruộng 3-5cm.",
    preHarvest: "Không áp dụng",
    specs: {
      volume: "Gói 5g / 100g",
      origin: "Đức (Bayer)",
      form: "Bột thấm nước (WP)",
      activeIngredient: "Pyrazosulfuron-ethyl 10%",
    },
  },
];

/* ── Helpers ── */
function getToxicityInfo(level: "I" | "II" | "III" | "IV") {
  switch (level) {
    case "I": return { label: "Rất độc", color: "bg-red-100 text-red-700 border-red-200" };
    case "II": return { label: "Độc cao", color: "bg-orange-100 text-orange-700 border-orange-200" };
    case "III": return { label: "Độc TB", color: "bg-amber-100 text-amber-700 border-amber-200" };
    case "IV": return { label: "Ít độc", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
  }
}

export default function ThuocBVTVPage() {
  /* ── State ── */
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedTox, setSelectedTox] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [sortBy, setSortBy] = useState("mac-dinh");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: "" });
  const [cartBadge, setCartBadge] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  /* ── Category counts ── */
  const categorySummary = useMemo(() => {
    const counts: { [key: string]: number } = { "Tất cả": PESTICIDES.length };
    PESTICIDES.forEach((p) => {
      counts[p.categoryLabel] = (counts[p.categoryLabel] || 0) + 1;
    });
    return counts;
  }, []);

  /* ── Handlers ── */
  const handleBrandToggle = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    setPage(1);
  };

  const handleToxToggle = (tox: string) => {
    setSelectedTox((prev) =>
      prev.includes(tox) ? prev.filter((t) => t !== tox) : [...prev, tox]
    );
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setActiveCategory("Tất cả");
    setSelectedBrands([]);
    setSelectedTox([]);
    setPriceRange([0, 500000]);
    setSortBy("mac-dinh");
    setPage(1);
  };

  /* ── Filter & Sort ── */
  const filteredProducts = useMemo(() => {
    return PESTICIDES.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.targetPests.some((t) => t.toLowerCase().includes(q));
      const matchCat = activeCategory === "Tất cả" || p.categoryLabel === activeCategory;
      const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
      const matchTox = selectedTox.length === 0 || selectedTox.includes(p.toxicity);
      const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchSearch && matchCat && matchBrand && matchTox && matchPrice;
    }).sort((a, b) => {
      if (sortBy === "gia-tang") return a.price - b.price;
      if (sortBy === "gia-giam") return b.price - a.price;
      if (sortBy === "danh-gia") return b.rating - a.rating;
      if (sortBy === "ban-chay") return b.ratingCount - a.ratingCount;
      return 0;
    });
  }, [search, activeCategory, selectedBrands, selectedTox, priceRange, sortBy]);

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, page]);

  /* ── Toast & cart ── */
  const triggerToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  const handleAddToCart = (product: Product, qty: number) => {
    setCartBadge((prev) => prev + qty);
    triggerToast(`Đã thêm ${qty} sản phẩm "${product.name}" vào giỏ hàng.`);
    setSelectedProduct(null);
    setQuantity(1);
  };

  return (
    <div className="bg-[#e5e7eb] min-h-screen text-gray-800 pb-16 font-sans">
      {/* ── Cart Float Badge ── */}
      {cartBadge > 0 && (
        <div className="fixed bottom-6 right-6 z-40 bg-[#007e42] text-white flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl animate-bounce hover:scale-105 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L1.01 3H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
          </svg>
          <span className="font-bold text-sm">Giỏ hàng: {cartBadge} sản phẩm</span>
        </div>
      )}

      {/* ── Toast ── */}
      {toast.show && (
        <div className="fixed top-20 right-6 z-50 bg-[#007e42] border border-[#005f32] text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in-down">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="font-bold text-sm">Thao tác thành công!</p>
            <p className="text-xs text-emerald-100">{toast.msg}</p>
          </div>
        </div>
      )}

      {/* ── 1. Hero ── */}
      <ThuocBVTVHero />

      {/* ── 2. Main Workspace ── */}
      <section id="catalog" className="max-w-370 mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Desktop Sidebar Filter ── */}
          <aside className="w-full lg:w-64 shrink-0 hidden lg:block space-y-6">

            {/* Search */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tìm kiếm</h3>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 pl-9 text-sm focus:border-[#007e42] outline-none transition"
                  placeholder="Tên thuốc, dịch hại..."
                />
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="absolute left-3 top-3 text-gray-400" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.11-.11zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                </svg>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nhóm Thuốc</h3>
              <div className="flex flex-col gap-1.5">
                {Object.keys(categorySummary).map((catName) => (
                  <button
                    key={catName}
                    onClick={() => {
                      setActiveCategory(catName);
                      setPage(1);
                    }}
                    className={`relative flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition text-left ${activeCategory === catName ? "bg-emerald-50 text-[#007e42] before:absolute before:left-0 before:top-1/2 before:h-4 before:w-1 before:-translate-y-1/2 before:rounded-r-full before:bg-[#007e42]" : "hover:bg-gray-50 text-gray-600"}`}
                  >
                    <span>{catName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] ${activeCategory === catName ? "bg-[#007e42] text-white" : "bg-gray-100 text-gray-400"}`}>
                      {categorySummary[catName]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Toxicity */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Độ Độc (Theo WHO)</h3>
              <div className="flex flex-col gap-2">
                {(["I", "II", "III", "IV"] as const).map((tox) => {
                  const info = getToxicityInfo(tox);
                  return (
                    <label key={tox} className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-gray-600 select-none">
                      <input
                        type="checkbox"
                        checked={selectedTox.includes(tox)}
                        onChange={() => handleToxToggle(tox)}
                        className="rounded text-[#007e42] focus:ring-[#007e42] w-4 h-4"
                      />
                      <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${info.color}`}>
                        Nhóm {tox}
                      </span>
                      <span className="text-gray-500">{info.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Brands */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Thương Hiệu</h3>
              <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                {BRANDS.map((brand) => (
                  <label key={brand} className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-gray-600 select-none">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
                      className="rounded text-[#007e42] focus:ring-[#007e42] w-4 h-4"
                    />
                    {brand}
                  </label>
                ))}
              </div>
            </div>

            {/* Price slider */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Khoảng Giá</h3>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="500000"
                  step="10000"
                  value={priceRange[1]}
                  onChange={(e) => {
                    setPriceRange([priceRange[0], parseInt(e.target.value)]);
                    setPage(1);
                  }}
                  className="w-full accent-[#007e42] h-1.5 rounded bg-gray-200 appearance-none cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold">
                  <span>Dưới 500k</span>
                  <span className="text-[#007e42]">Tối đa: {priceRange[1].toLocaleString("vi-VN")} đ</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleClearFilters}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold py-2.5 rounded-xl border border-gray-100 transition"
            >
              Thiết lập lại bộ lọc
            </button>
          </aside>

          {/* ── Mobile Filter ── */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 lg:hidden flex justify-end">
              <div className="bg-white w-80 h-full p-6 overflow-y-auto space-y-6 animate-slide-in-right">
                <div className="flex items-center justify-between border-b pb-4">
                  <h3 className="text-sm font-black text-gray-800">Bộ Lọc Thuốc BVTV</h3>
                  <button onClick={() => setMobileFiltersOpen(false)} className="text-gray-500 text-sm font-bold p-1">Đóng ×</button>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase">Tìm kiếm</h4>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full bg-gray-50 border rounded-xl py-2 px-3 text-xs"
                    placeholder="Tên thuốc, dịch hại..."
                  />
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase">Nhóm thuốc</h4>
                  <div className="flex flex-col gap-1">
                    {Object.keys(categorySummary).map((catName) => (
                      <button
                        key={catName}
                        onClick={() => { setActiveCategory(catName); setPage(1); }}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition text-left ${activeCategory === catName ? "bg-emerald-50 text-[#007e42]" : "text-gray-600"}`}
                      >
                        <span>{catName}</span>
                        <span className="text-[10px] text-gray-400">({categorySummary[catName]})</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase">Độ độc</h4>
                  <div className="flex flex-col gap-1.5">
                    {(["I", "II", "III", "IV"] as const).map((tox) => {
                      const info = getToxicityInfo(tox);
                      return (
                        <label key={tox} className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-600">
                          <input
                            type="checkbox"
                            checked={selectedTox.includes(tox)}
                            onChange={() => handleToxToggle(tox)}
                          />
                          <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${info.color}`}>
                            Nhóm {tox} - {info.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase">Thương hiệu</h4>
                  <div className="flex flex-col gap-1.5">
                    {BRANDS.map((brand) => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-600">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => handleBrandToggle(brand)}
                        />
                        {brand}
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => { handleClearFilters(); setMobileFiltersOpen(false); }}
                  className="w-full bg-[#007e42] text-white text-xs font-bold py-2.5 rounded-xl"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          )}

          {/* ── Product Display ── */}
          <div className="flex-1 flex flex-col gap-5">

            {/* Toolbar */}
            <div className="bg-white rounded-2xl border border-gray-100 px-5 py-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-xl"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.124.325L9 9.3l-.001.002v3.698a.5.5 0 0 1-.268.447l-2 1a.5.5 0 0 1-.732-.447V9.302L1.624 3.825A.5.5 0 0 1 1.5 3.5v-2z" />
                  </svg>
                  Lọc Sản Phẩm
                </button>

                <p className="text-xs font-bold text-gray-400">
                  Hiển thị <span className="text-gray-800">{filteredProducts.length > 0 ? (page - 1) * itemsPerPage + 1 : 0} – {Math.min(page * itemsPerPage, filteredProducts.length)}</span> trong số <span className="text-gray-800">{filteredProducts.length}</span> sản phẩm thuốc BVTV
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <div className="bg-gray-50 border border-gray-100 p-0.5 rounded-xl flex">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition ${viewMode === "grid" ? "bg-white text-[#007e42] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition ${viewMode === "list" ? "bg-white text-[#007e42] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
                    </svg>
                  </button>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  className="bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-700 outline-none focus:border-[#007e42]"
                >
                  <option value="mac-dinh">Sắp xếp: Mặc định</option>
                  <option value="gia-tang">Giá tăng dần</option>
                  <option value="gia-giam">Giá giảm dần</option>
                  <option value="danh-gia">Đánh giá tốt nhất</option>
                  <option value="ban-chay">Độ phổ biến</option>
                </select>
              </div>
            </div>

            {/* Empty */}
            {filteredProducts.length === 0 && (
              <div className="bg-white rounded-3xl p-16 border border-dashed border-gray-200 text-center flex flex-col items-center justify-center gap-3">
                <div className="bg-emerald-50 text-[#007e42] p-4 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                  </svg>
                </div>
                <h3 className="font-extrabold text-gray-800 text-base">Không tìm thấy loại thuốc phù hợp</h3>
                <p className="text-xs text-gray-400 max-w-sm">Hãy thử thay đổi điều kiện lọc, độ độc hoặc khoảng giá.</p>
                <button
                  onClick={handleClearFilters}
                  className="bg-[#007e42] hover:bg-[#005f32] text-white text-xs font-bold px-4 py-2 rounded-xl mt-2 transition"
                >
                  Xóa bộ lọc để thử lại
                </button>
              </div>
            )}

            {/* Grid */}
            {viewMode === "grid" && filteredProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProducts.map((p) => {
                  const tox = getToxicityInfo(p.toxicity);
                  return (
                    <div
                      key={p.id}
                      className="bg-white/40 rounded-xl border border-transparent overflow-hidden hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative"
                    >
                      {p.badge && (
                        <span className="absolute top-3 left-3 z-10 bg-[#007e42] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-lg shadow-sm">
                          {p.badge}
                        </span>
                      )}

                      <span className={`absolute top-3 right-3 z-10 text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border ${tox.color}`}>
                        Nhóm {p.toxicity}
                      </span>

                      <div className="h-64 bg-gradient-to-br from-[#ebf5ef] to-[#cce8d9] flex items-center justify-center p-6 relative overflow-hidden">
                        <Image
                          src="/thuoc.png"
                          alt={p.name}
                          width={160}
                          height={160}
                          className="object-contain filter drop-shadow-md group-hover:scale-110 transition duration-300"
                        />

                        <div className="absolute inset-0 bg-[#005f32]/25 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center gap-2.5">
                          <button
                            onClick={() => setSelectedProduct(p)}
                            className="bg-white hover:bg-emerald-50 text-[#007e42] p-2.5 rounded-full shadow-lg transition active:scale-90"
                            title="Xem chi tiết nhanh"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                              <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                              {p.brand}
                            </span>
                            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              {p.categoryLabel}
                            </span>
                          </div>

                          <h4
                            onClick={() => setSelectedProduct(p)}
                            className="font-extrabold text-sm text-gray-800 line-clamp-2 min-h-[2.5rem] hover:text-[#007e42] cursor-pointer transition uppercase"
                          >
                            {p.name}
                          </h4>

                          <p className="text-[10px] text-gray-500 line-clamp-1">
                            <span className="font-bold text-gray-600">Đặc trị:</span> {p.targetPests.join(", ")}
                          </p>

                          <div className="flex items-center gap-1">
                            <span className="text-amber-500 flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <svg
                                  key={i}
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="10"
                                  height="10"
                                  fill={i < Math.floor(p.rating) ? "currentColor" : "none"}
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                </svg>
                              ))}
                            </span>
                            <span className="text-[10px] text-gray-400">({p.ratingCount})</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-50 flex items-center justify-between gap-1">
                          <div>
                            <p className="text-[#007e42] font-black text-base">{p.price.toLocaleString("vi-VN")} đ</p>
                            {p.originalPrice && (
                              <p className="text-[10px] text-gray-400 line-through">
                                {p.originalPrice.toLocaleString("vi-VN")} đ
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => handleAddToCart(p, 1)}
                            className="bg-[#007e42]/10 hover:bg-[#007e42] text-[#007e42] hover:text-white p-2 rounded-xl transition active:scale-90"
                            title="Thêm vào giỏ"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L1.01 3H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* List */}
            {viewMode === "list" && filteredProducts.length > 0 && (
              <div className="flex flex-col gap-4">
                {paginatedProducts.map((p) => {
                  const tox = getToxicityInfo(p.toxicity);
                  return (
                    <div
                      key={p.id}
                      className="bg-white/40 rounded-2xl border border-transparent overflow-hidden hover:bg-white hover:shadow-md transition-all flex flex-col md:flex-row gap-5 items-center p-4 relative group"
                    >
                      {p.badge && (
                        <span className="absolute top-4 left-4 z-10 bg-[#007e42] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-lg">
                          {p.badge}
                        </span>
                      )}

                      <div className="w-full md:w-36 h-36 shrink-0 bg-gradient-to-br from-[#ebf5ef] to-[#cce8d9] rounded-xl flex items-center justify-center p-4 relative">
                        <Image
                          src="/thuoc.png"
                          alt={p.name}
                          width={100}
                          height={100}
                          className="object-contain filter drop-shadow-sm group-hover:scale-105 transition"
                        />
                      </div>

                      <div className="flex-1 flex flex-col md:flex-row justify-between w-full gap-4">
                        <div className="space-y-2 max-w-xl">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                              {p.brand}
                            </span>
                            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              {p.categoryLabel}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${tox.color}`}>
                              Nhóm {p.toxicity} - {tox.label}
                            </span>
                          </div>

                          <h4
                            onClick={() => setSelectedProduct(p)}
                            className="font-extrabold text-base text-gray-800 hover:text-[#007e42] cursor-pointer transition uppercase"
                          >
                            {p.name}
                          </h4>

                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {p.description}
                          </p>

                          <p className="text-[11px] text-gray-600">
                            <span className="font-bold">Đặc trị:</span> {p.targetPests.join(" • ")}
                          </p>

                          <div className="flex items-center gap-2">
                            <span className="text-amber-500 flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <svg
                                  key={i}
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="10"
                                  height="10"
                                  fill={i < Math.floor(p.rating) ? "currentColor" : "none"}
                                  stroke="currentColor"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                </svg>
                              ))}
                            </span>
                            <span className="text-[10px] text-gray-400">({p.ratingCount} bình luận)</span>
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col justify-between items-end md:w-44 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-4 shrink-0">
                          <div className="text-left md:text-right">
                            <p className="text-[#007e42] font-black text-lg">{p.price.toLocaleString("vi-VN")} đ</p>
                            {p.originalPrice && (
                              <p className="text-xs text-gray-400 line-through">
                                {p.originalPrice.toLocaleString("vi-VN")} đ
                              </p>
                            )}
                            <p className="text-[10px] text-gray-400 font-medium mt-1">{p.specs.volume.split(" / ")[0]}</p>
                          </div>

                          <div className="flex gap-2 mt-4 w-full">
                            <button
                              onClick={() => setSelectedProduct(p)}
                              className="flex-1 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs py-2 px-3 rounded-xl transition"
                            >
                              Xem nhanh
                            </button>
                            <button
                              onClick={() => handleAddToCart(p, 1)}
                              className="bg-[#007e42] hover:bg-[#005f32] text-white p-2 rounded-xl transition active:scale-95 flex items-center justify-center shrink-0 w-10 h-10"
                              title="Thêm vào giỏ"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L1.01 3H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:border-[#007e42] hover:text-[#007e42] transition disabled:opacity-40"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const n = i + 1;
                  return (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-black transition ${n === page ? "border-[#007e42] bg-[#007e42] text-white" : "border-gray-200 text-gray-600 hover:border-[#007e42] hover:text-[#007e42]"}`}
                    >
                      {n}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:border-[#007e42] hover:text-[#007e42] transition disabled:opacity-40"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Quick View Modal ── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-scale-up border border-gray-100 flex flex-col">

            <div className="p-4 md:px-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <span className="text-[10px] font-black uppercase bg-[#007e42] text-white px-2 py-0.5 rounded">
                Xem nhanh thuốc BVTV
              </span>
              <button
                onClick={() => { setSelectedProduct(null); setQuantity(1); }}
                className="text-gray-400 hover:text-gray-700 bg-white shadow-sm border border-gray-200 w-8 h-8 rounded-full flex items-center justify-center font-bold transition"
              >
                ×
              </button>
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">

              <div className="md:col-span-5 bg-gradient-to-br from-[#ebf5ef] to-[#cce8d9] rounded-2xl p-6 flex items-center justify-center h-72 md:h-96 relative">
                {selectedProduct.badge && (
                  <span className="absolute top-4 left-4 bg-[#007e42] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded">
                    {selectedProduct.badge}
                  </span>
                )}
                <span className={`absolute top-4 right-4 text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getToxicityInfo(selectedProduct.toxicity).color}`}>
                  Nhóm {selectedProduct.toxicity} - {getToxicityInfo(selectedProduct.toxicity).label}
                </span>
                <Image
                  src="/thuoc.png"
                  alt={selectedProduct.name}
                  width={200}
                  height={200}
                  className="object-contain filter drop-shadow-lg"
                />
              </div>

              <div className="md:col-span-7 flex flex-col justify-between gap-5">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {selectedProduct.brand} • {selectedProduct.categoryLabel}
                    </span>
                    <h3 className="text-xl md:text-2xl font-black text-gray-800 leading-tight uppercase mt-1">
                      {selectedProduct.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          fill={i < Math.floor(selectedProduct.rating) ? "currentColor" : "none"}
                          stroke="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                        </svg>
                      ))}
                    </span>
                    <span className="text-xs font-bold text-gray-400">({selectedProduct.ratingCount} bình luận)</span>
                  </div>

                  <div className="flex items-center gap-3 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-50">
                    <span className="text-2xl font-black text-[#007e42]">
                      {selectedProduct.price.toLocaleString("vi-VN")} đ
                    </span>
                    {selectedProduct.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {selectedProduct.originalPrice.toLocaleString("vi-VN")} đ
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Đặc trị dịch hại:</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProduct.targetPests.map((pest) => (
                        <span key={pest} className="text-[11px] font-bold text-[#007e42] bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                          {pest}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Mô tả sản phẩm:</h5>
                    <p className="text-xs text-gray-600 leading-relaxed">{selectedProduct.description}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                    <h5 className="text-xs font-black text-gray-500 uppercase tracking-wide">Thông số kỹ thuật:</h5>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                      <p className="text-gray-500">Quy cách: <span className="font-semibold text-gray-800">{selectedProduct.specs.volume}</span></p>
                      <p className="text-gray-500">Xuất xứ: <span className="font-semibold text-gray-800">{selectedProduct.specs.origin}</span></p>
                      <p className="text-gray-500">Dạng thuốc: <span className="font-semibold text-gray-800">{selectedProduct.specs.form}</span></p>
                      <p className="text-gray-500 col-span-2">Hoạt chất: <span className="font-semibold text-gray-800">{selectedProduct.specs.activeIngredient}</span></p>
                      <p className="text-gray-500 col-span-2">Cách ly: <span className="font-semibold text-red-600">{selectedProduct.preHarvest}</span></p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Hướng dẫn sử dụng:</h5>
                    <p className="text-xs text-gray-600 bg-amber-50/40 border border-amber-100 p-3 rounded-xl leading-relaxed">
                      {selectedProduct.usageInstructions}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white shrink-0">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3.5 py-2 font-black text-gray-500 hover:bg-gray-50 transition text-sm select-none"
                    >
                      -
                    </button>
                    <span className="px-5 py-2 font-bold text-sm text-gray-800 select-none">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-3.5 py-2 font-black text-gray-500 hover:bg-gray-50 transition text-sm select-none"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => handleAddToCart(selectedProduct, quantity)}
                      className="flex-1 bg-[#007e42] hover:bg-[#005f32] text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L1.01 3H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                      </svg>
                      Thêm Vào Giỏ Hàng - {(selectedProduct.price * quantity).toLocaleString("vi-VN")} đ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
