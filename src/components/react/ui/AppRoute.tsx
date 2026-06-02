import { CalendarView } from "@components/react/calendar/CalendarView";
import { Dashboard } from "@components/react/dashboard/Dashboard";
import { EntriesList } from "@components/react/entries/EntriesList";
import { EntryDetailView } from "@components/react/entries/EntryDetailView";
import { EntryEditor } from "@components/react/entries/EntryEditor";
import { GoalsView } from "@components/react/goals/GoalsView";
import { MemoriesView } from "@components/react/memories/MemoriesView";
import { ProfileView } from "@components/react/profile/ProfileView";
import { SearchView } from "@components/react/search/SearchView";
import { SettingsView } from "@components/react/settings/SettingsView";
import { StatsView } from "@components/react/stats/StatsView";
import { TagDetailView } from "@components/react/tags/TagDetailView";
import { TagsView } from "@components/react/tags/TagsView";
import { TemplatesView } from "@components/react/templates/TemplatesView";
import { TimelineView } from "@components/react/timeline/TimelineView";
import { usePath } from "../router";
import { AppPage } from "./AppPage";

export function AppRoute({
	initialDate,
	initialTemplate,
}: {
	initialDate?: string;
	initialTemplate?: string;
}) {
	const path = usePath();

	let view: React.ReactNode = null;
	if (path === "/dashboard") view = <Dashboard />;
	else if (path === "/entries") view = <EntriesList scope="all" />;
	else if (path === "/entries/new")
		view = <EntryEditor initialDate={initialDate} initialTemplate={initialTemplate} />;
	else if (/^\/entries\/[^/]+\/edit$/.test(path)) {
		const id = decodeURIComponent(path.split("/")[2]);
		view = <EntryEditor id={id} />;
	} else if (/^\/entries\/[^/]+$/.test(path)) {
		view = <EntryDetailView />;
	} else if (path === "/favorites") view = <EntriesList scope="favorites" />;
	else if (path === "/pinned") view = <EntriesList scope="pinned" />;
	else if (path === "/calendar") view = <CalendarView />;
	else if (path === "/timeline") view = <TimelineView />;
	else if (path === "/search") view = <SearchView />;
	else if (path === "/stats") view = <StatsView />;
	else if (path === "/moods") view = <StatsView />;
	else if (path === "/memories") view = <MemoriesView />;
	else if (path === "/goals") view = <GoalsView />;
	else if (path === "/templates") view = <TemplatesView />;
	else if (path === "/tags") view = <TagsView />;
	else if (/^\/tags\/[^/]+$/.test(path)) view = <TagDetailView />;
	else if (path === "/settings") view = <SettingsView />;
	else if (path === "/profile") view = <ProfileView />;
	else view = <NotFound />;

	return <AppPage>{view}</AppPage>;
}

function NotFound() {
	return (
		<div className="rounded-xl border border-dashed border-border bg-paper-soft/40 p-8 text-center">
			<p className="font-display text-3xl">Page not found</p>
			<p className="mt-1 text-fg-muted">That route doesn't exist.</p>
			<a href="/dashboard" className="mt-4 inline-flex text-sm text-accent">
				Go to dashboard
			</a>
		</div>
	);
}
