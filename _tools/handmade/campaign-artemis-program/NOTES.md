# Artemis pages — Track B upgrade notes (2026-10-11)

Covers three hand-made pages, upgraded in place (the HTML stays the source of truth):

- `campaign-artemis-program.html` (CAMPAIGN) — full upgrade: facts, dated status, 22 sources, 2 instruments, tests.
- `horizon-artemis-base-camp.html` (HORIZON) — freshness pass: facts, dated status, 11 sources.
- `the-lunar-gateway.html` (HALO) — freshness pass: facts, dated status, 9 sources.

**Purpose:** a referenced, dated account of where Artemis stands. **Audience:** interested non-specialists (EN/RU).
**Status date for every time-sensitive statement: 10 October 2026.** **Owner:** aerospace field-guide maintainer.

## Format decision (CAMPAIGN)

CAMPAIGN was listed as a format outlier: superscript `[n]` citations and no LEGACY chapter. Its references already used
the standard `renderRefs` / `ref-item` pattern, so they stay. The superscript citation style stays too; it is consistent
within the page, and the test harness reads `[n]` either way. **No LEGACY chapter**: Artemis is an ongoing program and a
"legacy" would be premature. Instead there is a closing **CH.12 "What comes next"** (NASA's stated cadence as of
10 Oct 2026), and REFERENCES moves to CH.13. Re-check when Artemis IV lands; a LEGACY chapter may make sense then.

## Instruments (CAMPAIGN), exposed as `window.__artemis`

1. **How fast the Accords grew (CH.02).** A step chart of the counts NASA itself published, on the date each was reached:
   8 (13 Oct 2020), 26 (21 Jun 2023), 50 (11 Dec 2024), 59 (26 Oct 2025), 67 (13 May 2026), 70 (17 Jul 2026),
   73 (21 Sep 2026), 76 (25 Sep 2026). Pick two points to get the number added, the years between, the average per year
   and the days per new signatory. Nothing is projected forward. Whole history: 68 nations in 2,173 days, about 11.43 a
   year (one every 32 days). From Oct 2025 to Sep 2026: 17 in 334 days, about 18.59 a year.
2. **How far, and how long a reply takes (CH.06).** A distance slider with markers for the Moon's mean distance
   (384,400 km), Apollo 13 (248,655 mi = 400,171 km) and Artemis II (252,756 mi = 406,771 km). Readouts give km, miles,
   one-way and round-trip light time, the distance beyond the Moon's mean, and the difference from Apollo 13's record.
   Artemis II's maximum is 1.357 s one way.

`checks.js` holds 34 checks (22 at first, 12 added after review): unit conversions against NASA's mile figures, light times, Accords dates and rates (also
recomputed independently in Python), presets in both languages with no NaN, the Russian number format, Russian aria
labels, aria-valuetext, and Orion chips staying keyboard-focusable after re-render.

## Facts corrected (old → new, source)

### CAMPAIGN

- **Artemis II splashdown:** 11 April 2026 → **10 April 2026, 5:07 p.m. PDT** off San Diego [13].
- **Artemis II details added:** launch 6:35 p.m. EDT on 1 April from Pad 39B [13]; record passed at 12:56 p.m. CDT on
  6 April [14]; closest approach 4,067 mi above the Moon [14]; 695,081 mi flown [13].
- **Artemis II distance:** "~406,770 km" → 406,771 km (252,756 mi × 1.609344) [14][19].
- **Artemis II heat shield:** NASA's December 2024 decision to fly the existing shield with a changed entry trajectory [15],
  and the initial findings: char loss far smaller than on Artemis I [16]. (An earlier draft said "shortened entry range";
  no NASA source found says that, so it was removed; see the response to review below.)
- **Accords:** "70 signatories, July 2026" → **76 as of 25 Sep 2026** (San Marino) [9]. The founding card read 7; it
  is now **8 including the US**, per NASA [3]. The unsourced "one new country every few weeks" is replaced by the
  instrument.
