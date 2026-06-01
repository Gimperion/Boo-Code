import fs from "fs/promises"
import path from "path"
import { directoryExists, readFileIfExists } from "../../services/boo-config"
import { getActiveComponent } from "./active-component-detector"
import { parseBooignore, shouldIgnoreFile } from "./booignore-parser"

interface LoadedContext {
	instructions: string
	style: string
	workspace: string
	component: string | null
	plan: string | null
	knowledge: string
}

/**
 * Load all text files from a .boo subdirectory (non-recursive, alphabetically ordered)
 */
async function loadBooFilesFromDirectory(dirPath: string): Promise<string> {
	if (!(await directoryExists(dirPath))) {
		return ""
	}

	try {
		const entries = await fs.readdir(dirPath, { withFileTypes: true })
		const files = entries
			.filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
			.sort((a, b) => a.name.localeCompare(b.name))

		const contents: string[] = []
		for (const file of files) {
			const filePath = path.join(dirPath, file.name)
			const content = await readFileIfExists(filePath)
			if (content) {
				contents.push(content)
			}
		}

		return contents.join("\n\n")
	} catch (err) {
		return ""
	}
}

/**
 * Load workspace-level context (.boo/instructions.md, .boo/style.md, workspace.boo.md)
 */
async function loadWorkspaceContext(cwd: string): Promise<LoadedContext> {
	const booDir = path.join(cwd, ".boo")

	const [instructions, style, workspace] = await Promise.all([
		readFileIfExists(path.join(booDir, "instructions.md")),
		readFileIfExists(path.join(booDir, "style.md")),
		readFileIfExists(path.join(cwd, "workspace.boo.md")),
	])

	return {
		instructions: instructions || "",
		style: style || "",
		workspace: workspace || "",
		component: null,
		plan: null,
		knowledge: "",
	}
}

/**
 * Load active component context (component.boo.md and active plan)
 */
async function loadComponentContext(
	cwd: string,
	activeComponent: string | null,
): Promise<{ component: string; plan: string }> {
	if (!activeComponent) {
		return { component: "", plan: "" }
	}

	const componentDir = path.join(cwd, "components", activeComponent)
	const plansDir = path.join(componentDir, "plans")

	const [componentContent] = await Promise.all([readFileIfExists(path.join(componentDir, "component.boo.md"))])

	// Load most recent plan file (plan-*.md, sorted alphabetically, last one is most recent)
	let planContent = ""
	if (await directoryExists(plansDir)) {
		try {
			const entries = await fs.readdir(plansDir, { withFileTypes: true })
			const planFiles = entries
				.filter((entry) => entry.isFile() && entry.name.startsWith("plan-") && entry.name.endsWith(".md"))
				.sort((a, b) => b.name.localeCompare(a.name)) // Sort descending to get latest

			if (planFiles.length > 0) {
				planContent = (await readFileIfExists(path.join(plansDir, planFiles[0].name))) || ""
			}
		} catch (err) {
			// Ignore errors reading plans
		}
	}

	return {
		component: componentContent || "",
		plan: planContent || "",
	}
}

/**
 * Load knowledge glossary only (not all knowledge files)
 */
async function loadKnowledgeContext(cwd: string, booIgnorePatterns: string[]): Promise<string> {
	const glossaryPath = path.join(cwd, "knowledge", "glossary.md")
	const glossaryContent = await readFileIfExists(glossaryPath)
	return glossaryContent || ""
}

/**
 * Format context parts into assembled block
 */
function formatContextBlock(context: LoadedContext): string {
	const sections: string[] = []

	if (context.style) {
		sections.push(`[STYLE]
${context.style}`)
	}

	if (context.instructions) {
		sections.push(`[INSTRUCTIONS]
${context.instructions}`)
	}

	if (context.workspace) {
		sections.push(`[WORKSPACE CONTEXT]
${context.workspace}`)
	}

	if (context.component) {
		sections.push(`[ACTIVE COMPONENT]
${context.component}`)
	}

	if (context.plan) {
		sections.push(`[ACTIVE PLAN]
${context.plan}`)
	}

	if (context.knowledge) {
		sections.push(`[KNOWLEDGE]
${context.knowledge}`)
	}

	return sections.join("\n\n---\n\n")
}

/**
 * Main context loader: assemble all context in hierarchy order
 */
export async function loadBooContext(cwd: string, currentFilePath: string, mode?: string): Promise<string> {
	try {
		// Load .booignore patterns
		const booIgnorePath = path.join(cwd, ".booignore")
		const booIgnoreContent = await readFileIfExists(booIgnorePath)
		const booIgnorePatterns = booIgnoreContent ? parseBooignore(booIgnoreContent) : []

		// Load workspace context
		const workspaceCtx = await loadWorkspaceContext(cwd)

		// Detect active component
		const activeComponent = getActiveComponent(currentFilePath, cwd)

		// Load component context
		const { component: componentContent, plan: planContent } = await loadComponentContext(cwd, activeComponent)
		workspaceCtx.component = componentContent
		workspaceCtx.plan = planContent

		// Load knowledge
		const knowledgeContent = await loadKnowledgeContext(cwd, booIgnorePatterns)
		workspaceCtx.knowledge = knowledgeContent

		// Format and return
		const formatted = formatContextBlock(workspaceCtx)
		return formatted ? `\n====\n\nBOO CODE CONTEXT\n\n${formatted}\n` : ""
	} catch (err) {
		// Return empty string on error instead of throwing
		return ""
	}
}
