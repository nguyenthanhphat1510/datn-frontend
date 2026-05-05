"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
	{ label: "San pham", href: "/san-pham" },
	{ label: "Danh muc", href: "/danh-muc" },
	{ label: "Kien thuc lua", href: "/bai-viet" },
	{ label: "Lien he", href: "/lien-he" },
] as const;

export default function Navbar() {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 border-b border-emerald-200 bg-linear-to-r from-emerald-50 via-lime-50 to-green-50/90 backdrop-blur">
			<div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
				<Link href="/" className="flex items-center gap-2">
					<span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-sm">
						LX
					</span>
					<span className="text-lg font-extrabold tracking-tight text-emerald-800">
						LuaXanh
					</span>
				</Link>

				<nav className="hidden items-center gap-6 md:flex">
					{navItems.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className="text-sm font-semibold text-emerald-900/80 transition hover:text-emerald-700"
						>
							{item.label}
						</Link>
					))}
				</nav>

				<div className="hidden items-center gap-3 md:flex">
					<Link
						href="/gio-hang"
						className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
					>
						Gio hang
					</Link>
					<Link
						href="/tu-van"
						className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
					>
						Tu van
					</Link>
				</div>

				<button
					type="button"
					onClick={() => setMenuOpen((prev) => !prev)}
					className="inline-flex items-center rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 md:hidden"
					aria-expanded={menuOpen}
					aria-label="Mo menu dieu huong"
				>
					Menu
				</button>
			</div>

			{menuOpen ? (
				<div className="border-t border-emerald-200 bg-white/95 md:hidden">
					<nav className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								onClick={() => setMenuOpen(false)}
								className="rounded-md px-3 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
							>
								{item.label}
							</Link>
						))}
						<div className="mt-2 flex items-center gap-2">
							<Link
								href="/gio-hang"
								onClick={() => setMenuOpen(false)}
								className="flex-1 rounded-lg border border-emerald-300 px-3 py-2 text-center text-sm font-semibold text-emerald-700"
							>
								Gio hang
							</Link>
							<Link
								href="/tu-van"
								onClick={() => setMenuOpen(false)}
								className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white"
							>
								Tu van
							</Link>
						</div>
					</nav>
				</div>
			) : null}
		</header>
	);
}
