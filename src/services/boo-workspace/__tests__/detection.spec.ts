import * as path from "path"

const { mockStat } = vi.hoisted(() => ({ mockStat: vi.fn() }))

vi.mock("fs/promises", () => ({
	default: { stat: mockStat },
}))

import { detectWorkspace } from "../detection"

const ROOT = "/test/my-novel"

describe("detectWorkspace", () => {
	beforeEach(() => vi.clearAllMocks())

	it("returns 'boo-workspace' when workspace.boo.md exists", async () => {
		mockStat.mockResolvedValue({ isFile: () => true })
		expect(await detectWorkspace(ROOT)).toBe("boo-workspace")
		expect(mockStat).toHaveBeenCalledWith(path.join(ROOT, "workspace.boo.md"))
	})

	it("returns 'non-workspace' when workspace.boo.md is absent", async () => {
		mockStat.mockRejectedValue(Object.assign(new Error("ENOENT"), { code: "ENOENT" }))
		expect(await detectWorkspace(ROOT)).toBe("non-workspace")
	})

	it("returns 'non-workspace' when stat returns a directory (not a file)", async () => {
		mockStat.mockResolvedValue({ isFile: () => false })
		expect(await detectWorkspace(ROOT)).toBe("non-workspace")
	})

	it("returns 'no-folder' when workspaceRoot is null", async () => {
		expect(await detectWorkspace(null)).toBe("no-folder")
	})

	it("returns 'no-folder' when workspaceRoot is undefined", async () => {
		expect(await detectWorkspace(undefined)).toBe("no-folder")
	})

	it("returns 'no-folder' on unexpected error", async () => {
		mockStat.mockRejectedValue(new Error("EPERM: permission denied"))
		expect(await detectWorkspace(ROOT)).toBe("no-folder")
	})
})