- **Artemis III target:** "late 2027" → **2027**. NASA's 3 Mar 2026 article said mid-2027 [10]; the 9 Jun 2026
  crew release says 2027 [22].
- **Artemis III mission:** crew, docking order and durations added (Blue Moon about 2 days, Starship about 1 day,
  about 2 weeks in space; spacer replaces the upper stage) [21][22].
- **Artemis IV:** "no earlier than 2028" → **targeted for early 2028** [10]; first crewed south-pole mission [22].
- **Gateway:** "paused in March 2026" is now dated to the **24 March 2026** announcement and quoted as NASA's intent
  [20]. The HALO stop-work order and its $1.9B contract come from the OIG [11]; the HALO hardware reuse from NASA's
  4 Aug 2026 update [23].
- **SLS:** standardization from Artemis IV, with no Exploration Upper Stage or Mobile Launcher 2 [10]. The OIG puts
  the four cancelled or repurposed systems at $5.9B [11].
- **Sources:** two independent tracker sites (issinfo.net, spaceinformer.com) are removed; every claim they supported
  now cites NASA or the OIG.

### HORIZON

- **Artemis II:** "humans' farthest trip from Earth since Apollo" → **the farthest humans have ever travelled**,
  406,771 km [2][3].
- **Artemis III / IV / V:** dated as above. "One crewed landing per year after Artemis IV" → Artemis V in late 2028.
  NASA's February plan said about one mission a year after that [4]; its March plan says landings initially every six
  months beyond Artemis V [6].
- **Gateway pause:** "redirecting funding and hardware" (unsourced) → NASA's stated intent [6] plus the OIG's HALO facts
  [7] and the HALO hardware reuse [8].
- **Moon Base components and phases:** brought in line with NASA's 24 Mar 2026 phases [6]:
  - Phase 1 is robotic (CLPS, LTV) and runs through 2029 [8].
  - Phase 2 adds JAXA's pressurized rover.
  - Phase 3 adds ASI's Multipurpose Habitats and a CSA Lunar Utility Vehicle.
  - "Foundation Habitat" → surface habitats (ASI, phase 3).
  - "Mobile Home Module" → pressurized rover (JAXA, phase 2).
- **Lunar Reactor-1:** "targeted 2030" → NASA–DOE aim to **develop** a lunar surface reactor by 2030 [10]; LR-1's
  role per NASA's Space Reactors Division [9].
- **Lunar night:** "two weeks of darkness even near the pole's brightest ridges" (overstated) → a 29.53-day synodic
  cycle over most of the Moon [11]; even the best-lit polar ridges spend part of the year in shadow.
- **Claims removed for lack of a primary source:**
  - "Blue Moon … suffered a rocket failure in 2026": secondary reports only.
  - "$20 billion, decade-long program": no source found. The Inspector General's $5.9B figure is used instead [7].

### Gateway (HALO page)

- **NRHO:** "no spacecraft had ever occupied" → "no **crewed** station had ever occupied" (NASA's CAPSTONE cubesat flew
  an NRHO in 2022). The NRHO numbers are confirmed by NASA's FAQ [1].
- **Crew stays:** "four astronauts for roughly thirty days" / "~30-day stays" / "month-long stays" → crews of up to four
  on intermittent visits [1]. NASA's FAQ gives no stay length.
- **Module status:** "Only the first two elements were ever completed" (false) → work concentrated on PPE and HALO,
  and neither flew [1][4].
- **"Two nearly-finished modules":** false. The OIG projected HALO delivery no earlier than July 2031 [5]. The heading
  is now "Two modules, two different fates".
- **PPE:**
  - Powered on in 2025 [2]; built by Lanteris (formerly Maxar) [2].
  - $375M at award, May 2019 [8].
  - Fate: core of the SR-1 nuclear-electric Mars spacecraft, per NASA's Moon Base program manager on NASA's podcast,
    11 Sep 2026 [7].
- **HALO:**
  - Structure built by Thales Alenia Space in Turin and flown to Arizona on 1 Apr 2025 [3].
  - Status "BUILT, INTEGRATION PHASE" (false) → **stop-work order, April 2026**.
  - Contract "~$935M cost-plus" (wrong) → $1.3B combined at the 2021 firm-fixed-price conversion, $1.9B by April 2026
    [5].
