# Wave 9 science-proof brief (2026-11-14)

From Wave 9 on, each guide is proofed by THREE separate reviewers instead of one panel, and none of them is the author.
You are ONE of them, for ONE guide on the Aerospace Knowledge Hub (`/Users/noone/code/aerospace`). Your prompt says
which reviewer you are. Your job is to find what is wrong. You do not fix it: the author does, and answers you in NOTES.md.

## Read first
- `_tools/WAVE9-BRIEF.md` (what the author was asked to do; the row for this guide), `AGENTS.md` (the lenses).
- An earlier panel's output for the level of evidence expected: `_tools/articles/quake-insight-mars/REVIEW.md`.
- The guide's whole folder `_tools/articles/<slug>/` (NOTES.md first) and the generated `<slug>.html` at the repo root.

## The three reviewers
**A. Physics and mathematics proof.** Re-derive every instrument INDEPENDENTLY: write your own short calculation
(Python or Node, in your scratch folder, not by calling the page's functions) for each model and compare outputs with
the page at several inputs, including the edges of each slider. Check units, constants, numerics (step size,
convergence, singular cases), that each check in checks.js tests something real against a published value and would
fail if the model were wrong, and that every model is labelled as a model with where it breaks down. Check every
equation box against the code that implements it.

**B. Domain science and sources proof.** You are the specialist for this subject. Open the cited source for every
number, date and status in the text and confirm it says what the page says (not a search snippet: the page itself;
record the URL). Check that references are primary where a primary source exists, that nothing rests on Wikipedia
alone, that superlatives hold, that contested results are presented as contested, that "as of November 2026"
statements are true today (2026-11-14), and that the guide does not contradict the existing guides it links to
(open them). Check the freshness rows cover every dated claim.

**C. History, credit, teaching, Russian and access proof.** Dates, names, attributions and firsts; fair credit
(non-US teams, women scientists, people usually left out); failures told honestly and without sensationalism.
Does a motivated reader come away able to answer the guide's core question; is anything overclaimed or unexplained.
Russian: read ALL the Russian text against `_tools/RU-STYLE.md` (natural technical Russian, EN/RU parity of every
number and claim, glossary terms, typography). Access and layout by reading the markup/CSS: aria labels in EN and RU,
keyboard reachability, reduced motion, targets, no horizontal page scroll at 390 px, chart text 9 px or more.
Meta: description 160 characters or fewer, title_en 60 or fewer, lede chapter count correct, MOD.json entries are real
dated events with EN + RU.

## What to write
One file in the guide's folder, and nothing else in the repo:
`REVIEW-A-physics.md`, `REVIEW-B-domain.md` or `REVIEW-C-history-language.md`.
- Verdict on the first line: APPROVE / APPROVE WITH CHANGES / BLOCK (with the reason).
- Findings tagged MUST / SHOULD / NIT, each with evidence: the quoted text or the file and line, what is right, and the
  source URL or your recomputed number. A MUST is anything false, unsupported, misleading, unlabelled as a model,
  inaccessible, or untranslated. Do not pad: a clean item is not a finding.
- A short list "Checked and found correct" (what you verified, so the next reader knows the coverage).
- "Not checked" (what you could not verify, and why).
You may run read-only commands and `cd _tools && ./check-all.sh <slug>`. Do not edit the guide's sources, the generated
page or any shared file; no git. Scratch files go in the scratch folder named in your prompt.

## Report back (final message, concise)
Verdict · number of MUST / SHOULD / NIT · the MUST items, one line each · what you could not check.

---

## For the author, after the three reviews (the response round)
Read the three REVIEW files. Fix every MUST in the sources (never the generated page by hand); add a check in
checks.js for each numeric MUST where possible; do the SHOULD items that are cheap and right. Where you disagree with a
finding, do not ignore it: answer it with evidence. Rebuild with `python3 assemble.py articles/<slug>` and finish with
`./check-all.sh <slug>` = ALL OK. Append "## Response to review" to NOTES.md: each MUST → what changed; each SHOULD →
done or left, and why. Same limits as before: only your folder and your generated page; no git; no shared files.
