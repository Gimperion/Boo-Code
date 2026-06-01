// NOTE: This tool requires "knowledge_search" to be added to the ToolName type union
// in packages/types/src/index.ts before it can be integrated.
// The tool code is complete and ready; type registration is the final step.

import path from "path"

import { Task } from "../task/Task"
import { formatResponse } from "../prompts/responses"
import { searchKnowledge } from "../knowledge-search"
import type { ToolUse } from "../../shared/tools"

import { BaseTool, ToolCallbacks } from "./BaseTool"

interface KnowledgeSearchParams {
	query: string
}

/**
 * Tool for agents to search the knowledge base by tag or keyword.
 * Displays glossary matches first, then detailed file matches.
 *
 * INTEGRATION REQUIREMENT: Add "knowledge_search" to ToolName type union
 */
export class KnowledgeSearchTool extends BaseTool<any> {
	readonly name = "knowledge_search" as const

	async execute(params: KnowledgeSearchParams, task: Task, callbacks: ToolCallbacks): Promise<void> {
		const { askApproval, handleError, pushToolResult } = callbacks
		const { query } = params

		if (!query || typeof query !== "string") {
			task.consecutiveMistakeCount++
			task.didToolFailInCurrentTurn = true
			pushToolResult(await task.sayAndCreateMissingParamError("search_replace", "query"))
			return
		}

		const workspacePath = task.cwd
		if (!workspacePath) {
			await handleError("knowledge_search", new Error("No workspace context available"))
			return
		}

		const sharedMessageProps = {
			tool: "knowledgeSearch",
			query: query,
		}

		const didApprove = await askApproval("tool", JSON.stringify(sharedMessageProps))
		if (!didApprove) {
			pushToolResult(formatResponse.toolDenied())
			return
		}

		task.consecutiveMistakeCount = 0

		try {
			const results = await searchKnowledge(workspacePath, query)

			if (results.glossaryMatches.length === 0 && results.fileMatches.length === 0) {
				pushToolResult(`No matches found for query: "${query}"\n\nSearch pattern: ${results.searchQuery}`)
				return
			}

			let output = ""

			if (results.glossaryMatches.length > 0) {
				output += "## Glossary Matches\n\n"
				for (const match of results.glossaryMatches) {
					output += `- **${match.name}** — ${match.tag}\n`
				}
				output += "\n"
			}

			if (results.fileMatches.length > 0) {
				output += "## File Matches\n\n"
				for (const match of results.fileMatches) {
					output += `**${match.fileName}:${match.lineNumber}**\n\`\`\`\n${match.content}\n\`\`\`\n\n`
				}
			}

			output += `\n**Search pattern used:** \`${results.searchQuery}\``

			pushToolResult(output)
		} catch (error: any) {
			await handleError("search_replace", error)
		}
	}

	override async handlePartial(task: Task, block: ToolUse<any>): Promise<void> {
		const query: string | undefined = block.params.query

		const sharedMessageProps = {
			tool: "knowledgeSearch",
			query: query,
		}

		await task.ask("tool", JSON.stringify(sharedMessageProps), block.partial).catch(() => {})
	}
}

export const knowledgeSearchTool = new KnowledgeSearchTool()
