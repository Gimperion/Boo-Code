import matter from "gray-matter"
import fs from "fs/promises"
import * as path from "path"

export type PillarOverrides = {
	meta?: string
	knowledge?: string
	components?: string
}

export type BooManifestFrontmatter = {
	title?: string
	author?: string
	genre?: string
	language?: string
	pillars?: PillarOverrides
}

export type BooManifest = {
	frontmatter: BooManifestFrontmatter
	aboutSection: string
	relationshipsSection: string
}

const MANIFEST_FILENAME = "workspace.boo.md"

const EMPTY_MANIFEST: BooManifest = {
	frontmatter: {},
	aboutSection: "",
	relationshipsSection: "",
}

function extractSection(body: string, heading: string): string {
	const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
	const match = body.match(new RegExp(`##\\s+${escapedHeading}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`))
	return match ? match[1].trim() : ""
}

export async function readManifest(workspaceRoot: string): Promise<BooManifest> {
	const filePath = path.join(workspaceRoot, MANIFEST_FILENAME)
	try {
		const raw = await fs.readFile(filePath, "utf-8")
		const { data: frontmatter, content: body } = matter(raw)
		return {
			frontmatter: frontmatter as BooManifestFrontmatter,
			aboutSection: extractSection(body, "About This Workspace"),
			relationshipsSection: extractSection(body, "Component Relationships"),
		}
	} catch {
		return { ...EMPTY_MANIFEST }
	}
}

export async function writeManifest(workspaceRoot: string, manifest: BooManifest): Promise<void> {
	const filePath = path.join(workspaceRoot, MANIFEST_FILENAME)
	const { frontmatter, aboutSection, relationshipsSection } = manifest

	let body = ""
	if (aboutSection) {
		body += `## About This Workspace\n\n${aboutSection}\n`
	}
	if (relationshipsSection) {
		if (body) body += "\n"
		body += `## Component Relationships\n\n${relationshipsSection}\n`
	}

	const serialized = matter.stringify(body, frontmatter)
	await fs.writeFile(filePath, serialized, "utf-8")
}
