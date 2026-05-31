import * as path from "path"

const { mockReadFile, mockWriteFile } = vi.hoisted(() => ({
	mockReadFile: vi.fn(),
	mockWriteFile: vi.fn(),
}))

vi.mock("fs/promises", () => ({
	default: {
		readFile: mockReadFile,
		writeFile: mockWriteFile,
	},
}))

import { readManifest, writeManifest } from "../manifest"
import type { BooManifest } from "../manifest"

const WORKSPACE_ROOT = "/test/my-novel"
const MANIFEST_PATH = path.join(WORKSPACE_ROOT, "workspace.boo.md")

describe("readManifest", () => {
	beforeEach(() => vi.clearAllMocks())

	it("parses frontmatter and body sections", async () => {
		mockReadFile.mockResolvedValue(`---
title: "My Novel"
author: "Tom Shen"
genre: "Literary Fiction"
---

## About This Workspace

A story about things.

## Component Relationships

Chapter one is first.
`)
		const result = await readManifest(WORKSPACE_ROOT)
		expect(result.frontmatter.title).toBe("My Novel")
		expect(result.frontmatter.author).toBe("Tom Shen")
		expect(result.aboutSection).toContain("A story about things.")
		expect(result.relationshipsSection).toContain("Chapter one is first.")
	})

	it("returns defaults when file has no frontmatter", async () => {
		mockReadFile.mockResolvedValue("## About This Workspace\n\nSomething.\n")
		const result = await readManifest(WORKSPACE_ROOT)
		expect(result.frontmatter).toEqual({})
		expect(result.aboutSection).toContain("Something.")
	})

	it("returns empty sections when headings are absent", async () => {
		mockReadFile.mockResolvedValue("---\ntitle: Test\n---\n\nSome prose with no headings.\n")
		const result = await readManifest(WORKSPACE_ROOT)
		expect(result.aboutSection).toBe("")
		expect(result.relationshipsSection).toBe("")
	})

	it("returns partial data with defaults on parse failure and does not throw", async () => {
		mockReadFile.mockRejectedValue(Object.assign(new Error("ENOENT"), { code: "ENOENT" }))
		const result = await readManifest(WORKSPACE_ROOT)
		expect(result.frontmatter).toEqual({})
		expect(result.aboutSection).toBe("")
		expect(result.relationshipsSection).toBe("")
	})
})

describe("writeManifest", () => {
	beforeEach(() => vi.clearAllMocks())

	it("serializes frontmatter and body sections to disk", async () => {
		mockWriteFile.mockResolvedValue(undefined)
		const manifest: BooManifest = {
			frontmatter: { title: "My Novel", author: "Tom Shen" },
			aboutSection: "A great story.",
			relationshipsSection: "Chapter one sets the stage.",
		}
		await writeManifest(WORKSPACE_ROOT, manifest)
		expect(mockWriteFile).toHaveBeenCalledOnce()
		const [writtenPath, writtenContent] = mockWriteFile.mock.calls[0]
		expect(writtenPath).toBe(MANIFEST_PATH)
		expect(writtenContent).toContain("title: My Novel")
		expect(writtenContent).toContain("## About This Workspace")
		expect(writtenContent).toContain("A great story.")
		expect(writtenContent).toContain("## Component Relationships")
		expect(writtenContent).toContain("Chapter one sets the stage.")
	})

	it("omits empty sections from output", async () => {
		mockWriteFile.mockResolvedValue(undefined)
		const manifest: BooManifest = {
			frontmatter: { title: "My Novel" },
			aboutSection: "",
			relationshipsSection: "",
		}
		await writeManifest(WORKSPACE_ROOT, manifest)
		const [, writtenContent] = mockWriteFile.mock.calls[0]
		expect(writtenContent).not.toContain("## About This Workspace")
		expect(writtenContent).not.toContain("## Component Relationships")
	})
})
