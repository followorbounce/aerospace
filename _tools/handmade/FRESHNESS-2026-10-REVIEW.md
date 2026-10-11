# Freshness pass 2026-10 — independent cross-disciplinary review

Reviewed 2026-10-11 against `git diff` (HEAD = pre-edit) and FRESHNESS-2026-10.md. Every new reference URL fetched.

## Verdicts

| Lens | Verdict |
|---|---|
| 1. Research / fact-check | approve-with-changes (1 MUST-FIX) |
| 2. Ethics / communication | approve-with-changes (SHOULDs only) |
| 3. Linguist (RU) | approve (SHOULDs only) |
| 4. Regression | approve |

**Overall: approve-with-changes.** One must-fix: a phrase not backed by its cited source.

## MUST-FIX

**M1. palace-tiangong-station.html line 159, Xuntian: "after several delays" is not in ref [4].**
The Xinhua article of 23 June 2026 says only "scheduled for launch in 2027". It does not mention delays. The claim is true historically, but the cited source doesn't support it. Either drop the phrase or add a source that documents the slips.
- EN: `As of October 2026 its launch is scheduled for 2027.<sup class='cite'>[4]</sup>`
- RU: `По состоянию на октябрь 2026 года его запуск намечен на 2027 год.<sup class='cite'>[4]</sup>`
(Change both data-en/data-ru and the visible inner text.)

## SHOULD

**S1. Tiangong line 125: the English sentence is ambiguous.** "Zhu Yangzhu, Zhang Zhiyuan and Li Jiaying, the first astronaut from Hong Kong, launched on 24 May 2026, …" can read as if only Li launched.
- EN: `As of October 2026 the Shenzhou-23 crew is aboard: Zhu Yangzhu, Zhang Zhiyuan and Li Jiaying, the first astronaut from Hong Kong. They launched on 24 May 2026, and one of them is set to stay about a year, a Chinese record.`
- RU already reads correctly ("…; они стартовали…"). To match, you could replace "— первая такая миссия Китая" with "— рекорд для Китая".
- Why: the source's wording is "new in-orbit stay record" and "one-year in-orbit stay experiment". "China's first one-year mission" is a fair inference, but "record" is what the source actually says.

**S2. Tiangong: "As of October 2026" may go stale within the month.** Earlier Shenzhou handovers launched on 30 Oct 2024 (Shenzhou-19) and 31 Oct 2025 (Shenzhou-21). Shenzhou-24 has no announced date (only secondary listings say "October 2026" or "late 2026"), and two of the Shenzhou-23 crew are expected home around November. Use "As of mid-October 2026" / "По состоянию на середину октября 2026 года", or re-check at month end.

**S3. Europa Clipper line 111: "on its way back to Earth" / "возвращается к Земле".** This reads as if the spacecraft is coming home. NASA's page frames the pass as a brief gravity assist on the way to Jupiter.
- EN: `As of October 2026 the spacecraft is in cruise, heading back toward Earth for that gravity assist.`
- RU: `По состоянию на октябрь 2026 года аппарат находится в перелёте и направляется к Земле для этого гравитационного манёвра.`

**S4. Tiangong line 170 RU, small style fix.** "а затем довести до шести модулей и массы до 180 тонн" → "а затем — до шести модулей общей массой до 180 тонн".

**S5. Dragonfly line 102 (optional).** "launching in July 2028" comes from the 2024 confirmation. NASA's 2026 blog says "no earlier than 2028" and "summer". July 2028 is still NASA's stated target, so this is accurate. Optional: "with launch targeted for July 2028".

## Fact-check record (all claims verified unless noted)

- **Juno:** science.nasa.gov/mission/juno shows "Active Mission" and "scheduled to end in September 2025", updated 4 Jul 2026. This matches the new sentence exactly. Other sources: an EGU26 Juno Science Team abstract ("Science from Juno's Continuing Extended Mission"), and AIAA, 24 Mar 2026: "remains in good health, but NASA officials have not said if they will approve another extension." The page's hedge (no claim of current operation, no new end date) is correct and appropriately cautious. Ref [2] note: OK.
- **Crew-13:** NASA mission page says "13th crew rotation", "14th flight with NASA astronauts, including the Demo-2 test flight", launch 11:10 a.m. EDT 1 Oct 2026. NASA ISS blog, 5 Oct: docked to Harmony forward "the same day". The crew includes Sergey Teteryatnikov, which is consistent with "continuing seat-swap agreement" (extension reported July/Aug 2026). Verified.
- **Starliner:** Boeing, 28 Sep 2026: "uncrewed Starliner-1 mission, which will carry cargo to the ISS … December 2026/January 2027 timeframe"; "crewed Starliner-2 mission is planned for 2028". Verified. Leaving out the flight count was the right call: the contract restores the 5th and 6th missions.
- **Shenzhou-23:** Xinhua, 25 May 2026: launch 11:08 p.m. Beijing time on 24 May, Jiuquan. Crew: Zhu Yangzhu (commander), Zhang Zhiyuan, Li Jiaying, "first astronaut from … Hong Kong". "Assigning an astronaut to a one-year in-orbit stay" (so one person, as the page says), "new in-orbit stay record". Verified; see S1/S2. RU transcriptions (Чжу Янчжу, Чжан Чжиюань, Ли Цзяин) are correct Palladius.
- **Expansion / Xuntian:** Xinhua, 23 Jun 2026: cross shape, "20-tonne-class multifunctional module", "six-module configuration … up to 180 tonnes", no dates. Xuntian "scheduled for launch in 2027". Verified, except "several delays" (M1).
- **Europa Clipper:** NASA timeline gives Mars flyby 1 Mar 2025 at 884 km; Earth flyby December 2026 at about 3,200 km; JOI April 2030; first science campaign May 2031; first Europa flyby spring 2031 (so the timeline label "Europa flybys from 2031" is correct); "nearly 50 flybys". Verified.
- **Dragonfly:** NASA, 16 Apr 2024: $3.35B life-cycle cost, launch July 2028, Titan 2034. NASA blog, 10 Mar 2026: I&T at APL into early 2027, system-level testing at Lockheed Martin early 2027, arrival at KSC spring 2028. Verified. No later slip found.

## Ethics / communication

Every new status claim has a date stamp, and every forward-looking item is phrased as planned or scheduled. The open questions (whether Juno is operating, the Shenzhou-23 return date, which astronaut stays a year) are deliberately left unclaimed. That is good practice. There is no overclaiming, apart from M1 (unsourced) and the S1 nuance.

## Linguist

The RU passages are natural and match the EN in all five pages. Number and date formats are correct (3200 км, 3,35 млрд долларов, «декабрь 2026-го или январь 2027 года»). Only stylistic SHOULDs remain (S1, S3, S4).

## Regression

- `./check-all.sh polar-juno-jupiter` → ALL OK (errors [], brokenAttrs 0, missingRu 0, maxCite 9 = refs 9, unstyled []).
- `node test.js` passes on all four hand-made pages with errors [], brokenAttrs 0, missingRu 0 and unstyled []. maxCite equals refs on each: handoff 6/6, tiangong 4/4, clipper 4/4, dragonfly 5/5.
- The fix for the `\"` bug in Tiangong attributes is correct. The one remaining `\"` (line 244) is inside a single-quoted JS string, where it is valid.
- The surrounding text and markup are intact in all diffs.
