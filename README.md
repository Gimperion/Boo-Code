# Boo Code

> A fork of Zoo Code, which was forked from Roo Code.

## What is Boo Code?

**Boo Code** is a novel fork of [Zoo Code](https://github.com/Zoo-Code-Org/Zoo-Code), itself a community continuation of [Roo Code](https://github.com/RooVetGit/Roo-Code) after the Roo team wound down active development in May 2025 to focus on [Roomote](https://roomote.dev/).

We are grateful to the Roo Code and Zoo Code teams for the exceptional work they put into this project. Boo Code builds directly on their foundation.

---

## Lineage

```
Roo Code  →  Zoo Code  →  Boo Code
```

- **Roo Code** — The original project, created and maintained by the Roo team.
- **Zoo Code** — A community fork that continued development after Roo Code was discontinued. Zoo Code is maintained by contributors who care deeply about the plugin and its community.
- **Boo Code** — This project. A fork of Zoo Code taking the codebase in a new direction.

---

## Local Setup & Development

1. **Clone** the repo:

```sh
git clone https://github.com/gimperion/Boo-Code.git
```

2. **Install dependencies**:

```sh
pnpm install
```

3. **Run the extension**:

There are several ways to run the Boo Code extension:

### Development Mode (F5)

For active development, use VSCode's built-in debugging:

Press `F5` (or go to **Run** → **Start Debugging**) in VSCode. This will open a
new VSCode window with the Boo Code extension running.

- Changes to the webview will appear immediately.
- Changes to the core extension will also hot reload automatically.

### Automated VSIX Installation

To build and install the extension as a VSIX package directly into VSCode:

```sh
pnpm install:vsix [-y] [--editor=<command>]
```

This command will:

- Ask which editor command to use (code/cursor/code-insiders) - defaults to 'code'
- Uninstall any existing version of the extension.
- Build the latest VSIX package.
- Install the newly built VSIX.
- Prompt you to restart VS Code for changes to take effect.

Options:

- `-y`: Skip all confirmation prompts and use defaults
- `--editor=<command>`: Specify the editor command (e.g., `--editor=cursor` or `--editor=code-insiders`)

### Manual VSIX Installation

If you prefer to install the VSIX package manually:

1. First, build the VSIX package:
    ```sh
    pnpm vsix
    ```
2. A `.vsix` file will be generated in the `bin/` directory.
3. Install it manually using the VSCode CLI:
    ```sh
    code --install-extension bin/boo-code-<version>.vsix
    ```

---

We use [changesets](https://github.com/changesets/changesets) for versioning and publishing. Check our `CHANGELOG.md` for release notes.

---

## Disclaimer

**Please note** that Boo Code does **not** make any representations or
warranties regarding any code, models, or other tools provided or made available
in connection with Boo Code, any associated third-party tools, or any resulting
outputs. You assume **all risks** associated with the use of any such tools or
outputs; such tools are provided on an **"AS IS"** and **"AS AVAILABLE"** basis.
Such risks may include, without limitation, intellectual property infringement,
cyber vulnerabilities or attacks, bias, inaccuracies, errors, defects, viruses,
downtime, property loss or damage, and/or personal injury. You are solely
responsible for your use of any such tools or outputs (including, without
limitation, the legality, appropriateness, and results thereof).

---

## Contributing

We love community contributions! Get started by reading our
[CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

[Apache 2.0](./LICENSE)
