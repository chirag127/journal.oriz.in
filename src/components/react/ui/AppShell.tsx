import { ThemeToggle } from "@components/react/ui/ThemeToggle";
import {
	BarChart3,
	BookOpen,
	Calendar,
	ChevronRight,
	Clock,
	FileText,
	Heart,
	Home,
	LogOut,
	Menu,
	PenLine,
	Pin,
	Search,
	Settings,
	Smile,
	Sparkles,
	Tag,
	Target,
	User,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { APP_NAME } from "@/lib/constants";
import { signOut } from "@/lib/firebase/auth";
import { useProfile } from "@/lib/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { Link, useLocation } from "../router";

interface NavItem {
	href: string;
	label: string;
	icon: typeof Home;
	match: (path: string) => boolean;
}

const PRIMARY_NAV: NavItem[] = [
	{ href: "/dashboard", label: "Today", icon: Home, match: (p) => p === "/dashboard" },
	{ href: "/entries/new", label: "New entry", icon: PenLine, match: (p) => p === "/entries/new" },
	{
		href: "/entries",
		label: "All entries",
		icon: BookOpen,
		match: (p) => p === "/entries" || /^\/entries\/[^/]+$/.test(p),
	},
	{ href: "/calendar", label: "Calendar", icon: Calendar, match: (p) => p === "/calendar" },
	{ href: "/timeline", label: "Timeline", icon: Clock, match: (p) => p === "/timeline" },
	{ href: "/search", label: "Search", icon: Search, match: (p) => p === "/search" },
	{ href: "/stats", label: "Statistics", icon: BarChart3, match: (p) => p === "/stats" },
	{ href: "/moods", label: "Moods", icon: Smile, match: (p) => p === "/moods" },
	{ href: "/memories", label: "Memories", icon: Sparkles, match: (p) => p === "/memories" },
	{ href: "/goals", label: "Goals", icon: Target, match: (p) => p === "/goals" },
	{ href: "/templates", label: "Templates", icon: FileText, match: (p) => p === "/templates" },
	{
		href: "/tags",
		label: "Tags",
		icon: Tag,
		match: (p) => p === "/tags" || /^\/tags\/[^/]+$/.test(p),
	},
	{ href: "/favorites", label: "Favorites", icon: Heart, match: (p) => p === "/favorites" },
	{ href: "/pinned", label: "Pinned", icon: Pin, match: (p) => p === "/pinned" },
];

const SECONDARY_NAV: NavItem[] = [
	{ href: "/profile", label: "Profile", icon: User, match: (p) => p === "/profile" },
	{ href: "/settings", label: "Settings", icon: Settings, match: (p) => p === "/settings" },
];

export function AppShell({
	children,
	wide = false,
}: {
	children: React.ReactNode;
	wide?: boolean;
}) {
	const [open, setOpen] = useState(false);
	const location = useLocation();
	const { uid, reset } = useAuthStore();
	const profile = useProfile(uid);

	useEffect(() => {
		setOpen(false);
	}, [location]);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("keydown", onKey);
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = prevOverflow;
		};
	}, [open]);

	async function onSignOut() {
		try {
			await signOut();
		} finally {
			reset();
			location.navigate("/");
		}
	}

	return (
		<div className="min-h-screen bg-grain">
			<header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md lg:hidden">
				<div className="flex h-14 items-center justify-between gap-2 px-4">
					<Link
						href="/dashboard"
						className="font-display text-lg font-medium tracking-tight no-underline"
					>
						{APP_NAME}
					</Link>
					<div className="flex items-center gap-2">
						<ThemeToggle />
						<button
							type="button"
							onClick={() => setOpen((o) => !o)}
							className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border bg-bg-elevated touch-target sm:h-9 sm:w-9"
							aria-label="Toggle menu"
							aria-expanded={open}
							aria-controls="app-drawer"
						>
							{open ? <X size={18} /> : <Menu size={18} />}
						</button>
					</div>
				</div>
			</header>

			<div className="flex">
				<aside
					id="app-drawer"
					className={`fixed inset-y-0 left-0 z-30 w-72 max-w-[85vw] transform border-r border-border bg-bg transition-transform duration-300 ease-out-quart lg:static lg:translate-x-0 ${
						open ? "translate-x-0" : "-translate-x-full"
					}`}
				>
					<SidebarContent profile={profile} onSignOut={onSignOut} pathname={location.pathname} />
				</aside>

				{open && (
					<button
						type="button"
						className="fixed inset-0 z-20 bg-ink/30 backdrop-blur-sm lg:hidden"
						onClick={() => setOpen(false)}
						aria-label="Close menu"
					/>
				)}

				<main
					className={`min-h-screen flex-1 pb-safe ${wide ? "px-0" : "px-4 py-6 sm:px-6 lg:px-10 lg:py-8"}`}
				>
					{children}
				</main>
			</div>
		</div>
	);
}

function SidebarContent({
	profile,
	onSignOut,
	pathname,
}: {
	profile: {
		displayName: string | null;
		photoURL: string | null;
		email: string | null;
		isAnonymous: boolean;
	} | null;
	onSignOut: () => void;
	pathname: string;
}) {
	return (
		<div className="flex h-full flex-col">
			<div className="hidden border-b border-border px-6 py-5 lg:block">
				<Link href="/dashboard" className="flex items-baseline gap-2 no-underline">
					<span className="font-display text-2xl font-medium tracking-tight">Journal</span>
				</Link>
				<p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
					Private · Fast · Beautiful
				</p>
			</div>

			<nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
				<NavList items={PRIMARY_NAV} pathname={pathname} />
				<div className="my-3 border-t border-border" />
				<NavList items={SECONDARY_NAV} pathname={pathname} />
			</nav>

			<div className="border-t border-border p-4">
				<div className="mb-3 hidden lg:block">
					<ThemeToggle />
				</div>
				<Link
					href="/profile"
					className="group flex items-center gap-3 rounded-md p-2 no-underline hover:bg-paper-sunken"
				>
					<div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-accent/15 text-sm font-semibold text-accent">
						{profile?.photoURL ? (
							<img src={profile.photoURL} alt="" className="h-full w-full object-cover" />
						) : (
							<span>{(profile?.displayName || profile?.email || "Y").charAt(0).toUpperCase()}</span>
						)}
					</div>
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-medium">
							{profile?.displayName || (profile?.isAnonymous ? "Guest" : "You")}
						</p>
						<p className="truncate text-xs text-fg-muted">
							{profile?.email || (profile?.isAnonymous ? "Local only" : "")}
						</p>
					</div>
					<ChevronRight
						size={14}
						className="text-fg-muted opacity-0 transition-opacity group-hover:opacity-100"
					/>
				</Link>
				<button
					type="button"
					onClick={onSignOut}
					className="mt-2 inline-flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-fg-muted hover:bg-paper-sunken hover:text-fg"
				>
					<LogOut size={14} /> Sign out
				</button>
			</div>
		</div>
	);
}

function NavList({ items, pathname }: { items: NavItem[]; pathname: string }) {
	return (
		<ul className="flex flex-col gap-0.5">
			{items.map((item) => {
				const Icon = item.icon;
				const active = item.match(pathname);
				return (
					<li key={item.href}>
						<Link
							href={item.href}
							className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm no-underline transition-colors ${
								active ? "bg-ink text-paper" : "text-fg-muted hover:bg-paper-sunken hover:text-fg"
							}`}
						>
							<Icon size={15} className={active ? "" : "opacity-80"} />
							<span className="flex-1">{item.label}</span>
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
