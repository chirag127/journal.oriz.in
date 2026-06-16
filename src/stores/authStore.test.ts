import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/stores/authStore";

describe("authStore", () => {
	beforeEach(() => {
		useAuthStore.setState({ profile: null, uid: null, isLoading: true });
	});

	it("starts with default state", () => {
		const s = useAuthStore.getState();
		expect(s.profile).toBeNull();
		expect(s.uid).toBeNull();
		expect(s.isLoading).toBe(true);
	});

	it("setProfile updates the profile", () => {
		const profile = {
			uid: "abc123",
			email: "test@example.com",
			displayName: "Test",
			photoURL: null,
			isAnonymous: false,
			createdAt: "2025-01-01T00:00:00Z",
			updatedAt: "2025-01-01T00:00:00Z",
			defaultJournalType: "daily" as const,
			timezone: "UTC",
		};
		useAuthStore.getState().setProfile(profile);
		expect(useAuthStore.getState().profile).toEqual(profile);
	});

	it("setUid updates the uid", () => {
		useAuthStore.getState().setUid("user-123");
		expect(useAuthStore.getState().uid).toBe("user-123");
	});

	it("setLoading updates isLoading", () => {
		useAuthStore.getState().setLoading(false);
		expect(useAuthStore.getState().isLoading).toBe(false);
	});

	it("reset clears everything", () => {
		useAuthStore.setState({
			profile: { uid: "x", email: "a@b.com", displayName: "A", photoURL: null, isAnonymous: false, createdAt: "", updatedAt: "", defaultJournalType: "daily", timezone: "UTC" },
			uid: "x",
			isLoading: true,
		});
		useAuthStore.getState().reset();
		const s = useAuthStore.getState();
		expect(s.profile).toBeNull();
		expect(s.uid).toBeNull();
		expect(s.isLoading).toBe(false);
	});
});
