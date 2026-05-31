/**
 * Rough token estimation: ~1 token per 4 characters
 * This is a simple approximation. For production, use proper tokenizer.
 */
export function estimateTokens(text: string): number {
	if (!text) return 0
	// Claude models typically use ~4 chars per token average
	return Math.ceil(text.length / 4)
}

export interface ContextParts {
	workspace: string
	component: string
	plan: string
	knowledge: string
}

/**
 * Trim context to fit within token limit
 * Priority order (highest to lowest):
 * 1. workspace content (always preserve)
 * 2. component content (always preserve)
 * 3. plan content (trim second)
 * 4. knowledge content (trim first)
 */
export function trimContextByPriority(context: ContextParts, tokenLimit: number): ContextParts {
	const workspaceTokens = estimateTokens(context.workspace)
	const componentTokens = estimateTokens(context.component)
	const planTokens = estimateTokens(context.plan)
	const knowledgeTokens = estimateTokens(context.knowledge)

	const totalTokens = workspaceTokens + componentTokens + planTokens + knowledgeTokens

	// Already under limit
	if (totalTokens <= tokenLimit) {
		return context
	}

	// Workspace and component are always preserved
	const reserved = workspaceTokens + componentTokens
	let remaining = tokenLimit - reserved

	if (remaining <= 0) {
		// Can't even fit workspace + component; return them anyway (hard requirement)
		return {
			workspace: context.workspace,
			component: context.component,
			plan: "",
			knowledge: "",
		}
	}

	// Trim knowledge first
	let knowledge = context.knowledge
	let plan = context.plan

	const knowledgeAllowance = Math.floor(remaining * 0.5)
	if (knowledgeTokens > knowledgeAllowance) {
		knowledge = trimTextToTokens(knowledge, knowledgeAllowance)
	}

	remaining -= estimateTokens(knowledge)

	// Then trim plan
	if (planTokens > remaining) {
		plan = trimTextToTokens(plan, remaining)
	}

	return {
		workspace: context.workspace,
		component: context.component,
		plan,
		knowledge,
	}
}

/**
 * Trim text to approximately a target number of tokens
 */
function trimTextToTokens(text: string, targetTokens: number): string {
	const targetChars = targetTokens * 4
	if (text.length <= targetChars) return text
	return text.slice(0, targetChars) + "..."
}
