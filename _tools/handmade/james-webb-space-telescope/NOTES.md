# UNFOLD — James Webb Space Telescope (Track B upgrade, 2026-10-10)

**Page:** `james-webb-space-telescope.html`. It is hand-made and upgraded in place, so the HTML is the source of truth. Checks are in `checks.js` here and run via `_tools/check-all.sh james-webb-space-telescope`.

**Purpose and audience:** an interactive field guide to Webb for interested non-specialists. Bilingual EN/RU.

**Owner:** aerospace Track B upgrade team.

## What changed

**References:** 3 references with no in-text citations became 32 numbered, primary-first references. Every one is cited in the text and every URL returned 200. Citations are not strictly in order of first appearance: [30] is first cited in CH4's component panel.

**Two new computed instruments:**
- **CH7, "Why infrared":**
  - Wien's-law glow peak for any temperature from 3 to 10,000 K, drawn as a normalised Planck curve.
  - Presets: Sun, a person, sunshield layer 1, Webb mirror, MIRI.
  - Hydrogen Lyman-alpha and H-alpha lines redshifted by 1 + z, for z from 0 to 20.
  - Presets: z = 0, UHZ1, JADES-GS-z14-0, MoM-z14.
  - The plot is on a log wavelength axis against your eyes, Hubble's WFC3 range and Webb's ranges (NIRSpec marked).
  - Readouts: peak, who sees the peak, the observed Lyα and Hα wavelengths, the age of the universe at that z, and the light-travel time.
- **CH9, "Sharpness and light":**
  - Rayleigh limit 1.22 λ/D for Webb (6.5 m) and Hubble (2.4 m) across 0.2–28.5 µm, drawn to one scale with a scale bar.
  - A diffraction-limited flag for Webb (≥ 1.1 µm).
  - The wavelength at which Hubble would be equally sharp.
  - Collecting area: Webb's measured 25.44 m² against Hubble's 4.52 m² disc, 5.6×.

**Fifth first-light image added:** the Southern Ring Nebula. CH6 said "Five images" but showed four.

**All CH8 discoveries rewritten with sources (see the corrections below).**

**Accessibility:**
- 44 px touch targets for buttons, stage buttons, chips and expandable card heads, plus a 44 px slider hit area.
- `aria-valuetext` on all three sliders.
- Keyboard support for the CH4 schematic hotspots (Enter/Space), the module chips (now `<button>`s with `aria-pressed`) and the expandable cards (`role=button`, `aria-expanded`).
- SVG aria-labels switch with the EN/RU language toggle.
- Small SVG and note text uses #5f5f59 on white (≈6.4:1 contrast).

**Cross-links:** EQUILIBRIUM (lagrange-points) in CH1; PARABOLA chapter 5 (segment phasing) in CH3. Neither topic is duplicated here.

## Facts corrected (old → new, source)

**CH1:**
- "Hubble orbits Earth at 535 km … every 95 minutes" → "a few hundred kilometres up … about every hour and a half". Hubble's altitude has been falling, so no single number is current [1].
- "a stable position" → L2 is a balance point; Webb needs station-keeping burns [1][2].
- Added the halo orbit of about 6 months, the size of the Moon's orbit [1].
- The CH9 HUD altitude "535 KM" → "LEO".

**CH2:**
- Title "A 330°C temperature drop" → "A 318 °C drop". NASA's fact sheet gives a hot side of about 85 °C and a cold side of about −233 °C, a 318 °C difference; no NASA figure says 330 [3].
- Added the sunshield size 21.2 × 14.2 m [3], the layer temperatures 383 K and 36 K [3], and the layer thicknesses 50/25 µm [4].

**CH4:**
- "over six times the collecting area of Hubble" → 25.4 m² measured [2] against the 4.5 m² area of Hubble's 2.4 m disc [30], "more than five and a half times".
- NASA's own figures disagree on this ratio: the old fact sheet says 4.5 m² and "6.25×", which only works with about 4 m². I used the arithmetic I can source.

**CH4, MIRI:** "extra cooling" → 6.4 K, against 35–39 K for the near-IR instruments [2].

**CH5, deployment:**
- The antenna was "within hours of launch" → released on 26 Dec, the day after launch [6].
- The solar array about 30 min after launch [6].
- Sunshield fully deployed on 4 Jan 2022 [7].
- Mirror wings 7–8 Jan [8].
- L2 burn on 24 Jan, 297 s, 1.6 m/s [9].
- Commissioning ended 12 Jul 2022 [2].
- The 344 single-point failures now cited [5]. "Engineers counted 344 mechanisms" was wrong: they are single-point failures, not mechanisms.

**CH6:**
- Added the Southern Ring.
- Stephan's Quintet: four interacting galaxies at 290 Mly; NGC 7320 is in the foreground [12].
- WASP-96 b: "less than half Jupiter's mass, 1,150 ly, NIRISS", plus clouds/haze [14].

