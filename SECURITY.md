# Security Policy

This document explains how to report a security vulnerability in TrekSphere
Frontend and how the team handles disclosures. It is the private funnel
referenced from `CODE_OF_CONDUCT.md` and the issue template `security.yml`.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| `main`  | ✅ Yes — actively maintained |
| Anything else (old feature branches, forks) | ❌ No — please open an issue or PR against `main` instead. |

This project is the **frontend only**. A real-world security report may be
about either:

- this React/TypeScript app (XSS via dangerously-set HTML, auth token leakage,
  insecure storage of credentials, mis-set CSP/CORS, dependency CVEs in
  `package.json`), **or**
- the TrekSphere backend at the URL configured by `VITE_API_URL` (auth,
  bookings, payments, tours). **In the second case you must contact the
  backend maintainers, not us** — the Frontend team cannot fix backend issues
  and has no insight into that codebase. Look up the backend repo or ask in
  the team channel before opening a private Advisory here.

## Reporting a Vulnerability

**Do not open a public GitHub issue for security issues.** Public disclosure
before a fix is shipped can put users at risk.

Pick the channel that fits the report:

1. **Private GitHub Security Advisory (preferred).**
   Open one at:
   <https://github.com/SEP490-G29-TrekSphere/TrekSphere_FE/security/advisories/new>
   You can mark it as a security vulnerability, fill in the affected versions /
   proof-of-concept, and submit. Only maintainers can see it.

2. **Email.**
   Send a report to `conduct@treksphere.dev` (placeholder — replace with the
   real team alias before publishing). Use this if you do not have a GitHub
   account or if the issue spans organizations.

In either channel, please include:

- A short description of the vulnerability and its impact.
- Reproduction steps (exact URL, exact user state, exact payload).
- Affected commit / version (prefer `main` SHA, or `vX.Y.Z` tag).
- Any known workarounds.
- Your name / handle, if you want credit in the fix advisory (optional).

### What to expect

| When | What happens |
| ---- | ------------ |
| Within 72 hours | A maintainer acknowledges and assigns a triage owner. |
| Within 7 days | An initial severity assessment (Critical / High / Medium / Low) and a plan — fix, patch, or decline-with-rationale. |
| Until fix is shipped | Status updates at least every 14 days, or sooner on critical issues. |
| After fix is shipped | Public credit (if you asked for it) and a release note in the changelog. |

If we can't reproduce the issue or decide not to fix it, we will explain why
in the advisory thread. We will not silently close it.

## Disclosure Policy

We follow **coordinated disclosure**:

- We ask you not to publicly disclose until we ship a fix or 90 days have
  passed, whichever comes first. If 90 days is too short for a complex fix,
  we will negotiate a longer embargo.
- We publish a GitHub Security Advisory (CVE-eligible) and a CHANGELOG entry
  once the fix lands.
- Sensitive user data is never included in the public advisory.

## Out of Scope

We do not consider the following to be security issues in this frontend repo,
and may close such reports without action:

- Self-XSS that requires the user to paste attacker-controlled content into
  the browser dev tools.
- Lack of a security header when the production deployment is not under our
  control (Vercel defaults apply; report header issues to the deployment
  team).
- Theoretical findings without a working proof-of-concept against `main`.
- Rate-limiting / brute-force issues that live on the backend (route your
  report to the backend maintainers instead).
- Issues in third-party packages that we do not maintain; we will still
  triage and may upgrade the dependency if the fix is straightforward.

## Acknowledgements

Thanks to everyone who has reported a vulnerability responsibly. Security
reporters who give us time to fix issues are credited in the release notes
unless they ask to remain anonymous.

---

## Maintenance Notes (for the team, not the public)

- When you swap `conduct@treksphere.dev` for a real alias, search for the
  string `conduct@treksphere.dev` and any `@example.com` markers — these are
  spec placeholders that should not ship.
- When a GHSA is filed, add it under `## Acknowledgements` once resolved
  (anonymized if the reporter chose that).
- Review the open Advisories tab every release prep — close old ones with
  resolution notes so the project signal stays healthy.
