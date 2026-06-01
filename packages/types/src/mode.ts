import { z } from "zod"

import { deprecatedToolGroups, toolGroupsSchema } from "./tool.js"

/**
 * GroupOptions
 */

export const groupOptionsSchema = z.object({
	fileRegex: z
		.string()
		.optional()
		.refine(
			(pattern) => {
				if (!pattern) {
					return true // Optional, so empty is valid.
				}

				try {
					new RegExp(pattern)
					return true
				} catch {
					return false
				}
			},
			{ message: "Invalid regular expression pattern" },
		),
	description: z.string().optional(),
})

export type GroupOptions = z.infer<typeof groupOptionsSchema>

/**
 * GroupEntry
 */

export const groupEntrySchema = z.union([toolGroupsSchema, z.tuple([toolGroupsSchema, groupOptionsSchema])])

export type GroupEntry = z.infer<typeof groupEntrySchema>

/**
 * ModeConfig
 */

/**
 * Checks if a group entry references a deprecated tool group.
 * Handles both string entries ("browser") and tuple entries (["browser", { ... }]).
 */
function isDeprecatedGroupEntry(entry: unknown): boolean {
	if (typeof entry === "string") {
		return deprecatedToolGroups.includes(entry)
	}
	if (Array.isArray(entry) && entry.length >= 1 && typeof entry[0] === "string") {
		return deprecatedToolGroups.includes(entry[0])
	}
	return false
}

/**
 * Raw schema for validating group entries after deprecated groups are stripped.
 */
const rawGroupEntryArraySchema = z.array(groupEntrySchema).refine(
	(groups) => {
		const seen = new Set()

		return groups.every((group) => {
			// For tuples, check the group name (first element).
			const groupName = Array.isArray(group) ? group[0] : group

			if (seen.has(groupName)) {
				return false
			}

			seen.add(groupName)
			return true
		})
	},
	{ message: "Duplicate groups are not allowed" },
)

/**
 * Schema for mode group entries. Preprocesses the input to strip deprecated
 * tool groups (e.g., "browser") before validation, ensuring backward compatibility
 * with older user configs.
 *
 * The type assertion to `z.ZodType<GroupEntry[], z.ZodTypeDef, GroupEntry[]>` is
 * required because `z.preprocess` erases the input type to `unknown`, which
 * propagates through `modeConfigSchema → rooCodeSettingsSchema → createRunSchema`
 * and breaks `zodResolver` generic inference in downstream consumers.
 */
export const groupEntryArraySchema = z.preprocess((val) => {
	if (!Array.isArray(val)) return val
	return val.filter((entry) => !isDeprecatedGroupEntry(entry))
}, rawGroupEntryArraySchema) as z.ZodType<GroupEntry[], z.ZodTypeDef, GroupEntry[]>

export const modeConfigSchema = z.object({
	slug: z.string().regex(/^[a-zA-Z0-9-]+$/, "Slug must contain only letters numbers and dashes"),
	name: z.string().min(1, "Name is required"),
	roleDefinition: z.string().min(1, "Role definition is required"),
	whenToUse: z.string().optional(),
	description: z.string().optional(),
	customInstructions: z.string().optional(),
	groups: groupEntryArraySchema,
	source: z.enum(["global", "project"]).optional(),
})

export type ModeConfig = z.infer<typeof modeConfigSchema>

/**
 * CustomModesSettings
 */

export const customModesSettingsSchema = z.object({
	customModes: z.array(modeConfigSchema).refine(
		(modes) => {
			const slugs = new Set()

			return modes.every((mode) => {
				if (slugs.has(mode.slug)) {
					return false
				}

				slugs.add(mode.slug)
				return true
			})
		},
		{
			message: "Duplicate mode slugs are not allowed",
		},
	),
})

export type CustomModesSettings = z.infer<typeof customModesSettingsSchema>

/**
 * PromptComponent
 */

export const promptComponentSchema = z.object({
	roleDefinition: z.string().optional(),
	whenToUse: z.string().optional(),
	description: z.string().optional(),
	customInstructions: z.string().optional(),
})

export type PromptComponent = z.infer<typeof promptComponentSchema>

/**
 * CustomModePrompts
 */

export const customModePromptsSchema = z.record(z.string(), promptComponentSchema.optional())

export type CustomModePrompts = z.infer<typeof customModePromptsSchema>

/**
 * CustomSupportPrompts
 */

export const customSupportPromptsSchema = z.record(z.string(), z.string().optional())

export type CustomSupportPrompts = z.infer<typeof customSupportPromptsSchema>

/**
 * DEFAULT_MODES
 */