**CH8:**
- **Early galaxies:** now dated records, JADES-GS-z14-0 at z 14.32 [22] and MoM-z14 at z 14.44 [21].
- **TRAPPIST-1:** "ruling out thick, hydrogen-rich atmospheres on the innermost ones" → b about 500 K, consistent with no significant atmosphere [23]; c 380 ± 31 K, no thick CO₂ atmosphere [24]. Hydrogen-rich atmospheres were ruled out earlier by Hubble, not Webb.
- **K2-18 b:** CH₄ and CO₂ detected; DMS "less robust" [25]; independent re-analyses found no robust evidence [26].
- **3I/ATLAS:** "detail no telescope had managed for the previous two" (an unsupported comparison) → measured CO₂/H₂O = 7.6 ± 0.3, among the highest ever in a comet [27].
- **"A quasar over 13 billion light-years away … black hole formed before its galaxy":** this had no identifiable source. Replaced with UHZ1, a black hole as massive as its galaxy's stars, supporting heavy seeds [28][29].

**CH9:** Webb's "Infrared only" → 0.6–28.5 µm, red light to mid-IR [3]. Hubble's range is given as WFC3's 0.2–1.7 µm [18].

**CH10:**
- Propellant: "well beyond its planned ten years" → requirement 10.5 years, now more than 20 years [2].
- Roman: "2027" → launched 30 Aug 2026 [31].
- HWO: "2030s" → proposed next flagship with no launch date [32].
- Dropped the empty "What Comes Next" placeholder.

## Sources for the new numbers

- **Wien constant b** 2897.771955 µm·K: NIST [15].
- **Sun's effective temperature** 5772 K: NASA NSSDC [16].
- **Hydrogen lines:** R∞ from NIST [17]; the proton–electron mass ratio 1836.152673426 is from NIST (`Value?mpsme`), with no separate reference entry. Lyα comes out at 121.568 nm against the standard vacuum 121.567 nm, and Hα at 656.47 nm against 656.46.
- **Planck 2018** TT,TE,EE+lowE+lensing: H₀ 67.36, Ωm 0.3153 [20]. The radiation density Ωr·h² = 4.18 × 10⁻⁵ is the standard photon + 3.046 massless neutrinos value, not from [20]'s table. The model gives 13.795 Gyr today against the published 13.797.
- **MoM-z14:** z 14.44, 280 Myr [21]; the model gives 282.
- **JADES-GS-z14-0:** z 14.32 [22], about 290 Myr; the model gives 286.
- **UHZ1:** about 3% of the present age [28]; the model gives 3.4%.
- **Ranges:** WFC3 0.2–1.7 µm [18], NIRSpec 0.6–5.3 µm [19], Webb 0.6–28.5 µm [3], diffraction-limited from 1.1 µm [2].
- **Apertures and areas:** 6.5 m [3], 2.4 m [30], 25.44 m² [2].

## Assumptions and limitations

- **Rayleigh limit:** the formula assumes a circular unobscured aperture. Webb's hexagonal segmented pupil gives a slightly different PSF, and the page says so. Measured NIRCam F200W FWHM is about 0.076″, against a Rayleigh value of 0.077″ at 2 µm. This was not used as a check, because FWHM and Rayleigh are different measures.
- **Hubble's area:** the bare 2.4 m disc, with no secondary-mirror obscuration subtracted. That is stated in the figure note.
- **Glow presets:** the Planck curve is drawn normalised to its own peak (shape only, no absolute brightness). The "your eyes ≈ 0.38–0.75 µm" band is an approximate convention and isn't cited.
- **Cosmology:** flat ΛCDM with massless neutrinos; ages are good to about 1%.
- **Lede:** "Ten chapters" is unchanged. This hand-made page counts 10 content chapters including LEGACY, with REFERENCES as CH.11.

## Unverified items

- The 290 Myr figure for JADES-GS-z14-0 comes from NASA/secondary coverage of [22]. The Crossref abstract I could read was truncated before that sentence.
- Hubble's present altitude: no current NASA figure was found, so the page avoids a number.
- The ESA release [8] was read for "fully deployed 8 January 2022". The port-wing date of 7 January comes from search-result quotes of the same release.
- Not screenshotted (no Firefox, per the rules) and not tested on a real device.

## Response to review (REVIEW.md, 2026-10-10)

The panel's verdict was BLOCK, on six MUST-FIX items. All six are done. `check-all.sh james-webb-space-telescope` ends ALL OK with 42 checks (up from 32) and 37 references, all cited. The inline scripts pass `node --check`.

