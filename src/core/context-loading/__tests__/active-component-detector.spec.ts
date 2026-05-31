import {
	detectActiveComponentFromFilePath,
	setExplicitActiveComponent,
	getExplicitActiveComponent,
} from "../active-component-detector"
import path from "path"

describe("Active Component Detection", () => {
	describe("detectActiveComponentFromFilePath", () => {
		it("detects component from file in component directory", () => {
			const cwd = "/home/user/project"
			const filePath = path.join(cwd, "components", "01-chapter-one", "main.md")
			const result = detectActiveComponentFromFilePath(filePath, cwd)
			expect(result).toBe("01-chapter-one")
		})

		it("returns null for file not in component directory", () => {
			const cwd = "/home/user/project"
			const filePath = path.join(cwd, "notes", "random.md")
			const result = detectActiveComponentFromFilePath(filePath, cwd)
			expect(result).toBeNull()
		})

		it("handles nested component paths", () => {
			const cwd = "/home/user/project"
			const filePath = path.join(cwd, "components", "02-chapter-two", "sections", "draft.md")
			const result = detectActiveComponentFromFilePath(filePath, cwd)
			expect(result).toBe("02-chapter-two")
		})

		it("returns null for cwd itself", () => {
			const cwd = "/home/user/project"
			const filePath = cwd
			const result = detectActiveComponentFromFilePath(filePath, cwd)
			expect(result).toBeNull()
		})
	})

	describe("Explicit component override", () => {
		afterEach(() => {
			// Clean up explicit state
			setExplicitActiveComponent(null)
		})

		it("stores and retrieves explicit active component", () => {
			setExplicitActiveComponent("01-chapter-one")
			const result = getExplicitActiveComponent()
			expect(result).toBe("01-chapter-one")
		})

		it("clears explicit override when set to null", () => {
			setExplicitActiveComponent("01-chapter-one")
			setExplicitActiveComponent(null)
			const result = getExplicitActiveComponent()
			expect(result).toBeNull()
		})
	})
})
