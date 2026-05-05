import Image from "next/image";

export default function HeroImage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200 shadow-sm">
        <div className="relative h-52 sm:h-64 lg:h-72">
          <Image
            src="/rice-banner.svg"
            alt="Canh dong lua xanh"
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-emerald-950/45 via-emerald-800/15 to-transparent" />
        <div className="absolute left-4 top-4 max-w-md sm:left-8 sm:top-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">
            LuaXanh
          </p>
          <h1 className="mt-2 text-xl font-bold text-white sm:text-3xl">
            Vat tu nong nghiep cho mua vu ben vung
          </h1>
        </div>
      </div>
    </section>
  );
}
