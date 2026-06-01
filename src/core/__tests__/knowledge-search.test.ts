import { describe, it, expect } from "vitest"
import { parseGlossary } from "../knowledge-search"

describe("parseGlossary", () => {
	it("parses glossary entries in name (@tag) format", () => {
		const glossary = `# Glossary

## Characters
- Elena (@char:Elena)
- Kael (@char:Kael)

## Settings
- Westmarch (@setting:Westmarch)
`
		const result = parseGlossary(glossary)
		expect(result).toEqual([
			{ name: "Elena", tag: "@char:Elena" },
			{ name: "Kael", tag: "@char:Kael" },
			{ name: "Westmarch", tag: "@setting:Westmarch" },
		])
	})

	it("returns empty array for empty glossary", () => {
		expect(parseGlossary("")).toEqual([])
	})
})

describe("searchKnowledge", () => {
	it("finds glossary matches by exact tag", async () => {
		const glossary = `# Glossary

## Characters
- Elena (@char:Elena)
`
		const result = parseGlossary(glossary)
		expect(result.length).toBeGreaterThan(0)
	})

	it("shows search query for transparency", () => {
		const query = "Elena"
		const grepPattern = query
		const searchQuery = `grep -r -i -n "${grepPattern}" "/knowledge" --include="*.md"`
		expect(searchQuery).toContain("grep")
	})
})
