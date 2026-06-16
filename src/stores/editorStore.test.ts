import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "@/stores/editorStore";

describe("editorStore", () => {
	beforeEach(() => {
		useEditorStore.setState({ mode: "split", fullscreen: false, draft: {} });
	});

	it("starts with default state", () => {
		const s = useEditorStore.getState();
		expect(s.mode).toBe("split");
		expect(s.fullscreen).toBe(false);
		expect(s.draft).toEqual({});
	});

	it("setMode changes the editor mode", () => {
		useEditorStore.getState().setMode("preview");
		expect(useEditorStore.getState().mode).toBe("preview");
	});

	it("toggleFullscreen toggles the fullscreen flag", () => {
		useEditorStore.getState().toggleFullscreen();
		expect(useEditorStore.getState().fullscreen).toBe(true);
		useEditorStore.getState().toggleFullscreen();
		expect(useEditorStore.getState().fullscreen).toBe(false);
	});

	it("setFullscreen sets fullscreen to a specific value", () => {
		useEditorStore.getState().setFullscreen(true);
		expect(useEditorStore.getState().fullscreen).toBe(true);
		useEditorStore.getState().setFullscreen(false);
		expect(useEditorStore.getState().fullscreen).toBe(false);
	});

	it("saveDraft adds a draft", () => {
		useEditorStore.getState().saveDraft("entry-1", { title: "My Entry", content: "content" });
		const draft = useEditorStore.getState().draft["entry-1"];
		expect(draft.title).toBe("My Entry");
		expect(draft.content).toBe("content");
		expect(draft.updatedAt).toBeTruthy();
	});

	it("removeDraft removes a specific draft", () => {
		useEditorStore.getState().saveDraft("entry-1", { title: "T1", content: "C1" });
		useEditorStore.getState().saveDraft("entry-2", { title: "T2", content: "C2" });
		useEditorStore.getState().removeDraft("entry-1");
		expect(useEditorStore.getState().draft["entry-1"]).toBeUndefined();
		expect(useEditorStore.getState().draft["entry-2"]).toBeTruthy();
	});

	it("clearDrafts removes all drafts", () => {
		useEditorStore.getState().saveDraft("entry-1", { title: "T1", content: "C1" });
		useEditorStore.getState().clearDrafts();
		expect(useEditorStore.getState().draft).toEqual({});
	});
});