**MUST-FIX**
1. **Missing CSS:**
   - Added the base `.btn`, `.readout-grid`, `.readout-cell`, `.readout-cell .rl` (#5f5f59) and `.readout-cell.wide` rules.
   - Added full `input[type=range]` styling: `appearance:none`, a 2 px ink track on a 44 px hit area, WebKit and Moz thumbs, Moz track, and a focus ring. These rules are copied from the generated guides.
   - A new check asserts all these rules exist. jsdom cannot see the visual result, so the coordinator's screenshot is still the real test.
2. **Contrast:** `.ctl-head` and `.inst-kicker` now use #5f5f59, with a check.
3. **Far-UV status:** added a branch for when Lyα is still bluer than WFC3 (0 < z < 0.645), in EN and RU. Checks: at z 0.3 the status says "far ultraviolet" and never mentions MIRI; at z 0.7 it says "Hubble can still see it".
4. **JADES-GS-z14-0:** the text now says "confirmed at 14.32 [22], refined in 2025 by ALMA's oxygen detection to 14.18, about 290 million years after the Big Bang [34]". The preset is set to 14.18. The check uses 14.18 and gets 290 Myr against 290. [34] is Carniani et al. 2025, A&A (arXiv 2409.20533, abstract read: z = 14.1796 ± 0.0007).
5. **Ref [6]:**
   - Dropped "60-cm" and "Ka-band": neither is in the source.
   - The bus card and stage 02 now say "high-data-rate dish … at least 28.6 GB of science data twice a day", which is in [6].
   - The solar array at about 30 minutes now cites NASA's "Solar Array Deployed" blog [33].
   - The [6] note is corrected.
6. **CH2 contradiction:** now "runs at roughly 40 K: … 35–55 K", in EN and RU.

**SHOULD/NICE items applied:**
- **Wavefront error:** 60–80 nm, in the text and the [2] note.
- **Area:** compared like-for-like. The page now says "about 5.6 times the full disc, and somewhat more once Hubble's own obstruction is subtracted". The readout reads "full disc", and the note says Webb's 25.44 m² already excludes obstructions. I did not quote a ~6.3× figure: I found no source for Hubble's obscured area (the review's 11 % has no source either).
- **TRAPPIST-1:**
  - Retitled "rocky worlds, atmospheres still undecided".
  - Added that a thick, hazy CO₂ atmosphere also fits [35] (Ducrot et al. 2025, *Nature Astronomy* 9, 358; abstract read).
- **K2-18 b:**
  - Retitled "A claimed biosignature that has not held up so far".
  - DMS now comes "almost entirely from life, though it has also been found in a comet" [37] (Hänni et al. 2024, ApJ 976, 74; abstract read).
  - Added the 2025 MIRI claim at about 3σ [36] (Madhusudhan et al. 2025, ApJL 983, L40).
  - The [26] re-analysis is now cited as published: Stevenson et al. 2025, AJ 170, doi 10.3847/1538-3881/ae0338. "Re-analyses" is now singular, to match the single re-analysis cited.
- **Ref [21]:** updated to the published Naidu et al., *Open Journal of Astrophysics* (2026), doi 10.33232/001c.156033.
- **Ref [7]:** the 28 December pallet date is dropped ("over the following days").
- **Headings:**
  - CH8 heading: "The early universe grew up faster than expected".
  - UHZ1 card: "A black hole as heavy as its galaxy's stars".
- **Notes:**
  - IR note: "The glow curve is drawn scaled to its own peak: it shows shape, not brightness."
  - Resolution note: explains the pale disc (Rayleigh limit) and the dark core (FWHM ≈ 0.42).
- **Resolution readouts:** "WEBB DIFFRACTION-LIMITED?" shows "—" below 0.6 µm. "HUBBLE AS SHARP AT" flags "(below WFC3)" or "(beyond WFC3)". Both have checks.
- **CH6 and CH9 text:**
  - The SMACS 0723 card gets back "released 12 July 2022" and "thousands of galaxies".
  - The CH9 lede now says Hubble's view is "ultraviolet, visible and near-infrared".
- **Russian:**
  - «планет размером с Землю»; «плохо согласуются»; «— примерно через 280 миллионов лет»; «Чёрная дыра массой со все звёзды своей галактики».
  - Stage 05 «направило»; CH1 title «в полутора миллионах километров»; «голой каменной поверхностью».
  - «СОЛНЦЕ — ЗЕМЛЯ»; «Предустановки …».
  - RU numbers: 4-digit numbers are unseparated and 5+ digits use U+00A0, with a check that 5772 К shows as "5772 К".
- **Accessibility:**
  - The deploy caption has `aria-live="polite"` and the stage buttons get `aria-pressed`, with a check.
  - Expandable cards are now `<h4><button aria-expanded>`, so the headings survive, with a check.
  - SVG text is 12.5/13.5 px at ≤ 480 px width.
  - The eyebrow reads "CH.10 / 10".
- **CH7 chart layout** (coordinator's screenshot):
  - The band names (eyes, Hubble WFC3, Webb, NIRSpec) moved into a left gutter, so no line or label can cross them.
  - The Lyα and Hα labels sit above their lines.
  - The lines stop above the glow area.
  - The glow-peak label ("peak …") sits inside the glow area, clear of the line labels.

**Declined or deferred:**
- **`#langtoggle` buttons:** `aria-pressed` and 44 px height. This is shared chrome on every page and is better fixed site-wide.
- **Review 1.5's "≈ 6 times":** not stated, for lack of a source for Hubble's obscured area.

**Bug found while fixing:** my first replacement of the discoveries array stopped at the "[22];" inside the old text and left a fragment behind, which caused a syntax error. It was caught by `check-all.sh` and `node --check`, removed, and verified clean.

**Still unverified:** the 390 px and desktop rendering, which the coordinator re-screenshots.
