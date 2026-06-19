/**
 * Family-hub metadata for Journal — used by the oriz family link list and any
 * shared cross-site components. The Journal app's own constants live in
 * `~/lib/constants.ts`; this file mirrors the OrizSiteConfig shape used across
 * every oriz sub-site.
 */
export interface OrizSiteConfig {
	slug: string;
	name: string;
	origin: string;
	tagline: string;
	description: string;
}

export const SITE_CONFIG: OrizSiteConfig = {
	slug: "journal",
	name: "Journal",
	origin: "https://journal.oriz.in",
	tagline: "Privacy-first PWA journal — ten journal types, offline",
	description: "Privacy-first PWA journal — ten journal types, offline",
};
