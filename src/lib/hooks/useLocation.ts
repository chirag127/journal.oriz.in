import { useEffect, useState } from "react";

interface LocationState {
	lat: number;
	lng: number;
	label?: string;
}

export function useLocation({ auto = false }: { auto?: boolean } = {}) {
	const [location, setLocation] = useState<LocationState | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const request = () => {
		if (typeof navigator === "undefined" || !navigator.geolocation) {
			setError("Geolocation is not supported in this browser");
			return;
		}
		setLoading(true);
		setError(null);
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
				setLoading(false);
			},
			(err) => {
				setError(err.message);
				setLoading(false);
			},
			{ enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 },
		);
	};

	useEffect(() => {
		if (auto) request();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [auto]);

	return { location, error, loading, request };
}
