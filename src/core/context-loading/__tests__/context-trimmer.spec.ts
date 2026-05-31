import { estimateTokens, trimContextByPriority } from "../context-trimmer"

describe("Context Trimmer", () => {
	describe("estimateTokens", () => {
		it("estimates tokens from text", () => {
			const text = "hello world"
			const tokens = estimateTokens(text)
			// Rough estimation: ~1 token per 4 characters
			expect(tokens).toBeGreaterThan(0)
			expect(tokens).toBeLessThan(text.length)
		})

		it("handles empty string", () => {
			expect(estimateTokens("")).toBe(0)
		})

		it("scales with text length", () => {
			const short = estimateTokens("hello")
			const long = estimateTokens("hello world this is a longer string")
			expect(long).toBeGreaterThan(short)
		})
	})

	describe("trimContextByPriority", () => {
		it("trims knowledge first when over limit", () => {
			const context = {
				workspace: "workspace content " + "x".repeat(1000),
				component: "component content",
				plan: "plan content",
				knowledge: "knowledge content " + "y".repeat(5000),
			}
			const limit = 2000
			const result = trimContextByPriority(context, limit)

			// Knowledge should be trimmed/removed
			expect(estimateTokens(result.knowledge)).toBeLessThan(estimateTokens(context.knowledge))
		})

		it("preserves workspace and component at any cost", () => {
			const context = {
				workspace: "important workspace",
				component: "important component",
				plan: "plan content",
				knowledge: "knowledge content",
			}
			const limit = 100
			const result = trimContextByPriority(context, limit)

			expect(result.workspace).toBe(context.workspace)
			expect(result.component).toBe(context.component)
		})

		it("returns all context if under limit", () => {
			const context = {
				workspace: "workspace",
				component: "component",
				plan: "plan",
				knowledge: "knowledge",
			}
			const limit = 10000
			const result = trimContextByPriority(context, limit)

			expect(result).toEqual(context)
		})
	})
})
