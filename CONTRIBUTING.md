# Contributing to TrekSphere Frontend

Thanks for your interest in contributing. This project is the React 19 + TypeScript
frontend for TrekSphere, and every PR — whether it is a one-line typo fix or a
brand-new feature — goes through the same flow.

By participating, you agree to follow our
[Code of Conduct](./CODE_OF_CONDUCT.md). It is short; please read it.

> **Before you start.** This is a real production app, not a tutorial playground.
> The frontend talks to a backend at `VITE_API_URL` (default
> `http://localhost:3000/api`). Make sure you can run the project and see real
> data in the browser before opening a PR.

---

## 1. Where to start

The fastest path depends on what you want to do:

| If you want to…                              | Start here                                                                              |
| -------------------------------------------- | --------------------------------------------------------------------------------------- |
| Fix a typo, broken link, or small docs issue | Open a PR directly — no issue needed. Follow the [docs template][docs-issue].           |
| Report a bug                                 | Open an issue using the [bug report template][bug-issue]. Repro steps required.         |
| Propose a feature                            | Open an issue using the [feature request template][feature-issue] first.                 |
| Ask a question                               | Open an issue using the [question template][question-issue]. For broader help, prefer Discussions. |
| Report a security vulnerability               | **Do not open a public issue.** See [SECURITY.md](./SECURITY.md).                       |

[bug-issue]: ./.github/ISSUE_TEMPLATE/bug.yml
[feature-issue]: ./.github/ISSUE_TEMPLATE/feature.yml
[question-issue]: ./.github/ISSUE_TEMPLATE/question.yml
[docs-issue]: ./.github/ISSUE_TEMPLATE/docs.yml

If your change will touch the architecture (new top-level slice, new external
service, new global store, breaking routing changes), open an issue **before**
writing code. A 15-minute conversation saves a 3-day rewrite.

---

## 2. Local setup

You need:

- **Node.js 22+** (`node --version`)
- **pnpm 11.9+** (`npm install -g pnpm@11`)

Then:

```bash
git clone <repo-url>
cd TrekSphere_FE
pnpm install          # also runs `pnpm prepare`, which installs Lefthook git hooks
cp .env.example .env  # if a .env.example exists; otherwise create a .env with VITE_API_URL=...
pnpm dev              # → http://localhost:5173
```

Sanity-check your toolchain before touching code:

```bash
pnpm check          # Biome lint + format
pnpm typecheck      # TypeScript strict
```

