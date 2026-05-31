import fs from "fs/promises"
import path from "path"
import os from "os"
import { loadBooContext } from "../context-loader"
import { setExplicitActiveComponent } from "../active-component-detector"

describe("Context Loading Integration", () => {
	let tempDir: string

	beforeEach(async () => {
		tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "boo-integration-"))
		setExplicitActiveComponent(null) // Reset explicit component
	})

	afterEach(async () => {
		try {
			await fs.rm(tempDir, { recursive: true })
		} catch (err) {
			// Ignore cleanup
		}
	})

	it("loads full context hierarchy with all files", async () => {
		// Create workspace structure
		const booDir = path.join(tempDir, ".boo")
		await fs.mkdir(booDir, { recursive: true })

		await fs.writeFile(path.join(booDir, "instructions.md"), "# Workspace Instructions")
		await fs.writeFile(path.join(booDir, "style.md"), "# Style Guidelines")
		await fs.writeFile(path.join(tempDir, "workspace.boo.md"), "# My Novel")

		// Create component
		const componentDir = path.join(tempDir, "components", "01-opening")
		await fs.mkdir(componentDir, { recursive: true })
		await fs.writeFile(path.join(componentDir, "component.boo.md"), "# Opening Scene")

		// Create plan
		const plansDir = path.join(componentDir, "plans")
		await fs.mkdir(plansDir, { recursive: true })
		await fs.writeFile(path.join(plansDir, "plan-draft.md"), "## Plan: Draft outline")

		// Create knowledge
		const knowledgeDir = path.join(tempDir, "knowledge")
		await fs.mkdir(knowledgeDir, { recursive: true })
		await fs.writeFile(path.join(knowledgeDir, "characters.md"), "# Characters")

		// Create .booignore
		await fs.writeFile(path.join(tempDir, ".booignore"), "*.log\nnotes/")

		const filePath = path.join(componentDir, "main.md")
		const result = await loadBooContext(tempDir, filePath)

		// Verify all sections are present
		expect(result).toContain("[STYLE]")
		expect(result).toContain("[INSTRUCTIONS]")
		expect(result).toContain("[WORKSPACE CONTEXT]")
		expect(result).toContain("[ACTIVE COMPONENT]")
		expect(result).toContain("[ACTIVE PLAN]")
		expect(result).toContain("[KNOWLEDGE]")
		expect(result).toContain("My Novel")
		expect(result).toContain("Opening Scene")
		expect(result).toContain("Characters")
	})

	it("respects .booignore patterns", async () => {
		// Create knowledge with files to ignore
		const knowledgeDir = path.join(tempDir, "knowledge")
		await fs.mkdir(knowledgeDir, { recursive: true })
		await fs.writeFile(path.join(knowledgeDir, "keep.md"), "# Keep this")
		await fs.writeFile(path.join(knowledgeDir, "ignore.log"), "# Ignore this")

		// Create .booignore
		await fs.writeFile(path.join(tempDir, ".booignore"), "*.log")

		const result = await loadBooContext(tempDir, path.join(tempDir, "main.md"))

		expect(result).toContain("Keep this")
		expect(result).not.toContain("Ignore this")
	})

	it("handles missing component gracefully", async () => {
		await fs.mkdir(path.join(tempDir, ".boo"), { recursive: true })
		await fs.writeFile(path.join(tempDir, ".boo", "instructions.md"), "# Instructions")

		// File not in component directory
		const result = await loadBooContext(tempDir, path.join(tempDir, "notes", "random.md"))

		expect(result).toContain("[INSTRUCTIONS]")
		expect(result).not.toContain("[ACTIVE COMPONENT]")
	})

	it("uses explicit component override", async () => {
		// Create two components
		const comp1Dir = path.join(tempDir, "components", "01-first")
		const comp2Dir = path.join(tempDir, "components", "02-second")
		await fs.mkdir(comp1Dir, { recursive: true })
		await fs.mkdir(comp2Dir, { recursive: true })
		await fs.writeFile(path.join(comp1Dir, "component.boo.md"), "# First Component")
		await fs.writeFile(path.join(comp2Dir, "component.boo.md"), "# Second Component")

		// File is in comp1, but explicitly set comp2
		setExplicitActiveComponent("02-second")
		const result = await loadBooContext(tempDir, path.join(comp1Dir, "main.md"))

		expect(result).toContain("Second Component")
		expect(result).not.toContain("First Component")
	})
})
