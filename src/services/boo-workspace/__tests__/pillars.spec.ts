import * as path from "path"
import { resolvePillars } from "../pillars"
import type { BooManifest } from "../manifest"

const ROOT = "/test/my-novel"

function makeManifest(pillars?: Record<string, string>): BooManifest {
	return {
		frontmatter: pillars ? { pillars } : {},
		aboutSection: "",
		relationshipsSection: "",
	}
}

describe("resolvePillars", () => {
	it("returns defaults when no overrides are set", () => {
		const result = resolvePillars(ROOT, makeManifest())
		expect(result.meta).toBe(path.join(ROOT, ".boo"))
		expect(result.knowledge).toBe(path.join(ROOT, "knowledge"))
		expect(result.components).toBe(path.join(ROOT, "components"))
	})

	it("applies meta override", () => {
		const result = resolvePillars(ROOT, makeManifest({ meta: ".custom-boo" }))
		expect(result.meta).toBe(path.join(ROOT, ".custom-boo"))
		expect(result.knowledge).toBe(path.join(ROOT, "knowledge"))
		expect(result.components).toBe(path.join(ROOT, "components"))
	})

	it("applies knowledge override", () => {
		const result = resolvePillars(ROOT, makeManifest({ knowledge: "lore" }))
		expect(result.knowledge).toBe(path.join(ROOT, "lore"))
	})

	it("applies components override", () => {
		const result = resolvePillars(ROOT, makeManifest({ components: "chapters" }))
		expect(result.components).toBe(path.join(ROOT, "chapters"))
	})

	it("applies all three overrides simultaneously", () => {
		const result = resolvePillars(ROOT, makeManifest({ meta: "m", knowledge: "k", components: "c" }))
		expect(result.meta).toBe(path.join(ROOT, "m"))
		expect(result.knowledge).toBe(path.join(ROOT, "k"))
		expect(result.components).toBe(path.join(ROOT, "c"))
	})
})
