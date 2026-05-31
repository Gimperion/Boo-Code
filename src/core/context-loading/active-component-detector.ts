import path from "path"

let explicitActiveComponent: string | null = null

/**
 * Detects which component (if any) a file belongs to
 * Components are assumed to be in `components/` folder (e.g. `components/01-chapter-one/`)
 * If file is inside a component folder, returns the component folder name
 * Otherwise returns null
 */
export function detectActiveComponentFromFilePath(filePath: string, cwd: string): string | null {
	// Normalize paths
	const normalized = path.normalize(filePath)
	const normalizedCwd = path.normalize(cwd)

	// File must be under cwd
	if (!normalized.startsWith(normalizedCwd)) {
		return null
	}

	// Remove cwd prefix to get relative path
	let relative = path.relative(normalizedCwd, normalized)

	// Normalize slashes for consistent comparison
	relative = relative.replace(/\\/g, "/")

	// Check if path starts with "components/" pattern
	const componentsMatch = relative.match(/^components\/([^/]+)/)
	if (componentsMatch) {
		return componentsMatch[1]
	}

	return null
}

/**
 * Explicitly set the active component (overrides file-based detection)
 * Pass null to clear the override
 */
export function setExplicitActiveComponent(componentId: string | null): void {
	explicitActiveComponent = componentId
}

/**
 * Get the explicitly set active component, if any
 */
export function getExplicitActiveComponent(): string | null {
	return explicitActiveComponent
}

/**
 * Get active component: explicit override takes precedence, then file-based detection
 */
export function getActiveComponent(filePath: string, cwd: string): string | null {
	const explicit = getExplicitActiveComponent()
	if (explicit !== null) {
		return explicit
	}
	return detectActiveComponentFromFilePath(filePath, cwd)
}
