# Boo Code Changelog

All notable changes to Boo Code will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and Boo Code uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Note:** Boo Code is a fork of Zoo Code. For the full history prior to version 3.56.0, see the [Zoo Code repository](https://github.com/Zoo-Code-Org/Zoo-Code).

---

## 3.57.0

### Changes

- Fork from Zoo Code; rebrand to Boo Code under Anthologist Inc.

---

## 3.56.0

### Minor Changes

- Add Claude Opus 4.8 support across Anthropic, Bedrock, and Vertex providers (PR #386 by @vandre-sales)
- Add Opencode Go as a first-class provider (#172 by @vijay-0001, PR #319 by @proyectoauraorg)
- Add glm-5.1, kimi-k2.6, and deepseek-v4-pro models to the Fireworks provider (#198 by @DeCodeTheWeb, PR #231 by @proyectoauraorg)
- Show Zoo Code identity in outbound provider activity logs (#203 by @yfdyh000, PR #219 by @app/roomote)
- Fix API requests hanging indefinitely on VS Code 1.122.0+ (#381 by @greatgradz-svg, #382 by @abcxlab, PR #383 by @app/roomote)
- Fix terminal task cancellation so the running process is terminated when a task is cancelled (#245 by @proyectoauraorg, PR #261 by @proyectoauraorg)
- Fix terminal Ctrl+C retry so processes that need multiple SIGINT signals are properly stopped (#266 by @edelauna, PR #272 by @proyectoauraorg)
- Fix Gemini provider to honor custom model IDs instead of falling back to the default (#227 by @notoccupy2023-design, PR #317 by @proyectoauraorg)
- Fix truncated Grok diffs caused by missing diff markers (#186 by @jcalfee, PR #230 by @proyectoauraorg)
- Fix PowerShell detection on Windows when no shell profile is configured (#82 by @rossdonald, PR #239 by @proyectoauraorg)
- Fix Vertex AI warning when the Google Cloud Credentials field receives a file path instead of JSON (PR #294 by @0xMink)
- Rename Zoo Code in VS Code code actions (#328 by @rrewll, PR #329 by @rrewll)
- Localize VS Code code action commands (#334 by @edelauna, PR #339 by @rrewll)
- Migrate webview build to Vite 8 (PR #214 by @maxdewald)
- Add comprehensive unit tests for AskFollowupQuestionTool and ListFilesTool (#206 by @app/roomote, PR #212, #213 by @proyectoauraorg)
- Update `diff` to v5.2.2 for a security fix (PR #173 by @app/renovate)
- Update `i18next-http-backend` to v3.0.5 for a security fix (PR #174 by @app/renovate)
- Update `fast-xml-parser` to v5.7.0 for a security fix (PR #175 by @app/renovate)
- Update `simple-git` to v3.36.0 for a security fix (PR #182 by @app/renovate)
- Update `uuid` and pin esbuild/rollup/vite for a security fix (PR #205 by @app/renovate)
- Update `turbo` to v2.9.14 for a security fix (PR #236 by @app/renovate)
