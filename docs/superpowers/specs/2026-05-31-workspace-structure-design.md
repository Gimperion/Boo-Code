# Boo Code — Workspace Structure Design

**Date:** 2026-05-31  
**Status:** Approved  
**Author:** Tom Shen + Boo Code AI

---

## Overview

A Boo Code workspace is a folder a writer opens in VSCode representing a long-form writing project — primarily a single work (novel, screenplay, essay) that may optionally contain related works and reference material. Initializing a workspace scaffolds a conventional directory structure that works out of the box, with the root manifest able to override conventions for power users.

---

## Design Principles

- **Convention over configuration** — the scaffold works without touching the manifest; the manifest can override defaults
- **AI-maintained, human-editable** — AI generates and updates manifest and plan files; writers correct and annotate
- **Git as version control** — no internal draft versioning; Boo Code surfaces git checkpoint commands instead
- **Backend-agnostic knowledge** — the knowledge pillar declares its backend rather than enforcing a structure
- **Explicit over hidden** — collaborative documents (plans, manifests) are visible first-class files, not hidden implementation details

---

## Workspace Root Structure

```
my-novel/
├── workspace.boo.md          # Root manifest: identity, bibliographic info, component relationships
├── .boo/                     # AI operating context: style, instructions, settings
├── knowledge/                # Living canon: lore, research, world knowledge
│   ├── knowledge.boo.md      # Knowledge backend declaration + config
│   └── ...                   # Contents vary by backend (flat markdown or VDB)
└── components/               # Writing units: chapters, scenes, short stories, etc.
    └── 01-the-beginning/
        ├── component.boo.md  # Component manifest + AI relationship description
        ├── main.md           # Primary content
        ├── plans/            # One plan file per creation/revision cycle
        │   └── plan-draft.md
        └── notes/            # Writer-owned scratchpad and research
```

---

## workspace.boo.md — Root Manifest

The root manifest is the first file Boo Code reads when opening a workspace. It is AI-maintained and human-editable. It serves two purposes:

1. **Identity and bibliographic info** — title, author, genre, and other top-level metadata
2. **Component relationship map** — a growing, AI-authored narrative description of how components relate to each other and to the work as a whole

### Structure

```markdown
---
title: "My Novel"
author: "Tom Shen"
genre: "Literary Fiction"
language: "en"
pillars:
    meta: ".boo" # override default pillar locations here
    knowledge: "knowledge"
    components: "components"
---

## About This Workspace

[AI-authored narrative description of the workspace — what the work is, its themes, its scope.]

## Component Relationships

[AI-maintained section. Updated each time a component is added or substantially revised.
Each component entry is a rich narrative description of the component's role, what precedes
and follows it, key thematic or narrative elements, and how it relates to other components.
Written as a prompt-ready context block for AI consumption.]
```

### Behavior

- Updated automatically by Boo Code when a component is added or substantially revised
- The component relationships section grows over time as the work develops
- Writer can edit any section; AI will not overwrite human edits, only append/update its own sections
- Pillar locations in frontmatter override convention defaults

---

## .boo/ — Meta Pillar

The AI's operating context for the workspace. Read by Boo Code at the start of every operation.

```
.boo/
├── style.md          # Voice, tone, genre conventions, style guide
├── instructions.md   # Behavioral guardrails, AI persona for this workspace
└── settings.json     # Technical config: model, context settings, pillar overrides
```

### style.md

Writer-authored (AI may propose additions). Contains:

- The writer's voice and prose style
- Genre conventions to follow or subvert
- Stylistic rules (POV, tense, sentence length preferences, etc.)
- Any style guide references

### instructions.md

Writer-authored (AI may propose additions). Contains:

- Behavioral guardrails (what the AI should and should not do)
- AI persona for this workspace
- Content boundaries and sensitivities
- Workflow preferences

### settings.json

Primarily machine-managed. Contains:

- Model selection and parameters
- Context window settings
- File inclusion/exclusion patterns
- Any pillar path overrides (mirrors frontmatter in workspace.boo.md)

---

## knowledge/ — Knowledge Base Pillar

The living canon of the workspace. Collaboratively maintained by the writer and Boo Code. Accumulates both what the writer knows before writing begins and what the AI learns from components as they are written.

### knowledge.boo.md

A required index file at the root of the knowledge pillar. Declares the knowledge backend in use and any relevant configuration. Makes the knowledge pillar backend-agnostic — the same pillar structure works whether content is flat Markdown or stored in a vector database.

