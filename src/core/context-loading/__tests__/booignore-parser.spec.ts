import { parseBooignore, shouldIgnoreFile } from "../booignore-parser"

describe("Booignore Parser", () => {
	describe("parseBooignore", () => {
		it("parses simple patterns", () => {
			const content = `*.log
notes/
temp.md`
			const patterns = parseBooignore(content)
			expect(patterns).toContain("*.log")
			expect(patterns).toContain("notes/")
			expect(patterns).toContain("temp.md")
		})

		it("ignores empty lines and comments", () => {
			const content = `*.log

# This is a comment
notes/

temp.md`
			const patterns = parseBooignore(content)
			expect(patterns).toHaveLength(3)
			expect(patterns).not.toContain("")
			expect(patterns).not.toContain("# This is a comment")
		})

		it("handles lines with leading/trailing whitespace", () => {
			const content = `  *.log
  notes/`
			const patterns = parseBooignore(content)
			expect(patterns).toContain("*.log")
			expect(patterns).toContain("notes/")
		})
	})

	describe("shouldIgnoreFile", () => {
		it("ignores files matching simple extensions", () => {
			const patterns = ["*.log", "*.tmp"]
			expect(shouldIgnoreFile("debug.log", patterns)).toBe(true)
			expect(shouldIgnoreFile("cache.tmp", patterns)).toBe(true)
			expect(shouldIgnoreFile("file.md", patterns)).toBe(false)
		})

		it("ignores files in directories", () => {
			const patterns = ["notes/", "drafts/"]
			expect(shouldIgnoreFile("notes/something.md", patterns)).toBe(true)
			expect(shouldIgnoreFile("drafts/work.md", patterns)).toBe(true)
			expect(shouldIgnoreFile("main.md", patterns)).toBe(false)
		})

		it("ignores exact filenames", () => {
			const patterns = [".DS_Store", "Thumbs.db"]
			expect(shouldIgnoreFile(".DS_Store", patterns)).toBe(true)
			expect(shouldIgnoreFile("file.txt", patterns)).toBe(false)
		})

		it("handles wildcard patterns", () => {
			const patterns = ["**/*.cache"]
			expect(shouldIgnoreFile("deep/nested/file.cache", patterns)).toBe(true)
			expect(shouldIgnoreFile("file.cache", patterns)).toBe(true)
			expect(shouldIgnoreFile("file.md", patterns)).toBe(false)
		})

		it("returns false for empty patterns", () => {
			expect(shouldIgnoreFile("file.md", [])).toBe(false)
		})
	})
})
