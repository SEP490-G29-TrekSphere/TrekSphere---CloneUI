## Summary

<!-- Briefly describe what this PR does and why. 1-3 sentences. -->

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
- [ ] ✅ Test update
- [ ] 🔧 Chore (build, CI, tooling, dependencies)

## Changes

<!-- Describe the key changes. List files / modules touched at a high level. -->

-
-
-

## Screenshots / Recordings

<!-- Required for any UI change. Add before / after comparisons, GIFs, or short clips. -->
<!-- Remove this section if not applicable. -->

| Before | After |
| :----: | :---: |
|        |       |

## How to Test

<!-- Step-by-step instructions a reviewer can follow to verify the change. -->

1.
2.
3.

## Architecture / Implementation Notes

<!-- Highlight non-obvious decisions: FSD layer placement, new shared component, new dependency, trade-offs, follow-ups. -->

-

## Checklist

<!-- PRs that don't satisfy the mandatory items will not be merged. -->

### Code Quality

- [ ] My code follows the project's [GUIDELINES.md](./GUIDELINES.md) (FSD layout, `App`-prefixed UI components, function declarations, RHF + Zod, Tailwind utilities, etc.)
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, especially in non-obvious areas
- [ ] No new Biome warnings or errors (`pnpm check`)
- [ ] TypeScript compiles cleanly (`pnpm typecheck`)

### Commits & Branch

- [ ] My commits follow [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `feat:`, `fix:`, `chore(deps):`)
- [ ] Commit headers are ≤ 100 characters
- [ ] My branch is up to date with the target branch (rebased or merged)
- [ ] Lefthook pre-commit / pre-push hooks pass locally

### Testing

- [ ] I have added or updated tests for my changes
- [ ] All existing tests pass locally
- [ ] Manual testing has been performed (dev server / build / preview)

### Documentation

- [ ] I have updated relevant documentation (README, GUIDELINES, JSDoc, Storybook, etc.)

### Deployment & Breaking Changes

- [ ] No new environment variables or secrets are required
- [ ] No breaking changes, **OR** any breaking changes are clearly documented in the **Changes** section above and called out in the commit message (`!` or `BREAKING CHANGE:` footer)

## Additional Context

<!-- Anything reviewers should know: blockers, follow-up issues, related PRs, CI screenshots, logs, etc. -->