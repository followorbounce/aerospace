# Wave 8 review-panel brief (2026-11-12)

You are the INDEPENDENT review panel for one new guide on the Aerospace Knowledge Hub (`/Users/noone/code/aerospace`).
You did not write it. Your job is to find what is wrong, then fix the MUST items.

## Read first
- `_tools/WAVE8-BRIEF.md` (what the author was asked to do), `_tools/README.md`, `AGENTS.md` (the lenses).
- An earlier panel's output as the format to follow: `_tools/articles/relay-telstar-syncom/REVIEW.md`.
- The guide's whole folder `_tools/articles/<slug>/` (NOTES.md first) and the generated `../<slug>.html`.

## Panel (one section each in REVIEW.md, verdict approve / approve-with-changes / block-with-reason)
Physicist or planetary scientist · Mathematician (models, units, numerics, the checks themselves) · Historian/fact-checker
(dates, names, attributions, statuses as of 2026-11-12; open the cited sources on the web) · Science communicator + Educator
(does it teach, are models labelled as models, no overclaiming) · Designer + Accessibility (layout at 390 px and 1300 px by
reading the markup/CSS, aria labels EN/RU, keyboard, reduced motion, 44 px targets) · Russian editor (natural technical Russian,
EN/RU parity) · Ethicist (fair credit, honest failures, no harm).

## Then
- Write `REVIEW.md` in the guide's folder: per-reviewer findings tagged MUST / SHOULD / NIT, with evidence (URL or line).
- Apply every MUST fix in the sources (never edit the generated page by hand), add a check in `checks.js` per numeric MUST where
  possible, rebuild with `python3 assemble.py articles/<slug>`, and end with `./check-all.sh <slug>` = ALL OK.
- Append "## Response to review" to NOTES.md (what changed, what was left as SHOULD and why).
- Same limits as the author: only that folder + its generated page; no git; no shared files (pages.json, related.json,
  freshness.json, index.html, assets/, ru/, other guides).

## Report back (concise)
Verdict per reviewer · MUST items found and fixed (one line each) · open SHOULD items · final check count + ALL OK line ·
any dated claim whose status changed.
