import fs from "fs/promises"
import * as path from "path"

export type WorkspaceState = "boo-workspace" | "non-workspace" | "no-folder"

const MANIFEST_FILENAME = "workspace.boo.md"

export async function detectWorkspace(workspaceRoot: string | null | undefined): Promise<WorkspaceState> {
	if (!workspaceRoot) {
		return "no-folder"
	}
	try {
		const stat = await fs.stat(path.join(workspaceRoot, MANIFEST_FILENAME))
		return stat.isFile() ? "boo-workspace" : "non-workspace"
	} catch (err: any) {
		if (err?.code === "ENOENT" || err?.code === "ENOTDIR") {
			return "non-workspace"
		}
		return "no-folder"
	}
}
