import {
	getProjectBooDirectoryForCwd,
	getGlobalBooDirectory,
	directoryExists,
	fileExists,
	readFileIfExists,
	getBooDirectoriesForCwd,
} from "../index"
import path from "path"
import fs from "fs/promises"
import os from "os"

describe("boo-config", () => {
	describe("getProjectBooDirectoryForCwd", () => {
		it("returns .boo directory path for given cwd", () => {
			const result = getProjectBooDirectoryForCwd("/Users/john/my-project")
			expect(result).toBe(path.join("/Users/john/my-project", ".boo"))
		})

		it("handles Windows paths", () => {
			const result = getProjectBooDirectoryForCwd("C:\\Users\\john\\my-project")
			expect(result).toBe(path.join("C:\\Users\\john\\my-project", ".boo"))
		})
	})

	describe("getGlobalBooDirectory", () => {
		it("returns .boo in home directory", () => {
			const result = getGlobalBooDirectory()
			expect(result).toContain(".boo")
			expect(result).toContain(os.homedir())
		})
	})

	describe("directoryExists", () => {
		it("returns true for existing directory", async () => {
			const result = await directoryExists("/tmp")
			expect(result).toBe(true)
		})

		it("returns false for nonexistent directory", async () => {
			const result = await directoryExists("/nonexistent/path/xyz")
			expect(result).toBe(false)
		})
	})

	describe("fileExists", () => {
		it("returns true for existing file", async () => {
			const tmpFile = path.join(os.tmpdir(), "test-file.txt")
			await fs.writeFile(tmpFile, "test")
			const result = await fileExists(tmpFile)
			expect(result).toBe(true)
			await fs.unlink(tmpFile)
		})

		it("returns false for nonexistent file", async () => {
			const result = await fileExists("/nonexistent/file.txt")
			expect(result).toBe(false)
		})
	})

	describe("readFileIfExists", () => {
		it("returns file content if file exists", async () => {
			const tmpFile = path.join(os.tmpdir(), "test-read.txt")
			await fs.writeFile(tmpFile, "hello world")
			const result = await readFileIfExists(tmpFile)
			expect(result).toBe("hello world")
			await fs.unlink(tmpFile)
		})

		it("returns null if file does not exist", async () => {
			const result = await readFileIfExists("/nonexistent/file.txt")
			expect(result).toBeNull()
		})
	})

	describe("getBooDirectoriesForCwd", () => {
		it("returns global and project directories in order", () => {
			const result = getBooDirectoriesForCwd("/Users/john/project")
			expect(result.length).toBe(2)
			expect(result[0]).toContain(".boo")
			expect(result[1]).toBe("/Users/john/project/.boo")
		})
	})

	describe("boo-config exports", () => {
		it("exports all public functions", () => {
			const booConfig = require("../index")
			expect(typeof booConfig.getGlobalBooDirectory).toBe("function")
			expect(typeof booConfig.getProjectBooDirectoryForCwd).toBe("function")
			expect(typeof booConfig.directoryExists).toBe("function")
			expect(typeof booConfig.fileExists).toBe("function")
			expect(typeof booConfig.readFileIfExists).toBe("function")
			expect(typeof booConfig.getBooDirectoriesForCwd).toBe("function")
		})
	})
})