Both must pass before you push. Lefthook will run them for you automatically;
see [Section 6](#6-pre-commit--pre-push-checks) below.

---

## 3. Project conventions (the short version)

The full rules live in [`AGENTS.md`](./AGENTS.md). Do not duplicate them
here — that is how rules go stale. Read this short version once, then go read
the long one when something is unclear.

- **Architecture: FSD.** `src/features/<name>` is independent. Cross-feature
  imports go through `src/shared`, `src/services`, or `src/store`. Never import
  one feature directly into another.
- **Components: function declarations, not arrow functions.** Components in
  `src/shared/ui/` must be `App`-prefixed (`AppButton`, `AppCard`, …).
- **Styling: Tailwind utility classes only.** No inline styles except for
  truly dynamic values.
- **Forms: React Hook Form + Zod.** Validation schema lives next to the form.
- **Server state: React Query.** API calls go in `src/services/` or
  `src/features/<x>/services/`. Never call `axios` from a component.
- **Global state: Zustand stores** in `src/store/`. Keep them tiny.
- **Lint/format: Biome** (not ESLint + Prettier). Run `pnpm check` before
  pushing.
- **Public APIs: never break the export surface** of `src/shared/ui/*` or
  `src/services/*` without a deprecation step. Ask in the PR if in doubt.

For the architecture overview, also see [`AGENTS.md`](./AGENTS.md).

---

## 4. Workflow

1. **Branch off `main`.** Use a short, descriptive branch name:
   `fix/tour-card-overflow`, `feat/newsletter-opt-in`, `docs/clarify-fsd-rules`.
2. **Make focused commits.** One logical change per commit. Smaller is better.
3. **Write good commit messages** (see Section 5).
4. **Open the PR** using the [PR template][pr-template]. Fill in every section,
   including a screenshot for any UI change.
5. **Respond to review.** Reviews are the fastest way to land — push a fix
   rather than explain why something is fine.
6. **Squash-merge** is the default on `main`; keep your history clean by
   rebasing before requesting review.

[pr-template]: ./.github/pull_request_template.md

If your PR is more than ~300 lines of diff or touches 5+ files, write a short
note in `## Architecture / Implementation Notes` explaining the shape.

---

## 5. Commit messages

This project uses [Conventional Commits][conv-commits], enforced by
commitlint on every commit message. The rule of thumb is `type(scope): subject`.

```text
feat(tours): add price-range filter to search results
fix(auth): stop redirect loop when refresh token expires
docs(readme): clarify VITE_API_URL default
chore(deps): bump @tanstack/react-query to 5.101.2
refactor(profile): extract useProfileQuery into shared hook
```

- **Header ≤ 200 characters** (configured in `commitlint.config.js`; CI will reject longer).
- **Body lines ≤ 200 characters.**
- Use **imperative mood** ("add", not "added").
- Use `!` or a `BREAKING CHANGE:` footer for anything that breaks the public
  API surface of `src/shared/ui/*` or `src/services/*`.

[conv-commits]: https://www.conventionalcommits.org/

The PR template's `Commits & Branch` checklist mirrors these rules; tick them
off before requesting review.

---

## 6. Pre-commit / pre-push checks

Lefthook is configured in `lefthook.yml` and runs automatically once
`pnpm install` completes (it is invoked by the `prepare` script).

| Hook        | Runs                | Command                                            |
| ----------- | ------------------- | -------------------------------------------------- |
| `pre-commit` | Staged files        | `pnpm biome check --write --staged`                |
| `commit-msg` | Commit message      | `pnpm commitlint --edit {1}`                       |
| `pre-push`   | Before push         | `pnpm typecheck`                                   |

If a hook blocks you locally:

```bash
pnpm check:fix        # biome auto-fix (safe)
pnpm check:fix:unsafe # biome auto-fix including unsafe (use with care)
```

> **Don't bypass the hooks with `--no-verify`.** CI runs the same checks; the
> push will just fail later.

---

## 7. What we review for

A reviewer will look for, roughly in this order:

1. **Correctness and safety.** Does it work? What happens on bad input?
2. **Tests.** For bug fixes: a regression test. For features: coverage of the
   happy path plus one or two edge cases. (Today the project does not have a
   test suite; the bar is "manual smoke test passed", and that should improve
   soon — see [`AGENTS.md`](./AGENTS.md).)
3. **FSD placement.** Could this live one slice lower without losing
   reusability? Did the change introduce a cross-feature import?
4. **UX consistency.** Does the new component match existing `App*` UI?
   Are form errors rendered through the same primitives?
5. **Performance.** Avoid `useEffect` for derivable state; memoize heavy
   computations; don't fetch in render.
6. **Accessibility and i18n.** Interactive elements need labels; the app has
   Vietnamese and English copy — keep both in sync when adding visible text.
7. **Commit hygiene.** Conventional Commits, scoped, no `wip` commits.

If your PR is small and the change is obvious, expect a quick "LGTM". If the
PR touches the API client or auth, expect more questions — those areas have
production risk.

---

## 8. Reporting issues & asking questions

- **Bugs.** Use the [bug template][bug-issue]. Repro steps are non-negotiable.
- **Questions.** Use the [question template][question-issue]. Search before
  asking; we close "did not search" issues quickly.
- **Security.** Private disclosure only — see [SECURITY.md](./SECURITY.md).
- **Behavior problems.** Report conduct issues to the contacts in
  [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md), not in a public issue.

---

## 9. Recognition

Contributors are credited in the GitHub release notes when their PR ships.
Security reporters are credited in [SECURITY.md](./SECURITY.md) (anonymity on
request).

---

## 10. License

By contributing, you agree that your contributions are licensed under the
project's [MIT License](./LICENSE). You retain copyright on your own code; you
grant the project a license under MIT to use, modify, and redistribute it.