- **"Redirecting roughly $20 billion":** no source found; removed.
- **"Over $5 billion in prime contracts for PPE and HALO alone":** unsupported; replaced with the OIG's HALO figures [5].
- **ESA modules:** "disposition decision due mid-2026" (unsourced) → NASA's FAQ module names (Lunar I-Hab, Lunar View,
  Lunar Link) [1] and NASA's stated plan to leverage partner commitments [4].
- **Legacy timeline:**
  - Contracts 2020 → **2019** (PPE in May, HALO in July) [5][8].
  - "2025–26 hardware completed" → 2025: PPE powered on, HALO structure in Arizona.

## Assumptions and limitations

- **Accords counts:** NASA's published counts on the dates reached. The 67 is dated to the Lima workshop's opening on
  13 May 2026, because NASA's 21 May release says only that the six signings came "leading up to" it. The 59 is dated
  26 Oct 2025, the day Malaysia and the Philippines were announced.
- **Light time:** the straight-line distance at c. It ignores ground-station and relay delays; the note on the page
  says so.
- **CAMPAIGN's SLS paragraph:** describes NASA's stated plan for a new second stage; NASA was still "assessing
  alternative options" [10].
- **Cadence after Artemis V:** NASA's February statement (about one a year) and its March statement (every six months)
  differ; the pages give both.

## Unverified or left as-is

