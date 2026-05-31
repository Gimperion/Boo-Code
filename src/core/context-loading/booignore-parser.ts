/**
 * Parse .booignore content into array of patterns
 * - Removes empty lines and comments
 * - Trims whitespace from each line
 */
export function parseBooignore(content: string): string[] {
	return content
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0 && !line.startsWith("#"))
}

/**
 * Simple glob pattern matcher for gitignore-style patterns
 * Supports: *.ext, dir/, filename, **\/*.ext
 */
function simpleGlobMatch(text: string, pattern: string): boolean {
	// Escape special regex characters except * and ?
	const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&")
	// Convert glob patterns to regex
	const regexPattern = escaped
		.replace(/\*\*/g, "§") // Placeholder for **
		.replace(/\*/g, "[^/]*") // * matches anything except /
		.replace(/§/g, ".*") // ** matches anything including /
		.replace(/\?/g, "[^/]") // ? matches single char except /

	const regex = new RegExp(`^${regexPattern}$`)
	return regex.test(text)
}

/**
 * Check if a file path should be ignored based on patterns
 * Supports gitignore-style patterns:
 * - *.ext — matches files with extension
 * - dir/ — matches files in directory
 * - filename.txt — exact match
 * - **\/*.ext — recursive wildcard match
 */
export function shouldIgnoreFile(filePath: string, patterns: string[]): boolean {
	const normalizedPath = filePath.replace(/\\/g, "/")

	for (const pattern of patterns) {
		const normalizedPattern = pattern.replace(/\\/g, "/")

		// Check if pattern matches using simple glob matcher
		if (simpleGlobMatch(normalizedPath, normalizedPattern)) {
			return true
		}

		// For directory patterns (ending with /), check if path is inside
		if (normalizedPattern.endsWith("/")) {
			const dirPattern = normalizedPattern.slice(0, -1)
			if (normalizedPath.startsWith(dirPattern + "/") || normalizedPath === dirPattern) {
				return true
			}
		}
	}

	return false
}