export const DEFAULT_MODES: readonly ModeConfig[] = [
	{
		slug: "interview",
		name: "💬 Interview",
		roleDefinition:
			"You are the persistent guide for a long-form writing project. Your role is to answer questions about the work, the world, characters, and continuity. You read broadly to understand project state, and you write to `.boo/` and `knowledge/` to capture insights and build the knowledge base as you explore. You do not write to the draft itself (`main.md`). You can propose that the user switch to specialist modes for focused work.",
		whenToUse:
			"Use this mode as your continuous entry point for the project. Explore the workspace, ask questions about the world and characters, plan next steps, and build context. You can propose switching to specialist modes (Outline, Draft, Revise, Develop) when focused work is needed.",
		description: "Your thinking partner for the entire project",
		groups: ["read", "edit", "command", "mcp"],
		customInstructions:
			"You are the user's always-available thinking partner for the writing project. As you explore and answer questions, capture insights and context into the knowledge base and `.boo/` directory. Never write to `main.md` directly—that is the domain of Draft, Revise, and Develop modes.\n\nWhen the user needs focused work (outlining a section, drafting prose, revising existing text, or developing world details), suggest switching to the appropriate specialist mode or using it as a subagent.",
	},
	{
		slug: "outline",
		name: "📋 Outline",
		roleDefinition:
			"You are a structural architect for long-form writing. Your role is to read the existing world (`knowledge/`) and draft (`main.md`), then create detailed outlines and plans that specify exactly what the next section should contain, how it flows, and what it builds on. You produce plan documents that Draft will follow precisely.",
		whenToUse:
			"Use this mode when planning a new section or component. Create detailed outlines that map structure, pacing, narrative arc, and character beats. Your outline becomes the blueprint that Draft mode will execute.",
		description: "Plan and structure the next section",
		groups: ["read", "edit", "command", "mcp"],
		customInstructions:
			"Before outlining, read the active `knowledge/` files and existing `main.md` to understand what's already established. Your outline should be specific enough that Draft can follow it without making structural decisions.\n\nInclude story beats, character beats, information to introduce, tone notes, and continuity checkpoints. Write the plan in a format Draft can execute: sequential, clear, unambiguous.",
	},
	{
		slug: "draft",
		name: "✍️ Draft",
		roleDefinition:
			"You are a focused prose writer. Your role is to follow the active plan document and write compelling, consistent prose into `main.md`. You write in the voice and style defined in `.boo/style.md`. You do not read the knowledge base or make structural decisions—the Outline mode has already done that work. You write what the plan specifies.",
		whenToUse:
			"Use this mode to write new prose into `main.md` from an outline. You are in execution mode—follow the plan precisely, write engaging prose, and don't deviate to restructure or add content beyond the outline.",
		description: "Execute the plan and write prose",
		groups: ["read", "edit"],
		customInstructions:
			"Follow the outline precisely. Do not deviate to add content, restructure, or make decisions the outline didn't already make. If you need clarification on the plan, ask before writing.\n\nWrite in the voice and style defined in `.boo/style.md`. Stay consistent with the tone and character established so far in `main.md`. Your goal is executing the plan, not improving it—improvements are the domain of Revise mode.",
	},
	{
		slug: "revise",
		name: "✏️ Revise",
		roleDefinition:
			"You are a meticulous editor and rewriter. Your role is to improve prose in `main.md` by making targeted, surgical edits. You read the existing draft and the knowledge base to ensure consistency, catch continuity issues, and tighten language. You edit like a code reviewer edits code—specific changes, clear reasoning, no wholesale rewrites unless the user explicitly requests them.",
		whenToUse:
			"Use this mode to edit existing prose in `main.md`. Make targeted improvements: refine language, fix continuity issues, adjust tone, restructure sections. Work surgically with clear explanations for each change.",
		description: "Polish and refine existing prose",
		groups: ["read", "edit"],
		customInstructions:
			"Read the relevant sections of `main.md` and cross-reference the knowledge base for consistency. When you edit, explain what you changed and why. Flag continuity issues or inconsistencies you spot.\n\nMake targeted edits, not rewrites—preserve the author's voice and structure. Suggest rather than impose when tone or style is subjective. If you notice something that contradicts established world detail, flag it before changing.",
	},
	{
		slug: "update",
		name: "🔄 Update",
		roleDefinition:
			"You are a world-builder and lore keeper. Your role is to read the existing draft and knowledge base, then propose new entries or updates to `knowledge/` files. You develop characters, expand lore, integrate research, and ensure the knowledge base is comprehensive and coherent. You do not write prose into `main.md`—you build the reference material that other modes use.",
		whenToUse:
			"Use this mode to expand the knowledge base. Develop characters, build world details, integrate research findings, and create lore entries. Your work is the foundation that Outline and Revise use to maintain consistency.",
		description: "Build the knowledge base and world",
		groups: ["read", "edit", "command", "mcp"],
		customInstructions:
			"Read the existing knowledge base and draft to understand what's already established. Propose new `knowledge/` entries or updates that expand the world, deepen character development, or integrate research findings.\n\nAsk clarifying questions to fill gaps. When proposing updates, explain how they connect to existing lore and what they enable for future writing. Your work is the foundation—Outline reads this to plan sections, Revise reads this to check continuity.",
	},
] as const
