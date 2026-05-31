import * as path from "path"

const { mockReaddir, mockStat } = vi.hoisted(() => ({
	mockReaddir: vi.fn(),
	mockStat: vi.fn(),
}))

vi.mock("fs/promises", () => ({
	default: {
		readdir: mockReaddir,
		stat: mockStat,
	},
}))

import { discoverComponents } from "../components"

const COMPONENTS_PATH = "/test/my-novel/components"

describe("discoverComponents", () => {
	beforeEach(() => vi.clearAllMocks())

	it("returns components whose folder contains component.boo.md, sorted by name", async () => {
		mockReaddir.mockResolvedValue([
			{ name: "02-middle", isDirectory: () => true },
			{ name: "01-beginning", isDirectory: () => true },
			{ name: "03-end", isDirectory: () => true },
		])
		// 01 and 03 have component.boo.md, 02 does not
		mockStat.mockImplementation(async (p: string) => {
			if (p.includes("01-beginning") || p.includes("03-end")) {
				return { isFile: () => true }
			}
			throw Object.assign(new Error("ENOENT"), { code: "ENOENT" })
		})

		const result = await discoverComponents(COMPONENTS_PATH)
		expect(result).toHaveLength(2)
		expect(result[0].folderName).toBe("01-beginning")
		expect(result[1].folderName).toBe("03-end")
		expect(result[0].manifestPath).toBe(path.join(COMPONENTS_PATH, "01-beginning", "component.boo.md"))
	})

	it("returns empty array when components directory does not exist", async () => {
		mockReaddir.mockRejectedValue(Object.assign(new Error("ENOENT"), { code: "ENOENT" }))
		expect(await discoverComponents(COMPONENTS_PATH)).toEqual([])
	})

	it("skips non-directory entries", async () => {
		mockReaddir.mockResolvedValue([
			{ name: "README.md", isDirectory: () => false },
			{ name: "01-chapter", isDirectory: () => true },
		])
		mockStat.mockResolvedValue({ isFile: () => true })

		const result = await discoverComponents(COMPONENTS_PATH)
		expect(result).toHaveLength(1)
		expect(result[0].folderName).toBe("01-chapter")
	})

	it("returns empty array when no subdirectory has component.boo.md", async () => {
		mockReaddir.mockResolvedValue([{ name: "01-chapter", isDirectory: () => true }])
		mockStat.mockRejectedValue(Object.assign(new Error("ENOENT"), { code: "ENOENT" }))
		expect(await discoverComponents(COMPONENTS_PATH)).toEqual([])
	})
})
