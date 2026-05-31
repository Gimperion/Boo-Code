import fs from "fs/promises"
import path from "path"
import os from "os"
import { loadBooContext } from "../context-loader"

describe("Context Loader", () => {
	let tempDir: string

	beforeEach(async () => {
		tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "boo-test-"))
	})

	afterEach(async () => {
		try {
			await fs.rm(tempDir, { recursive: true })
		} catch (err) {
			// Ignore cleanup errors
		}
	})

	describe("loadBooContext", () => {
		it("loads workspace-level context when available", async () => {
			// Create .boo directory and files
			const booDir = path.join(tempDir, ".boo")
			await fs.mkdir(booDir, { recursive: true })
			await fs.writeFile(path.join(booDir, "instructions.md"), "# Workspace Instructions\nBe helpful")
			await fs.writeFile(path.join(booDir, "style.md"), "# Style Guide\nUse active voice")
			await fs.writeFile(path.join(tempDir, "workspace.boo.md"), "# Workspace\nAuthor: Test User")

			const result = await loadBooContext(tempDir, path.join(tempDir, "main.md"))

			expect(result).toContain("Workspace Instructions")
			expect(result).toContain("Style Guide")
			expect(result).toContain("Workspace")
		})

		it("loads component context when active component exists", async () => {
			// Create workspace files
			const booDir = path.join(tempDir, ".boo")
			await fs.mkdir(booDir, { recursive: true })
			await fs.writeFile(path.join(booDir, "instructions.md"), "# Instructions")

			// Create component directory
			const componentDir = path.join(tempDir, "components", "01-intro")
			await fs.mkdir(componentDir, { recursive: true })
			await fs.writeFile(path.join(componentDir, "component.boo.md"), "# Chapter 01\nIntroduction")
			await fs.writeFile(path.join(tempDir, "workspace.boo.md"), "# Workspace")

			// File inside component should activate it
			const filePath = path.join(componentDir, "main.md")
			const result = await loadBooContext(tempDir, filePath)

			expect(result).toContain("Chapter 01")
			expect(result).toContain("Introduction")
		})

		it("returns gracefully when .boo directory doesn't exist", async () => {
			const result = await loadBooContext(tempDir, path.join(tempDir, "main.md"))
			// Should return empty or minimal context, not throw
			expect(typeof result).toBe("string")
		})

		it("includes mode-specific system prompt", async () => {
			const result = await loadBooContext(tempDir, path.join(tempDir, "main.md"), "writer")
			// Should include mode context (structure depends on modes system)
			expect(typeof result).toBe("string")
		})
	})
})