```markdown
---
backend: "markdown" # options: markdown, lancedb (future)
indexed: false # true when a VDB index has been built
---

## Knowledge Base

[Description of what this knowledge base covers and how it is organized.]
```

### Contents

- Writer organizes knowledge files however they want — no enforced subdirectory schema
- Boo Code reads all files in this pillar for context
- When Boo Code learns something new from a component (character detail, world fact, continuity point), it proposes an update to the relevant knowledge file — the writer reviews and accepts
- When a VDB backend is available, `knowledge.boo.md` will declare it and Boo Code will use it for semantic retrieval instead of full-file reads

---

## components/ — Components Pillar

Each component is a named folder representing a discrete writing unit. Component type is freeform — "chapter", "scene", "short story", "poem", "interlude", etc. The writer names the folder; Boo Code identifies the component by its `component.boo.md` manifest.

### Component Scaffold

```
components/
└── 01-the-beginning/
    ├── component.boo.md     # Manifest: metadata + AI relationship description
    ├── main.md              # Primary content
    ├── plans/               # Planning documents, one per creation/revision cycle
    │   └── plan-draft.md
    └── notes/               # Writer-owned scratchpad, research, loose ideas
```

### component.boo.md

AI-maintained, human-editable. Contains:

**Frontmatter (machine-readable):**

```yaml
title: "The Beginning"
type: "chapter" # freeform string, writer-defined
status: "draft" # draft | revised | final
word_count: 0
created: 2026-05-31
modified: 2026-05-31
```

**Body (AI-maintained narrative):**
A rich, prompt-ready description of this component — what it is, where it fits in the larger work, what precedes and follows it, key thematic and narrative elements, and how it relates to other components. Updated by Boo Code when the component is substantially revised.

### plans/

Contains one Markdown plan file per creation or revision cycle. Plan files are named by Boo Code using a conventional scheme:

| File                 | Purpose                    |
| -------------------- | -------------------------- |
| `plan-draft.md`      | Original creation plan     |
| `plan-revision-1.md` | First major revision plan  |
| `plan-revision-2.md` | Second major revision plan |

Each plan file is AI-generated and writer-annotated. Boo Code drafts the plan based on workspace context and the component's position in the work. The writer corrects, adds direction, and annotates subsections. Boo Code reads the current plan as its primary instruction set when writing or revising `main.md`.

Old plan files are never deleted or overwritten — a new file is created for each cycle. This preserves the full planning history in a human-readable form without relying solely on git history, since a revision plan is a fundamentally different document from a creation plan (not an evolution of it).

### notes/

Writer-owned. Freeform. Boo Code does not read or write to this directory by default. Used for research, scratchpad writing, loose ideas, and anything the writer wants to keep close to the component without it entering the AI's context.

### Version Control

Boo Code does not maintain its own draft history. Git is the version control layer. Boo Code surfaces a "checkpoint component" command that commits the current state of a component with an AI-generated commit message. Writers use this before starting a new revision cycle.

---

## Lifecycle: Adding a Component

1. Writer invokes "New Component" command
2. Boo Code prompts for a folder name and component type
3. Scaffold is created: `component.boo.md`, `main.md`, `plans/`, `notes/`
4. Boo Code generates `plan-draft.md` based on workspace context and position in the work
5. Boo Code updates `workspace.boo.md` with a narrative entry for the new component
6. Writer reviews and annotates `plan-draft.md`
7. Writer invokes "Write Component" — Boo Code writes `main.md` using `plan-draft.md` as instruction set

## Lifecycle: Revising a Component

1. Writer invokes "Checkpoint Component" — Boo Code commits current state to git
2. Writer invokes "New Revision Plan" — Boo Code creates `plan-revision-N.md`
3. Writer reviews and annotates the new revision plan
4. Writer invokes "Revise Component" — Boo Code revises `main.md` using the new plan
5. Boo Code updates `component.boo.md` and `workspace.boo.md` to reflect the revised state

---

## Open Questions (Deferred)

- **Knowledge VDB:** Internal structure of `knowledge/` when using lancedb or another vector database. `knowledge.boo.md` is designed to declare the backend when this is resolved.
- **Knowledge UX:** How the writer interacts with the knowledge base — browsing, searching, adding entries manually.
- **Multi-work workspaces:** How a workspace containing multiple related works (Option B from initial scoping) is structured within `components/`. Likely a convention like a `type: "project"` component that contains its own `main/` subfolder, but deferred.
