import { execFileSync } from "child_process"
import path from "path"
import { readFileIfExists } from "../services/boo-config"

export interface GlossaryEntry {
	name: string
	tag: string
}

export interface SearchResult {
	glossaryMatches: GlossaryEntry[]
	fileMatches: Array<{
		filePath: string
		fileName: string
		lineNumber: number
		content: string
	}>
	searchQuery: string
}

/**
 * Parse glossary.md entries in format: "name (@tag:value)"
 */
export function parseGlossary(glossaryContent: string): GlossaryEntry[] {
	if (!glossaryContent) return []

	const entries: GlossaryEntry[] = []
	const lines = glossaryContent.split("\n")

	for (const line of lines) {
		const match = line.match(/^-\s+([^(]+)\s+\((@[^)]+)\)/)
		if (match) {
			entries.push({
				name: match[1].trim(),
				tag: match[2].trim(),
			})
		}
	}

	return entries
}

/**
 * Search knowledge base by query (tag or keyword)
 */
export async function searchKnowledge(cwd: string, query: string): Promise<SearchResult> {
	const knowledgeDir = path.join(cwd, "knowledge")
	const glossaryPath = path.join(knowledgeDir, "glossary.md")

	// Load and parse glossary
	const glossaryContent = await readFileIfExists(glossaryPath)
	const allEntries = parseGlossary(glossaryContent || "")

	// Filter glossary matches
	const glossaryMatches = allEntries.filter((entry) => {
		return entry.tag.includes(query) || entry.name.toLowerCase().includes(query.toLowerCase())
	})

	// Search files via grep
	const fileMatches: SearchResult["fileMatches"] = []
	try {
		const output = execFileSync(
			"grep",
			["-r", "-i", "-n", query, knowledgeDir, "--include=*.md", "--exclude=glossary.md"],
			{ encoding: "utf-8", stdio: ["pipe", "pipe", "ignore"] },
		)

		for (const line of output.split("\n")) {
			if (!line.trim()) continue

			const match = line.match(/^(.+?):(\d+):(.+)$/)
			if (match) {
				const [, filePath, lineNum, content] = match
				fileMatches.push({
					filePath,
					fileName: path.basename(filePath),
					lineNumber: parseInt(lineNum),
					content: content.trim(),
				})
			}
		}
	} catch (err) {
		// grep exits with error code if no matches found; that's OK
	}

	return {
		glossaryMatches,
		fileMatches,
		searchQuery: `grep -r -i -n ${JSON.stringify(query)} ${JSON.stringify(knowledgeDir)} --include=*.md`,
	}
}
