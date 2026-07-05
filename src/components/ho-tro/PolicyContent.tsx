"use client";

export type PolicySection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

/** Khối nội dung dạng văn bản chính sách — dùng chung cho đổi trả, bảo mật... */
export default function PolicyContent({
  sections,
  updatedAt,
}: {
  sections: PolicySection[];
  updatedAt: string;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
      <p className="mb-8 text-xs font-semibold uppercase tracking-wider text-emerald-600">
        Cập nhật lần cuối: {updatedAt}
      </p>

      <div className="space-y-10">
        {sections.map((s, i) => (
          <section key={i}>
            <h2 className="flex items-baseline gap-3 text-lg font-bold text-gray-800 sm:text-xl">
              <span className="text-emerald-500">{String(i + 1).padStart(2, "0")}.</span>
              {s.heading}
            </h2>
            {s.paragraphs?.map((p, j) => (
              <p key={j} className="mt-3 text-sm leading-relaxed text-gray-600">
                {p}
              </p>
            ))}
            {s.bullets && (
              <ul className="mt-3 space-y-2">
                {s.bullets.map((b, j) => (
                  <li key={j} className="flex gap-2.5 text-sm leading-relaxed text-gray-600">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
