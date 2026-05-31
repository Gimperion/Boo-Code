import fs from "fs/promises"
import * as path from "path"

export type DiscoveredComponent = {
	folderName: string
	folderPath: string
	manifestPath: string
}

const COMPONENT_MANIFEST = "component.boo.md"

export async function discoverComponents(componentsPath: string): Promise<DiscoveredComponent[]> {
	let entries: { name: string; isDirectory: () => boolean }[]
	try {
		entries = await fs.readdir(componentsPath, { withFileTypes: true })
	} catch {
		return []
	}

	const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name)

	const results: DiscoveredComponent[] = []
	for (const name of dirs) {
		const folderPath = path.join(componentsPath, name)
		const manifestPath = path.join(folderPath, COMPONENT_MANIFEST)
		try {
			const stat = await fs.stat(manifestPath)
			if (stat.isFile()) {
				results.push({ folderName: name, folderPath, manifestPath })
			}
		} catch {
			// no component.boo.md — skip
		}
	}

	return results.sort((a, b) => a.folderName.localeCompare(b.folderName))
}
