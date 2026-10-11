# Freshness pass — status as of 10 October 2026

Track B freshness team (historian/program analyst, science communicator, linguist, ethicist lens). Small, dated edits
only; every changed statement is in EN and RU and cited. Sources checked 10–11 October 2026.

## polar-juno-jupiter (generated — edited `_tools/articles/polar-juno-jupiter/`, rebuilt)
- Kept "still at work in early 2026 … 81st close pass scheduled for 25 February [9]" (sourced to NASA's 2026 Europa
  ice-shell release).
- Added: "Its last formal extension ran to September 2025; as of October 2026 NASA still lists Juno as an active
  mission but has announced no new end date [2]."
  Source: https://science.nasa.gov/mission/juno/ (labelled "Active Mission", says "through September 2025", page
  updated 4 Jul 2026). Ref [2] title now says "(checked 10 October 2026)" and its note records this.
- **Not verified:** whether Juno is actually still operating. No primary source states operations or a new extension
  after September 2025. Mission Juno (SwRI) posted items through 26 Aug 2026 (incl. "Ten Years at Jupiter!",
  31 Jul 2026), but they are image/anniversary posts that don't state status. A July 2026 secondary blog quotes the
  PI on >85 orbits; not used. The page deliberately does not claim Juno is operating now.

## handoff-commercial-crew-program (hand-made)
- Old: "Crew Dragon now flies ISS rotations routinely … while Boeing works through the steps needed to return
  Starliner to crewed service."
- New: "As of October 2026 … Crew-13, the 13th rotation and NASA's 14th crewed Dragon flight counting Demo-2, docked
  on 1 October 2026 [5]. Starliner has not yet returned to crewed service: an uncrewed cargo flight, Starliner-1, is
  planned for December 2026 or January 2027, and the next crewed flight, Starliner-2, for 2028 [6]."
- New refs: [5] NASA Crew-13 mission page (13th rotation, 14th flight with NASA astronauts incl. Demo-2, launch
  1 Oct 2026); docking the same day confirmed by NASA's ISS blog of 5 Oct 2026
  (https://www.nasa.gov/blogs/spacestation/2026/10/05/expedition-75-welcomes-crew-13-and-preps-for-crew-12-departure/).
  [6] Boeing, 28 Sep 2026, "NASA, Boeing update Starliner contract and set launch window for next mission".
- Not used: the Feb 2026 "Type A mishap" classification of the CFT and the six→four flight reduction (Nov 2025) —
  found only in secondary coverage; Boeing's Sep 2026 piece says the 5th and 6th missions were restored, so the
  flight count is left out.
- Ref [4] (Wikipedia) remains uncited, as before.

## palace-tiangong-station (hand-made)
- Added to the crew chapter: Shenzhou-23 aboard as of Oct 2026 — Zhu Yangzhu, Zhang Zhiyuan, Li Jiaying (first
  astronaut from Hong Kong), launched 24 May 2026; one of them set to stay about a year, China's first one-year
  mission [3]. (CMSA has not said which one; the page doesn't name them.)
- Xuntian: added "As of October 2026 its launch is scheduled for 2027, after several delays [4]."
- Legacy: added the announced expansion — cross shape with a new 20-tonne-class module, later six modules and up to
  180 tonnes; no dates announced [4].
- New refs: [3] Xinhua 25 May 2026 (launch, crew, CMSA one-year stay); [4] Xinhua 23 Jun 2026 (expansion, Xuntian
  2027). Xinhua is state media relaying CMSA; CMSA's English site wasn't reachable for these items.
- **Bug fixed (pre-existing):** four `data-en` attributes contained `\"…\"` (lines 56, 91, 114, 159: hero lede,
  Tianhe, Wentian/Mengtian, Xuntian). Backslash doesn't escape in HTML, so the English text was cut off at the first
  quote on load. Replaced with “…”.
- Not verified: Shenzhou-23's return date / Shenzhou-24 launch (no official date found).

## flyby-europa-clipper (hand-made)
- Added to CH4: Mars flyby 1 March 2025 at 884 km; Earth flyby ~3,200 km planned for December 2026; Jupiter orbit
  insertion April 2030; first Europa science campaign May 2031; "As of October 2026 the spacecraft is in cruise, on
  its way back to Earth" [4].
- Timeline note: "49 dedicated flybys begin ~2030" → "Jupiter orbit April 2030; Europa flybys from 2031" (EN/RU).
- New ref [4]: NASA Science mission timeline (checked 10 Oct 2026).
- Not used: the 3 Dec 2026 exact Earth-flyby date (only on Wikipedia/aggregators; NASA's page says December 2026).

## rotor-dragonfly-titan (hand-made)
- Added: NASA confirmed the mission April 2024, $3.35 billion life-cycle cost, launch July 2028, Titan arrival 2034
  [4]; as of Oct 2026 in integration and testing at APL, system-level tests at Lockheed Martin early 2027, shipment to
  Kennedy spring 2028 [5].
- Kept the existing "around 2028 … mid-2030s" lede wording (still true); the new sentences give the precise dates.
- New refs: [4] NASA, 16 Apr 2024 confirmation; [5] NASA Dragonfly blog, 10 Mar 2026.
- Not used: OIG cost-reserve criticism (seen only in secondary coverage); a 9 Jul 2026 NASA "cleared key tests" post
  (only the headline was visible).

## Tests (after the last edit)
- `./check-all.sh polar-juno-jupiter` → ALL OK.
- `node test.js` on the four hand-made pages: errors [], missingRu 0, maxCite == refs (6/6, 4/4, 4/4, 5/5), unstyled [].
- `node --check` on every inline script of all five pages: OK.

## Outside scope, for the coordinator
- The same `\"` in-attribute bug exists on 11 other pages (count of affected attributes): almaz-program-ussr 3,
  ascent-mercury-program 1, bounce-mars-pathfinder 1, build-your-own-cubesat 2, frontier-new-horizons 2,
  lagrange-points 3, prospect-clementine-mission 2, salute-salyut-program 3, scout-lunar-reconnaissance-orbiter 1,
  the-lunar-gateway 1, valor-the-chandrayaan-mission 2. The English text of each is truncated at load.
