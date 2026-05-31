import * as path from "path"
import * as os from "os"
import fs from "fs/promises"

/**
 * Gets the global .boo directory path based on the current platform
 */
export function getGlobalBooDirectory(): string {
	const homeDir = os.homedir()
	return path.join(homeDir, ".boo")
}

/**
 * Gets the project-local .boo directory path for a given cwd
 */
export function getProjectBooDirectoryForCwd(cwd: string): string {
	return path.join(cwd, ".boo")
}

/**
 * Check if a directory exists
 */
export async function directoryExists(dirPath: string): Promise<boolean> {
	try {
		const stat = await fs.stat(dirPath)
		return stat.isDirectory()
	} catch (error: any) {
		if (error.code === "ENOENT" || error.code === "ENOTDIR") {
			return false
		}
		throw error
	}
}

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
	try {
		const stat = await fs.stat(filePath)
		return stat.isFile()
	} catch (error: any) {
		if (error.code === "ENOENT" || error.code === "ENOTDIR") {
			return false
		}
		throw error
	}
}

/**
 * Safely read a file, returning null if it doesn't exist
 */
export async function readFileIfExists(filePath: string): Promise<string | null> {
	try {
		return await fs.readFile(filePath, "utf-8")
	} catch (error: any) {
		if (error.code === "ENOENT" || error.code === "ENOTDIR" || error.code === "EISDIR") {
			return null
		}
		throw error
	}
}

/**
 * Gets ordered list of .boo directories (global first, then project-local)
 */
export function getBooDirectoriesForCwd(cwd: string): string[] {
	return [getGlobalBooDirectory(), getProjectBooDirectoryForCwd(cwd)]
}