- **Older uncited claims in HORIZON/HALO (outside the freshness scope), kept as before:**
  - JAXA's I-Hab contribution.
  - PPE carrying the main communications and attitude control.
  - The NRHO "constant line of sight" claim.
  - The south-pole ice framing in HORIZON CH1 (now citing NASA's Artemis overview [1]).
  - China's crewed-landing plans in the HORIZON risk card (uncited; deliberately left generic).
- **HLS test flights:** the status of Starship's ship-to-ship propellant transfer and Blue Moon MK1's flight could not
  be confirmed from primary sources. The pages say only that neither lander has carried people (as of 10 Oct 2026) and
  that Artemis III tests both in Earth orbit.
- **The Smithsonian source [2] on CAMPAIGN:** its claims (logo, partner framing, Accords principles, Artemis I) were
  carried over and not re-read.
- **Not done:** no screenshots (done centrally) and no real-device test.

## Re-check triggers

- **After 25 Sep 2026:** new Accords signings (update CH.02 and the instrument's data).
- **When NASA announces it:** a firm Artemis III launch date.
- **On publication:** Artemis II heat-shield lab results (Marshall).
- **When decided:** ESA's plans for I-Hab, Lunar View and Lunar Link; PPE/SR-1; any HALO reuse.

## Response to review (REVIEW.md, 11 October 2026)

Verdict was APPROVE-WITH-CHANGES. All 6 MUST-FIX items are applied, plus most SHOULD items.

**MUST-FIX**

- **M1, distance slider snapping.** `#distKm` now has `step="1"`, so 406,771 and 400,171 survive the browser's
  value sanitisation. checks.js computes the snap itself (jsdom doesn't snap) and asserts, for every preset, that the
  value is a step multiple, that it equals the quoted figure, and that the readout shows the quoted km and miles.
  - The new checks also caught a real display bug: the Apollo 13 preset read "−0 km" against its own record
    (400,171 vs 400,171.4).
  - Fix: `fmtInt` rounds before choosing the sign, and the delta sign uses the rounded value.
- **R1, entry-trajectory citation.** The "shortened distance between entry and splashdown" wording isn't in any NASA
  source I could find, including the 5 Dec 2024 release the panel pointed to. That release says the heat shield can
  keep the crew safe "with changes to Orion's trajectory as it enters Earth's atmosphere".
  - CH.06 now says exactly that and cites the release as new reference [15]; the old [15] is now [16], cited only for
    the char-loss finding.
  - "Shortened entry range" is removed from its note in EN and RU, and from this file.
  - All later citations are renumbered (23 references, 23 citations).
- **R2, HORIZON lander cards.** The unsourced rows are gone: "Rocket explosion, May 2026", "Slipped at least 8 months
  per NASA OIG" and "V3 TEST FLIGHT Targeted 2026", along with the `DELAYED`/dead styling. Both cards now read "IN
  DEVELOPMENT · NOT YET CREWED (10 OCT 2026)" and carry the panel's sourced rows ([4][5]). Rows are bilingual
  (`vEn`/`vRu`).
- **E1.** The CH.06 heading now reads "Farther from Earth than any human before" / «Дальше от Земли, чем кто-либо из
  людей до них».
- **E2.** The HALO chip now reads "Structure built; stop-work order Apr 2026" / «Конструкция изготовлена; работы
  остановлены в апр. 2026». The description now says "was to be integrated with PPE before launch".
- **L1.** HALO's hardware and partner cards now have `vEn`/`vRu` for every row, using the panel's Russian, and both
  renderers pick by language.

**SHOULD, applied**

- **R3:** the $5.9B figure is now described as "systems NASA has announced plans to cancel or repurpose … combined
  current contract value", on both CAMPAIGN and HORIZON.
- **R4:** the HORIZON legacy item is now "Lunar surface reactor · NASA–DOE development goal".
- **R5:** the PPE heading is "A 60-kilowatt solar-electric powerhouse", and the body quotes the FAQ's "ever flown"
  with "although it has not yet flown".
- **R6:** headings are "Five planned modules from four providers" and "Five partners, one small station"; the chip is
  "Lunar View / Lunar Link (formerly ESPRIT)".
- **R7:** the CAMPAIGN CH.10 hedge reading is removed from the cited sentence (NASA: lander readiness decides who
  flies first), and the HORIZON lander lede is now "a hedge against either one slipping".
- **R8:** the NRHO claim is now "uninterrupted link to Earth and good coverage of the south pole" [1].
- **P2:** no per-year rate for spans under 180 days. The readout shows "—" and the status says "Too short a span to
  annualise".
- **P3:** the distance note says NASA does not state whether its distances are measured from Earth's centre or
  surface, and the Moon delta is labelled approximate.
- **E3:** PPE is "REUSE PLANNED", not "TO BE REUSED".
- **E4:** HORIZON CH.03 now reads "Pause announced 24 Mar 2026; shift to a surface base".
- **E5:** the night-stepper stages are polar-ridge wording.
- **E6:** the CH.09 heading is "Now the first landing since Apollo 17".
- **L2:** "agreement", not "treaty", in EN and RU.
- **L3:** «скругляет» becomes «переводит «Орион» на круговую орбиту».
- **L4:** Russian instrument numbers use U+00A0.
- **L5:** "Lunar Reactor-1 (LR-1)" is used in Russian too.
- **L6:** Russian wording fixes:
  - «сут»/«лет» units, and «73-й».
  - «подписало».
  - «и ретрансляторов» added.
- **A1:** the readout grids are no longer live regions. The status lines update only on `change` (end of drag) and on
  preset clicks.
- **A2:** `.sim-svg text` is 14px below 520px wide. The distance-marker labels are end-anchored, so they can't run off
  the right edge.
- **A3:** the Accords presets start with `aria-pressed`.

**Declined or deferred**

- **A4** (dashed runs between published counts): already disclosed in the figure note; left as is.
- **L6, `<title>` «КАМПАНИЯ» vs footer "CAMPAIGN —"**: the title follows the site's "CODENAME / РУССКОЕ" pattern;
  left as is.
- **Pre-existing English-only `v` rows elsewhere:** fixed on HORIZON's lander cards and HALO's partner cards; no others
  remain on these three pages.

**Tests after the changes**

- `check-all.sh campaign-artemis-program`: ALL OK (34 PASS, brokenAttrs 0, offStep [], unstyled []).
- `test.js` on HORIZON (11/11 refs) and HALO (9/9): no errors, 0 missing RU.
- `node --check` passes on all three pages.
