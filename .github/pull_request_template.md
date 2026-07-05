> Before you fill this in, please read [CONTRIBUTING.md](../CONTRIBUTING.md) — it is the single source of truth for setup, workflow, commit rules, and review expectations.
>
> By opening this PR, you confirm you have read and agree to follow the project's [Code of Conduct](../CODE_OF_CONDUCT.md). Reviewers will enforce it; the bar for review feedback is "professional, on-topic, kind".

## Summary

<!-- Briefly describe what this PR does and why. 1-3 sentences. The "why" matters more than the "what" — git diff already shows the "what". -->

## Related Issue

<!-- Link the issue this PR addresses. Use one of: Closes / Fixes / Resolves / Relates to -->
<!-- Examples: Closes #123, Fixes #456, Relates to #789 -->

Closes #

## Type of Change

<!-- Check ALL that apply -->

- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that causes existing functionality to behave differently)
- [ ] 📝 Documentation update
- [ ] 🎨 UI / UX improvement
- [ ] ♻️ Refactor (no functional change)
- [ ] ⚡ Performance improvement
- [ ] 🔧 Chore (build, CI, tooling, dependencies)

## Changes

<!-- Bullet list of the user-visible or reviewer-visible changes. Skip internal cleanup unless it deserves a callout. -->

-

## Screenshots / Recordings

<!-- Required for any UI / UX change. Add before / after comparisons, GIFs, or short clips.
     Remove this section (not just empty it) if your change is invisible to users. -->

| Before | After |
| :----: | :---: |
|        |       |

## How to Test

<!-- Step-by-step instructions a reviewer can re-run on the Preview Deployment below. -->

1.
2.
3.

## Preview Deployment

<!-- Vercel bot posts a preview URL on every PR. Paste it here so reviewers don't have to scroll. -->

Preview URL:

## Architecture / Implementation Notes

<!-- For PRs > ~300 lines of diff or touching 5+ files, explain the shape here.
     Specifically call out:
     - FSD layer placement (which slice, why not lower)
     - New shared component / service / store
     - Cross-feature import (avoid unless unavoidable — explain why)
     - New dependency and why it was needed
     - Trade-offs, known limitations, follow-up work -->

-

## Checklist

<!-- PRs that don't satisfy the mandatory items will not be merged. -->

### Code Quality

- [ ] My code follows the project's [AGENTS.md](../AGENTS.md) (FSD layout, `App`-prefixed UI components, function declarations, RHF + Zod, Tailwind utilities, etc.)
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, especially in non-obvious areas
- [ ] No new Biome warnings or errors (`pnpm check`)
- [ ] TypeScript compiles cleanly (`pnpm typecheck`)
- [ ] I have not introduced a cross-feature import (or explained why in **Architecture Notes** above)
- [ ] No new public-API surface in `src/shared/ui/*` or `src/services/*` without an entry in **Architecture Notes**

### Commits & Branch

- [ ] My commits follow [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `feat:`, `fix:`, `chore(deps):`)
- [ ] Commit headers are ≤ 200 characters (matches `commitlint.config.js`)
- [ ] Body lines are ≤ 200 characters (matches `commitlint.config.js`)
- [ ] My branch is up to date with the target branch (rebased or merged)
- [ ] Lefthook pre-commit / pre-push hooks pass locally

### Manual Smoke Test

<!-- The project does not yet have a test suite (see AGENTS.md). Manual smoke testing is the bar until then. -->

- [ ] I ran `pnpm dev` and the affected route renders without console errors
- [ ] I ran `pnpm build` locally and it succeeded
- [ ] I exercised the happy path described in **How to Test** above on the Vercel preview
- [ ] I exercised at least one edge / failure path (bad input, empty state, error state)

### Accessibility & i18n

<!-- Skip the i18n item if your change does not touch visible copy. -->

- [ ] Interactive controls have accessible labels (visible text or `aria-label`)
- [ ] Keyboard-only navigation works for any new interactive element
- [ ] Touched copy is present in both `en` and `vi` (or only one — and you noted which)

### Documentation

- [ ] I have updated relevant documentation ([README.md](../README.md), [AGENTS.md](../AGENTS.md), JSDoc, Storybook, etc.)
- [ ] If this PR changes contributor-facing flow, [CONTRIBUTING.md](../CONTRIBUTING.md) reflects the new flow
- [ ] I have updated relevant documentation (README, AGENTS.md, JSDoc, Storybook, etc.)

### Conduct

- [ ] I have read and agree to follow the [Code of Conduct](../CODE_OF_CONDUCT.md)

### Deployment & Breaking Changes

- [ ] No new environment variables or secrets are required
- [ ] I checked the Vercel build log on the preview deployment and there are no new warnings
- [ ] No breaking changes, **OR** any breaking changes are clearly documented in **Architecture / Implementation Notes** above and called out in the commit message (`!` or `BREAKING CHANGE:` footer)

## Additional Context

<!-- Anything reviewers should know: blockers, follow-up issues, related PRs, CI screenshots, logs, screenshots of the Vercel deployment page, etc. -->