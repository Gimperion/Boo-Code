import * as path from "path"
import type { BooManifest } from "./manifest"

export type ResolvedPillars = {
	meta: string
	knowledge: string
	components: string
}

const DEFAULTS = {
	meta: ".boo",
	knowledge: "knowledge",
	components: "components",
} as const

export function resolvePillars(workspaceRoot: string, manifest: BooManifest): ResolvedPillars {
	const overrides = manifest.frontmatter.pillars ?? {}
	return {
		meta: path.join(workspaceRoot, overrides.meta ?? DEFAULTS.meta),
		knowledge: path.join(workspaceRoot, overrides.knowledge ?? DEFAULTS.knowledge),
		components: path.join(workspaceRoot, overrides.components ?? DEFAULTS.components),
	}
}
