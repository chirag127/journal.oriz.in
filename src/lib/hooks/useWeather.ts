import { useEffect, useState } from "react";
import { useLocation } from "@/lib/hooks/useLocation";
import type { WeatherData } from "@/types/journal";

interface UseWeatherOptions {
	lat?: number;
	lng?: number;
	auto?: boolean;
}

export function useWeather({ lat, lng, auto = false }: UseWeatherOptions) {
	const [data, setData] = useState<WeatherData | null>(null);
	const [loading, setLoading] = useState(false);
	const { location } = useLocation({ auto });

	useEffect(() => {
		const target = lat != null && lng != null ? { lat, lng } : location;
		if (!target) return;
		const ctrl = new AbortController();
		setLoading(true);
		const url = `https://api.open-meteo.com/v1/forecast?latitude=${target.lat}&longitude=${target.lng}&current=temperature_2m,weather_code&temperature_unit=celsius`;
		fetch(url, { signal: ctrl.signal })
			.then((r) => r.json())
			.then((json) => {
				const cur = json?.current;
				if (!cur) return;
				const code = Number(cur.weather_code);
				setData({
					temp: Math.round(Number(cur.temperature_2m)),
					condition: codeToCondition(code),
					icon: codeToIcon(code),
				});
			})
			.catch(() => {
				// silent
			})
			.finally(() => setLoading(false));
		return () => ctrl.abort();
	}, [lat, lng, location?.lat, location?.lng]);

	return { data, loading };
}

function codeToCondition(code: number): string {
	if (code === 0) return "Clear";
	if ([1, 2, 3].includes(code)) return "Cloudy";
	if ([45, 48].includes(code)) return "Foggy";
	if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
	if ([61, 63, 65, 66, 67].includes(code)) return "Rain";
	if ([71, 73, 75, 77].includes(code)) return "Snow";
	if ([80, 81, 82].includes(code)) return "Showers";
	if ([85, 86].includes(code)) return "Snow showers";
	if ([95, 96, 99].includes(code)) return "Thunderstorm";
	return "Unknown";
}

function codeToIcon(code: number): string {
	if (code === 0) return "sun";
	if ([1, 2, 3].includes(code)) return "cloud";
	if ([45, 48].includes(code)) return "cloud-fog";
	if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "cloud-rain";
	if ([71, 73, 75, 77, 85, 86].includes(code)) return "snowflake";
	if ([95, 96, 99].includes(code)) return "cloud-lightning";
	return "cloud";
}
