import { type ReactNode, useCallback, useEffect, useState } from "react";

interface RouterState {
	pathname: string;
	search: string;
}

function getPath(): RouterState {
	if (typeof window === "undefined") return { pathname: "/", search: "" };
	return { pathname: window.location.pathname, search: window.location.search };
}

type Listener = (s: RouterState) => void;
const listeners = new Set<Listener>();

if (typeof window !== "undefined") {
	window.addEventListener("popstate", () => {
		const s = getPath();
		for (const l of listeners) l(s);
	});
}

export function useLocation() {
	const [s, setS] = useState<RouterState>(() => getPath());
	useEffect(() => {
		const l: Listener = (ns) => setS(ns);
		listeners.add(l);
		return () => {
			listeners.delete(l);
		};
	}, []);
	const navigate = useCallback((to: string, opts?: { replace?: boolean }) => {
		if (typeof window === "undefined") return;
		const url = new URL(to, window.location.origin);
		const next = { pathname: url.pathname, search: url.search };
		if (opts?.replace) window.history.replaceState({}, "", to);
		else window.history.pushState({}, "", to);
		window.scrollTo({ top: 0, behavior: "instant" });
		for (const l of listeners) l(next);
	}, []);
	return { ...s, navigate };
}

interface LinkProps {
	href: string;
	children: ReactNode;
	className?: string;
	onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
	"aria-label"?: string;
	title?: string;
	target?: string;
	rel?: string;
	prefetch?: boolean;
}

export function Link({ href, children, className, onClick, target, rel, ...rest }: LinkProps) {
	const handle = (e: React.MouseEvent<HTMLAnchorElement>) => {
		onClick?.(e);
		if (e.defaultPrevented) return;
		if (e.button !== 0) return;
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
		if (target && target !== "_self") return;
		const isExternal =
			/^https?:\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
		if (isExternal) return;
		e.preventDefault();
		const url = new URL(href, window.location.origin);
		if (url.origin !== window.location.origin) return;
		window.history.pushState({}, "", href);
		window.scrollTo({ top: 0, behavior: "instant" });
		const next = { pathname: url.pathname, search: url.search };
		for (const l of listeners) l(next);
	};

	return (
		<a
			href={href}
			className={className}
			onClick={handle}
			target={target}
			rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)}
			{...rest}
		>
			{children}
		</a>
	);
}

export function usePath(): string {
	const [p, setP] = useState(() => getPath().pathname);
	useEffect(() => {
		const l: Listener = (s) => setP(s.pathname);
		listeners.add(l);
		return () => {
			listeners.delete(l);
		};
	}, []);
	return p;
}

export function useParams<
	T extends Record<string, string | undefined> = Record<string, string | undefined>,
>(): T {
	const path = usePath();
	const segs = path.split("/").filter(Boolean);
	const params: Record<string, string> = {};
	for (let i = 0; i < segs.length - 1; i++) {
		params[segs[i]] = segs[i + 1];
	}
	return params as T;
}

export function useNavigate() {
	return useLocation().navigate;
}
