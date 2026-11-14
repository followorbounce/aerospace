# RU-STYLE — house style for the Russian edition (lead editor, 2026-11-12)

**Merged 2026-11-12 (consistency editor):** the coordinator's decisions (`RU-DECISIONS.md`, items 1–10) and the batch
editors' non-conflicting glossary proposals are folded into this file; it is again the single reference. Where an
older line here disagreed with a decision, the line was rewritten to the decision.

Applies to every Russian string on the Aerospace Knowledge Hub: `data-ru`, `data-aria-ru`, the Russian argument of `T()`,
`ru:` fields in scripts and references, `meta.json` RU fields, `assets/mission-of-day.js`.
The rules were decided by **majority usage already on the site** (sampled 2026-11-12: ~9 900 Russian strings, about
1 M characters, all 36 generated and 56 hand-made pages, plus the mission widget); where the majority is wrong Russian,
the rule says so. Apply it literally. If something is missing, follow the site majority (grep the sources) and propose
a line in your report.

Reference edits that follow this file end to end: `transfer-earth-to-mars.html`, `viking.html` (hand-made) and
`_tools/articles/relay-telstar-syncom/` (generated).

---

## 1. Register and voice

- **Narrative text is neutral and impersonal**, like a good popular-science book (Наука и жизнь, «Новости космонавтики»):
  «Аппарат выходит на орбиту», «Расстояние меняется в семь раз». No exclamation marks unless the English has one.
- **The reader is «вы», lowercase**, and only where the English addresses the reader («вы живёте», «на вас давит»).
  Never «Вы», never «ты». Don't add «вы» where the English is impersonal; don't remove it where the English says "you".
- **Instructions and hints = polite imperative (2nd person plural):** «Двигайте ползунок», «Выберите компонент»,
  «Нажмите на дату», «Задайте угол и нажмите „Старт“». Site majority: Выберите 60, Попробуйте 16, Двигайте 11, Нажмите 10.
  Never infinitive instructions («Двигать ползунок») and never «щёлкните/кликните» — use «нажмите» (touch screens too).
- "Scroll to begin" = «Пролистайте вниз, чтобы начать». But **"scrub through / drag through"** a timeline or slider is
  NOT «пролистайте»: use «Двигайте ползунок по хронологии», «Пройдите по хронологии», «Потяните, чтобы прокрутить время».
- "We" of the authors («мы») only where the English says "we"; otherwise impersonal.
- Keep the English rhythm of short punchy lines, but make them Russian sentences: an English noun-phrase headline often
  needs a verb or a different structure in Russian (see section 12).

## 2. UI microcopy

| Element | Rule | Examples |
|---|---|---|
| Action buttons | Short noun or infinitive, **never imperative**; keep the English case (UPPERCASE stays uppercase) and any icon | «▶ ПУСК», «❚❚ ПАУЗА», «СТАРТ», «↺ ЗАНОВО», «СБРОС», «СЕГОДНЯ», «ОТПРАВИТЬ „ПРИВЕТ, МАРС“», «УСТАНОВИТЬ 44,3°» |
| Preset / tab buttons | Noun phrase as in English | «РЕКОРД 2003», «БЛИЖАЙШЕЕ СБЛИЖЕНИЕ», «Аэроторможение / прямой вход» |
| Slider and readout labels | Nominative noun phrase, no verb; units in parentheses or after the value | «ВЫСОТА ОРБИТЫ ОЖИДАНИЯ», «ПУТЬ ТУДА (СУТКИ)», «ДОЛЯ ТОПЛИВА НА СТАРТЕ» |
| Status lines | Full sentences; bold lead word as in English | «<b>Промах.</b> Марс в 12 млн км…» |
| Hints | Imperative «вы»-form, one sentence | «Потяните, чтобы прокрутить время миссии» |
| aria-label / alt / figcaption | Describe what is shown, nominative, sentence case, no trailing period | «Вид сверху на орбиты Земли и Марса вокруг Солнца» |
| Navigation | Fixed strings (use exactly) | «← ОГЛАВЛЕНИЕ» (also "HUB" → «ОГЛАВЛЕНИЕ»), «НАЧАТЬ — ГЛАВА 01», «Читать справочник →», «ИСТОЧНИКИ», «НАСЛЕДИЕ», "Skip to content" → «Перейти к содержанию» (every page's skip link carries `data-en`/`data-ru`; assemble.py writes it for generated guides) |
| Shared fixed phrases | Use exactly | "PRESENT" (in date ranges) → «НАШИ ДНИ»: «1975 → НАШИ ДНИ», «2014 — НАШИ ДНИ»; footer "EDUCATIONAL / ILLUSTRATIVE — FIGURES APPROXIMATE UNLESS CITED" → «УЧЕБНЫЙ МАТЕРИАЛ / ИЛЛЮСТРАЦИИ — ЗНАЧЕНИЯ ПРИБЛИЗИТЕЛЬНЫЕ, ЕСЛИ НЕ УКАЗАН ИСТОЧНИК»; "EDUCATIONAL / REFERENCED — FIGURES CITED WHERE POSSIBLE" → «УЧЕБНЫЙ МАТЕРИАЛ СО ССЫЛКАМИ — ЗНАЧЕНИЯ ПО ВОЗМОЖНОСТИ ПОДТВЕРЖДЕНЫ ИСТОЧНИКАМИ» |

- **Units keep their normal lowercase form even inside UPPERCASE labels:** «Δv С НОО (км/с)», «600 мЗв», never «КМ/С», «МЗВ».
- Mirror English case: UPPERCASE eyebrows/labels → UPPERCASE Russian; Title Case English headings → Russian **sentence case**
  (only the first word and proper names capitalised): "Three Experiments, No Clear Answer" → «Три эксперимента — и ни одного ясного ответа».
- Colons at the end of labels only where the English has them.
- The fig-number code **«CH.01 / 08» stays as is** (Latin, no `data-ru`; it is a layout code on all 92 pages and the audit
  ignores it). «FIG. 00» → «РИС. 00» (already the site-wide rule). In running text, chapter references are
  **«глава 4» / «(глава 4)» / «из главы 4»**; the short form «гл. 4» (with a no-break space) only in tight labels and
  readouts. Never «гл.4» without a space, never «ГЛ.» in eyebrows.
- "Field guide" (the site's own guides) = **«справочник»** (151 uses; «путеводитель» 0 in guides): «в справочнике ИМПУЛЬС»,
  «Читать справочник →». The hub = «Аэрокосмический справочник». "Instrument" (an interactive figure) = **«прибор»**
  (majority) — «восемь глав и пять приборов».
- **Codenames of guides (decision 1).** A guide's codename in Russian = the Russian codename in that guide's own Russian
  title: meta.json `title_ru` (part before « — ») for generated guides; the first `<span>` of the h1 (`data-ru`) for
  hand-made ones. Use it in the guide's own hero, footer and in **every** link or mention of it from other guides,
  **undeclined, in caps**: «в справочнике <a>ПОЯС</a>», «см. справочник <a>ЕЗЕРО</a>», «(<a>ВХОД</a>)» — never
  «в <a>ПАРАБОЛЕ</a>» (write «в справочнике <a>ПАРАБОЛА</a>»), never the Latin codename, never a quoted guide title
  («„Реликтовое излучение“») where the English link uses the codename. Only if the target's Russian title has no Russian
  codename keep the Latin one. Where the English link text is descriptive ("the Almaz guide", "Galileo"), the Russian
  may stay descriptive («справочник об „Алмазе“»). Current table (2026-11-12): ПОЯС, КАПСУЛА, ВСПЫШКА, КОМЕТА, КОРОНА, ТЬМА,
  ОБЛОМКИ, ВХОД, УБЕГАНИЕ, ОПОРА, ПРОГНОЗ, СВЕЧЕНИЕ, УДАР, СВЯЗЬ, МАСКОН, НАВИГАТОР, СОПЛО, ПАССАЖИР, ПОЛЯРНАЯ, ТОЛЧОК,
  КРОЛИК, РЕТРАНСЛЯТОР, ВОЗВРАТ (RETURN), РЯБЬ, ПАРУС, ОБРАЗЕЦ, ЗНОЙ, ПРАЩА, СПЕКТР, СКАФАНДР, СОЛНЦЕ-СИНХРОННАЯ, РОЙ,
  ТЯГА, НАКЛОН, КАСАНИЕ, ПОКРОВ (generated); АЛМАЗ, АПЕРТУРА, ВОСХОЖДЕНИЕ, БИП, ЗА ПРЕДЕЛЫ, ОТСКОК, СБОРКА, КАМПАНИЯ,
  КАСКАД, ПОРОГ, ФИНАЛ, ПЕРВЫЕ, ПРОЛЁТ, РУБЕЖ, ПЕЧЬ, ПЕРЕДАЧА, ГОРИЗОНТ, ИНФРАКРАСНЫЙ, ОРБИТА, РАЗВЁРТЫВАНИЕ, ЕЗЕРО,
  РАВНОВЕСИЕ, СПУСК, МАРАФОН, РЕЗОНАНС, ОРБИТАЛЬНАЯ СТУПЕНЬ, ДВОРЕЦ, ПАРАБОЛА, ПАРАЛЛАКС, ИМПУЛЬС, ПОИСК, СБЛИЖЕНИЕ,
  ДОСТАВКА (RETRIEVE; changed 2026-11-12 from «ВОЗВРАТ», which stays RETURN's), РОТОР, САЛЮТ, РАЗВЕДЧИК, НЕБЕСНЫЙ КРАН, ГАЛО, СПОКОЙСТВИЕ,
  ПЕРЕЛЁТ, ТРАНЗИТ, ТРОЯ, ЗОНТ, СОЮЗ, ОТВАГА, КОРАБЛЬ, ПРИБЫТИЕ, ОТЛЁТ, МАСТЕРСКАЯ, РЕНТГЕН (hand-made).
  Not codenames (keep Latin): the HALO module, the CORONA satellites, the Katalyst LINK craft, Solar Orbiter, Lunar Orbiter.
- The brand line «RELAY — TECHNICAL FIELD GUIDE / ТЕХНИЧЕСКИЙ СПРАВОЧНИК» is bilingual by design; leave it.

## 3. Typography

| Item | Rule |
|---|---|
| Quotes | «ёлочки»; nested „лапки“ inside them: «программа „Аполлон“ завершилась». In attributes write the characters themselves; **never a raw `"` inside `data-ru="…"`**. Straight `'` only in markup (`href='…'`). |
| Em dash — | Spaced em dash for punctuation: «Марс — за 687 суток». Prefer a no-break space before it (`&nbsp;—` in HTML, ` —` in JS) when you are rewriting the sentence anyway; don't sweep files for it. |
| Pairs of names | Spaced em dash in text: «система Солнце — Земля», «Земля — Марс», «закон Стефана — Больцмана», «перелёт Земля — Марс» (site majority 9:5). In tight UPPERCASE labels/axes an unspaced en dash is fine: «ЗЕМЛЯ–МАРС», «УГОЛ МАРС–СОЛНЦЕ». |
| Ranges | Unspaced en dash: «1967–1973», «7–8 км/с», «19–30 июля 2020 года». With words: «от 3 до 22 минут». |
| Minus | U+2212 «−» (what `fmt()` writes): «−59 °C», «−3 × 10⁻¹⁵». Never a hyphen. |
| Multiplication, dimensions | «×» with spaces: «5 × 10⁵⁰ эрг», «954 × 5637 км», «2 × SNAP-19»→«2 генератора SNAP-19». |
| Approximately | In text «около», «примерно»; in formulas and readouts «≈»; «~» only in tight labels («~259 сут»). |
| No-break space (U+00A0) | **Required** between a number and its unit or %, between «а.» and «е.» etc. in abbreviations, after initials, between «гл.»/«рис.»/«№»/«§» and the number, and as the thousands separator. In HTML write `&nbsp;`; in JS strings write ` ` (HTML entities don't decode in `textContent`). For long body text a careful regex pass on *visible text only* is acceptable; never touch code, URLs or attribute names. |
| Ellipsis | «…» (one character). |
| Bold/italics | Keep the English markup on the same words (`<b>`, `<i>` for titles of journals/books: «в журнале <i>Wireless World</i>»). |
| Superscripts | Keep `<sup>`, `<sub>`, Unicode ⁻¹ ² ³ exactly; keep `[n]` citations where they are in the English sentence. |

## 4. Numbers

- **Decimal comma**: «1,262 а. е.», «0,64 мЗв». `fmt()` already outputs a comma in RU mode; hard-coded numbers in
  `data-ru` and RU strings must do the same. (Site majority 2132:26; the 26 dots are mostly errors.)
- **Thousands**: group numbers of **five or more digits** with a no-break space: «35 786 км», «19 500 км/ч», «60 000 лет».
  **Four-digit numbers are not split** in text: «6460 км», «2000 Вт», «3080 м/с», «1281 сол» (Russian norm and site
  majority). Exception: in a column or a sentence that also has ≥5-digit numbers, group them all alike.
  Script readouts come from `fmtInt()` (helpers.js), which groups every number ≥1000 with U+00A0 (so «1 524»); leave
  script-formatted output as it is — see "Open questions for the coordinator".
- Years are never grouped: «2026». Version-like ids keep their dots: «РИС. 3.1», «WFC3», «GOES-19».
- Ordinal numerals: «на 68,7-й секунде», «16-метровый», «26-месячных» (hyphen + ending, no space). «в 1960-е годы», «в 1960-х».
- Large numbers: «млн», «млрд», «тыс.» with a no-break space after the number: «150 млн км», «2 млрд звёзд».
  Write the word out («миллион», «миллиард») when there is no number before it or it starts a sentence. «млн» and «млрд»
  never take a period; «тыс.» always does.
- Percent: «5 %» with a no-break space (site majority), also in readouts: «95 % CO₂».
- Exponents: «1,327 × 10¹¹ км³/с²». Numbers in formulas keep the formula's own notation.
- Spelled-out small numbers follow the English: "seven" → «семь», "7" → «7».

## 5. Units and abbreviations

Russian SI symbols, no periods: с, мин, ч, сут, км, м, см, мм, мкм, нм, кг, г, т, км/с, м/с, км/ч, м/с², Н, кН, МН,
Вт, кВт, МВт, Дж, МДж, ГДж, К, °C, Па, кПа, бар, мбар, Гц, кГц, МГц, ГГц, дБ, дБм, бит/с, кбит/с, Мбит/с, мЗв, Гр, пк,
кпк, Мпк, эрг. Specifics:

| Item | Use | Avoid |
|---|---|---|
| Astronomical unit | **«а. е.»** with a no-break space inside: «1,52 а. е.» | «а.е.» (46 uses to fix), «AU» |
| Days | «сут» in readouts/labels and after numbers in technical text: «259 сут»; «дней» in narrative about calendar time: «через одиннадцать дней» | «д», «дн.» |
| Months / years in labels | «мес», «лет»/«года» | «mo», «yr» |
| Sol | «сол», plural «солы», gen. pl. «солов»: «1281 сол», «90 солов» | «марсианских дней» unless the English says so |
| Light-year | «св. год», «световых лет» | «с. г.» |
| Celsius | «464 °C» (Latin C, no-break space before °) | Cyrillic «С», «464°C» |
| Kelvin | «2,725 К» (Cyrillic К) | «K» |
| Degrees of angle | «44°», «28,5°», no space | |
| Coordinates | «30° в. д.», «90° з. д.», «81° с. ш.», «ю. ш.» | «E/W/N/S» |
| g-load | «14,6 g» (Latin g; site majority), «перегрузка 6 g» | «14,6 же» |
| Mach | «М = 2», «число Маха 2», «примерно до двух скоростей звука» | «2 Маха» |
| Specific impulse (decision 2) | «удельный импульс 380 с» / «I<sub>уд</sub> ≈ 380 с» in text, readouts and formulas; in plain-text (textContent) labels «I_уд» | «Isp», «I<sub>sp</sub>», «I_sp», «Isp 380 сек» |
| Pounds force | «фунтов силы» | |
| psi | «фунтов на кв. дюйм» in text; «psi» only in tight labels | |
| bar | «бар», undeclined after numbers: «0,9 бар», «1,9 бар» | |
| dex | «декада» | |
| Milliarcsecond | «мс дуги» | |
| Δv | «Δv» (Greek, as on the site), spoken «дельта-v» only if the English spells it out | «delta-v», «дельта-ви» |
| Pixels | «пикс.» | «px» |
| Imperial units | Keep the English figure and give the metric one if the English gives it: «34,5 дюйма», «171 фунт», «8500 футов» | |

## 6. Dates and time

- Decimal years take «года»: «в 2025,5 года».
- Full date: **«12 ноября 2026 года»** (site majority, 1023 uses). Month + year: «в июле 1962 года». Year alone: «в 1962 году».
  Never «12.11.2026», never «2026 г.» in running text.
- Compact labels (axes, chips, cards): «22 окт. 2026», «ОКТ. 2026». Abbreviations: янв., февр., марта, апр., мая, июня,
  июля, авг., сент., окт., нояб., дек. (`toLocaleDateString('ru-RU', {month:'short'})` output is acceptable as is.)
- Decades/centuries: «1960-е годы», «в XX веке».
- Time zone: **UTC** (Latin) — «16:56 UTC», «(UTC)», «по UTC»; GMT only when the source says GMT.
- Seasons/months capitalised only at sentence start: «в июле».
- "As of mid-2026" = «по состоянию на середину 2026 года»; "today" in a dated claim = «сегодня (ноябрь 2026 года)».

## 7. Spacecraft, missions, programmes, vehicles

**Rule A — Cyrillic in «ёлочки»** for Soviet/Russian, Chinese, Japanese, Indian names and for Western spacecraft that
have an established Russian form; numbers are joined with a hyphen: «Аполлон-11», «Вояджер-1», «Пионер-10»,
«Луна-9», «Венера-7», «Чанъэ-4», «Сатурн-5». These decline: «полёт „Аполлона-11“», «у „Вояджера-1“».
**Rule B — Latin, no quotes, not declined** for acronyms and for names the site already writes in Latin; add a generic
noun when the case would otherwise be unclear: «марсоход Curiosity», «аппарат MESSENGER», «зонд Dawn», «миссия DART».
**Do not invent a third form.** If a name is not in this table, grep the site; if absent, apply Rule A when Russian
Wikipedia and Roscosmos/«Новости космонавтики» use a Russian form, otherwise Rule B.

| Rule A (Cyrillic, «») | Rule B (Latin) |
|---|---|
| «Спутник-1», «Восток-1», «Восход-2», «Союз», «Мир», «Салют-1», «Луна-16», «Луноход-1», «Марс-3», «Венера-7», «Зонд-5», «Молния-1», «Космос-2251», «Энергия», «Буран», «Н-1» (ракета), «Ариан-5» (masculine, declined: «на „Ариане-5“»), «Чанчжэн-5» (Long March, always «Чанчжэн-N»), «Пионер-Венера-1» (Pioneer Venus Orbiter), «Мэнтянь», «Вэньтянь» | NASA mission acronyms: GRAIL, MAVEN, MESSENGER, OSIRIS-REx, DART, InSight, LRO, MRO, COBE, WMAP, IKAROS, SLIM, TIROS, GOES, ATS-1, STS-1 |
| «Эксплорер-1», «Меркурий», «Джемини-4», «Аполлон-11», «Скайлэб» (masculine, declined: «на „Скайлэбе“», «Скайлэба-4»), «Спейс шаттл» (generic «шаттл», lowercase), «Колумбия», «Сатурн-5» | Curiosity, Perseverance, Spirit, Opportunity, Ingenuity, Dawn, Juno*, Parker Solar Probe (short: Parker), Euclid, Roman, Stardust, Landsat, Mars Express, BepiColombo, Solar Orbiter, Lunar Prospector, Lunar Reconnaissance Orbiter |
| «Вояджер-1», «Пионер-10», «Маринер-4», «Викинг-1», «Рейнджер-7», «Сервейер-1», «Лунар орбитер-1», «Галилео», «Магеллан», «Кассини», «Гюйгенс», «Улисс», «Новые горизонты», «Патфайндер» («Марс Патфайндер»), «Соджорнер», «Клементина», «Европа Клиппер» | Commercial and current Western vehicles: SpaceX, Falcon 9, Falcon Heavy, Starship, Super Heavy, Crew Dragon, Dragon, Starlink, OneWeb, Iridium, Blue Ghost, Blue Origin, New Glenn, Electron; **rockets in Latin (decision 5): Atlas V, Delta II, Ariane 6** — with a generic noun when the case is unclear: «на ракете Atlas V»; ESA's Jupiter probe **JUICE** (Latin caps) |
| «Хаббл» (космический телескоп «Хаббл»), «Джеймс Уэбб» / «Уэбб», «Спитцер», «Чандра», «Кеплер», «Планк», «Гайя», «Розетта», «Филы» (the lander; the island on the Nile is Филе), «Телстар-1», «Синком-3», «Эхо-1», «Эрли Бёрд», «Метеосат-1», «Дискаверер-13», «Корона» (KH-…), «Вела-4А» | Artemis (programme: «программа Artemis», missions «Artemis I», «Artemis II»; site majority; missions are **feminine** — «Artemis II стартовала», agreeing with «миссия»), Orion → **«Орион»** (Rule A) |
| «Хаябуса», «Хаябуса-2», «Чанъэ-5», «Юйту-2», «Цюэцяо», «Тяньвэнь-1», «Чжужун», «Тяньгун», «Тяньхэ», «Мэнтянь», «Вэньтянь», «Шэньчжоу-5», «Чандраян-3», «Викрам», «Надежда» (UAE Hope), «Берешит», «Одиссей» (IM-1) | Instruments: SEIS, RAD, FIRAS, DMR, ASPERA-3, ABI, WFC3, MMRTG, SNAP-19, Avcoat, PICA |

\* Juno: «Юнона» (11) vs Juno (1) — use **«Юнона»** (Rule A).
- Generic nouns: "spacecraft" = «аппарат» (default) / «космический аппарат» on first mention; "probe" = «зонд» or
  «аппарат»; "the mission" (as a craft) = «аппарат»; "Mars rover" = **«марсоход»**, "lunar rover" = «луноход»
  (Soviet) / «луноход» or «ровер» for Chinese/US; plain «ровер» only for rovers of unspecified body — the site's 37 «ровер»
  for Mars rovers should become «марсоход».
- Agencies are neuter: «NASA сообщило», «ЕКА завершило».

## 8. Agencies and organisations

| Use | Avoid |
|---|---|
| **NASA** (Latin, 256 uses), JPL, NASA JPL (decision 3) | НАСА, «Наса» |
| **ЕКА** in Russian text (decision 3); a source's own title stays as published («ESA/Hubble») | ESA |
| Роскосмос, ОКБ-1, ЦУП, ИКИ РАН | |
| JAXA, ISRO, CNSA (Latin), CNES, DLR, UKSA | Cyrillic transliterations |
| Canadian Space Agency: first mention «Канадское космическое агентство (CSA)», then **CSA** (also in tight labels: «CSA / Канада») | **«ККА»** (never) |
| DOE → «Минэнерго США» | |
| SpaceX, Blue Origin, Boeing, Lockheed Martin, Bell Laboratories («Bell Labs»), AT&T, Intuitive Machines, Firefly | Russian transliterations of companies |
| FCC, ITU → «МСЭ» (Международный союз электросвязи), IAU → «МАС», UN → «ООН», UNSCEAR → «НКДАР ООН» in text (title of the source stays English in references) | |
| Universities and labs: keep the Russian conventional name when it exists («Калифорнийский технологический институт (Caltech)», «Массачусетский технологический институт»), else Latin | |

## 9. Person names

- Russian practical transcription (Ермолович; Russian Wikipedia as tie-breaker). Established historical forms win:
  Hohmann **Гоман** (never Хохманн), Oberth Герман Оберт, Goddard Роберт Годдард, von Braun Вернер фон Браун,
  Potočnik Герман Поточник, Clarke Артур Кларк, Kepler Иоганн Кеплер, Huygens Христиан Гюйгенс, Lagrange Жозеф Луи Лагранж,
  Doppler Кристиан Доплер, Kirchhoff Густав Кирхгоф, Fraunhofer Йозеф Фраунгофер, Bunsen Роберт Бунзен,
  Penzias Арно Пензиас, R. W. Wilson Роберт Вильсон, Hubble Эдвин Хаббл, Webb Джеймс Уэбб, Van Allen Джеймс Ван Аллен,
  Sagan Карл Саган, Kessler Дональд Кесслер, Ride Салли Райд, Aldrin Базз Олдрин, Armstrong Нил Армстронг,
  Collins Майкл Коллинз, Shepard Алан Шепард, Glenn Джон Гленн, White Эд Уайт, Kennedy Джон Кеннеди,
  Tsiolkovsky Константин Циолковский, Korolev Сергей Королёв, Gagarin Юрий Гагарин, Tereshkova Валентина Терешкова,
  Leonov Алексей Леонов, Yang Liwei Ян Ливэй, Chandrasekhar Субраманьян Чандрасекар.
- **First mention: first name + surname** («Вальтер Гоман»), with the role if the English gives one («немецкий инженер
  Вальтер Гоман»); later mentions: surname only. Initials when the English uses them, with no-break spaces: «Салли К.&nbsp;Райд».
  No patronymics unless the English gives the middle name/role.
- Authors in reference notes: «Цайтлин и др. (2013)» in Russian prose; the reference title line itself stays English.
- Animals: Лайка, Белка и Стрелка, Хэм (as on the site).

## 10. Latin that stays Latin

Mission and instrument acronyms (section 7), GPS (but ГЛОНАСС), UTC, GMT, IERS, CelesTrak, Space-Track, SPARC,
NGC 3198, catalogue ids (S1222a, GRB 170817A, 67P, 2003 EL61), chemical formulas (CO₂, N₂), Δv, vis-viva («формула vis-viva»),
programming/hardware names (Arduino, Raspberry Pi, ESP32, Linux, Wi-Fi), journal titles in `<i>`.
Translated abbreviations: ISS → **МКС**, LEO → **НОО** (spell out on first use: «низкая околоземная орбита (НОО)»),
GEO → **ГСО**, RTG → **РИТЭГ**, CCD → **ПЗС**, EVA → «выход в открытый космос», EDL → «вход, спуск и посадка»,
GCMS → **ГХ-МС**, CMB → «реликтовое излучение», SNR → «отношение сигнал/шум», AU → «а. е.».

## 11. Model and assumption notes

English "Model:", "Assumptions:", "Honest limits:", "Illustrative", "Schematic, not to scale" are formulaic; translate them
by formula, not word by word:

| English | Russian |
|---|---|
| Model: circular, co-planar orbits | Модель: круговые орбиты в одной плоскости |
| Assumes / We assume | Принято, что… / Допущение: … |
| Ignores X | X не учитывается |
| Illustrative / schematic, not to scale | Иллюстрация / схема, не в масштабе |
| Honest limits | Ограничения модели (keep «честные», if the English stresses it: «Честно об ограничениях») |
| Values are approximate | Значения приблизительные |
| computed in your browser | вычисляется в вашем браузере |
| checked against X | сверено с X |
| your assumption, not a measurement | ваше допущение, а не измерение |
| EDUCATIONAL — FIGURES APPROXIMATE UNLESS CITED | УЧЕБНЫЙ МАТЕРИАЛ — ЗНАЧЕНИЯ ПРИБЛИЗИТЕЛЬНЫЕ, ЕСЛИ НЕ УКАЗАН ИСТОЧНИК |
| EDUCATIONAL / ILLUSTRATIVE — FIGURES APPROXIMATE UNLESS CITED (footer) | УЧЕБНЫЙ МАТЕРИАЛ / ИЛЛЮСТРАЦИИ — ЗНАЧЕНИЯ ПРИБЛИЗИТЕЛЬНЫЕ, ЕСЛИ НЕ УКАЗАН ИСТОЧНИК |
| Footer first line "CODENAME — A FIELD GUIDE TO X" | «РУССКИЙ КОДНЕЙМ — ПОЛЕВОЙ СПРАВОЧНИК ПО X» (Russian codename, see section 2) |
| a source titled "…Guide" | «руководство» (not «справочник», which is our own guides) |
| Sources cited throughout this guide | Источники, на которые ссылается этот справочник |
| Bracketed numbers in the text above correspond to the sources below. | Номера в квадратных скобках в тексте выше соответствуют источникам ниже. |

Keep every qualifier (approximate, about, at least, roughly, illustrative): never drop or strengthen one.

## 12. Ё

**Ё is written everywhere** (site majority is overwhelming: «ещё» 195 / «еще» 0, «её» 244 / «ее» 0, «полёт» 256).
Add it where it is missing: «звёзды», «полёт», «манёвр», «Королёв», «всё», «пришёл», «перелёт», «тяжёлый», «счётчик»,
«разрежённый» (adj.; «разреженный» also correct — prefer «разреженный» for gas density, both forms exist; don't sweep).
Proper names keep their established form («Чанъэ», «Плёмёр-Боду», «Эрли Бёрд»).

## 13. Common machine-translation errors found on this site

Real examples from the 2026-11-12 sampling (wrong → right). Hunt for these patterns.

| Found | Why it is wrong | Write |
|---|---|---|
| ШЕСТЬ ДЕСЯТИЛЕТИЙ МАРСОХОДОВ (for "Six decades of Mars landers", viking) | lander ≠ rover | ШЕСТЬ ДЕСЯТИЛЕТИЙ ПОСАДОК НА МАРС |
| «Кэширует образцы для возврата» (viking, "caching samples") | IT calque | «Собирает образцы для доставки на Землю» / «закладывает образцы в хранилище» |
| «Реактивная, окисляющая химия грунта» ("reactive soil chemistry") | «реактивный» = jet/reactive in the sense of jet propulsion | «Химически активный грунт-окислитель» |
| «снижая скорость примерно до 2 Маха» | colloquial calque | «примерно до М = 2» |
| «сопротивление атмосферы о теплозащитный экран» | impossible preposition | «сопротивление атмосферы, действующее на теплозащитный экран» |
| «Аэродинамический экран входит в атмосферу… теплозащитным экраном вперёд» ("aeroshell") | two «экрана» | «Аэродинамическая капсула входит… лобовым теплозащитным экраном вперёд» |
| «Пролистайте хронологию программы» ("Scrub through the program") | scrolling ≠ dragging a slider | «Двигайте ползунок по хронологии программы» |
| «орбитер», «орбитеров» | jargon calque | «орбитальный аппарат» |
| «ровер» for a Mars rover | jargon | «марсоход» |
| «Два конкурирующих проекта намеренно, а не один» ("Two competing designs, on purpose") | English word order | «Два конкурирующих проекта — и это намеренно» |
| «КОНСТРУКЦИЯ, СОВЕРШЕНСТВОВАВШАЯСЯ ШЕСТЬДЕСЯТ ЛЕТ, А НЕ ЗАМЕНЁННАЯ» | participle chain copied from English | «ШЕСТЬДЕСЯТ ЛЕТ ДОРАБОТОК ВМЕСТО ЗАМЕНЫ» |
| «Переместить бит может стоить дороже энергии, чем вычислить с ним» | calque of "can cost more energy than computing with it" | «Переместить бит бывает энергетически дороже, чем выполнить с ним вычисление» |
| «Толчок, который никогда не прекращается, накапливается» | literal | «Слабый, но непрерывный толчок накапливается» |
| «Всё ещё задавая вопрос „Викинга“» (headline) | dangling gerund | «Вопрос „Викинга“ всё ещё открыт» |
| «Меченое высвобождение», «Пиролитическое высвобождение» | non-standard names of the Viking LR/PR experiments | «Выделение меченых соединений», «Пиролитическое выделение» |
| «Девяносто дней — шесть лет» ("Ninety days, six years") | reads as a range | «Рассчитан на девяносто дней — проработал шесть лет» |
| «СВЕТ, В ОДНУ СТОРОНУ» ("LIGHT TIME, ONE WAY") | not a quantity name | «ВРЕМЯ СВЕТА В ОДНУ СТОРОНУ» |
| «11.30 KM/S», «0 AU», «PRE-LAUNCH» in a Russian HUD | English left in script / data attributes | «11,30 км/с», «0 а. е.», «ПЕРЕД СТАРТОМ» (hand-made pages: `data-phase-ru` etc., see viking.html) |
| «ВЫХОД НА ОРБИТУ 400 км ДВИГАТЕЛЕМ», «СВЕТ ТУДА И ОБРАТНО» | word order / not a quantity | «ТОРМОЖЕНИЕ ДВИГАТЕЛЕМ НА ОРБИТУ 400 км», «ВРЕМЯ СИГНАЛА ВВЕРХ И ВНИЗ» |
| «Брошенный спутник» (a dead/uncontrolled satellite) | colloquial | «неуправляемый спутник» |
| «апогей» for a heliocentric orbit | apogee is Earth-centred | «афелий» (and note the English error in your report) |
| «Блоки РИТЭГ» | redundant «блоки» | «РИТЭГи» |
| «1 а.е. = 149,6 млн км», «В А.Е.» | unspaced abbreviation | «1 а. е. = 149,6 млн км», «В А. Е.» |
| «(гл.1)», «(гл.11)» | missing space | «(глава 1)» |
| decimal dot in RU text («3.73 m/s²» in a table) | not localised | «3,73 м/с²» |
| НАСА / ESA in some pages | against the majority rule | NASA / ЕКА |
| «первый солнечный аппарат у Юпитера» ("first solar-powered") | ambiguous: «солнечный аппарат» = solar probe | «первый аппарат на солнечных батареях у Юпитера» |
| «Его 21 зернистый снимок показал…» | "grainy" calque | «21 нечёткий снимок» |
| «на высоте 8500 футов» without metric | fine only if English has no metric; keep the English figure, don't add a conversion the English lacks | — |
| «Первый спутник Меркурия» (artificial satellite) | correct, but ambiguous next to natural moons; | «первый искусственный спутник Меркурия» on first use |

Other recurrent calques: «является» (use a dash or a verb), «в течение» for "for" with a duration that fits «за» or no
preposition, «был запущен» where «стартовал» reads better, «одним из самых», "this is what" → «вот почему», possessive
pronoun overuse («своей орбиты» where none is needed), «и т. д.» lists copied from English commas.

---

## 14. Glossary (EN → RU)

Use the Russian in column 2; column 3 lists forms to replace. Terms are lower case unless proper.

### Orbital mechanics

| English | Russian | Avoid |
|---|---|---|
| orbit (n.) | орбита | |
| to orbit (a body) | обращаться вокруг; (enter orbit) выйти на орбиту | «орбитировать» |
| orbital period | период обращения; (of one orbit) виток длится… | «орбитальный период» in text |
| revolution / one orbit | виток; оборот (about an axis or around a body in astronomy) | |
| low Earth orbit (LEO) | низкая околоземная орбита (НОО) | «низкая земная орбита» |
| geostationary orbit (GEO) | геостационарная орбита (ГСО) | |
| geosynchronous | геосинхронный | |
| parking orbit | опорная орбита; (as on transfer page) орбита ожидания | «парковочная орбита» |
| transfer orbit | переходная орбита; орбита перелёта | «трансферная» |
| Hohmann transfer | гомановский перелёт; гомановская траектория | «перелёт Хохманна» |
| bi-elliptic transfer | биэллиптический перелёт | |
| trans-Mars injection | выход на траекторию полёта к Марсу | |
| trans-lunar injection | выход на траекторию полёта к Луне | |
| orbit insertion / capture | выход на орбиту; (by engine) торможение для выхода на орбиту | «захват орбиты» |
| burn (n.) | включение двигателя; импульс; манёвр | «прожиг», «сжигание» |
| departure burn | разгонный импульс; импульс схода с орбиты (to escape) | «стартовый импульс» (only for Earth launch) |
| delta-v | Δv; приращение скорости | «дельта-ви» |
| escape velocity | вторая космическая скорость; скорость убегания (general body) | «скорость побега» |
| orbital velocity / circular speed | первая космическая скорость (Earth); круговая скорость | |
| excess speed / v-infinity | гиперболический избыток скорости; избыточная скорость; v∞ | |
| specific orbital energy | удельная орбитальная энергия | |
| vis-viva equation | интеграл энергии; формула vis-viva | |
| powered flight | полёт с двигателем | |
| Moon periapsis | периселений | |
| semi-major axis | большая полуось | |
| eccentricity | эксцентриситет | |
| inclination | наклонение (of an orbit) | «наклон орбиты» in technical text |
| right ascension of the ascending node | долгота восходящего узла | |
| ascending / descending node | восходящий / нисходящий узел | |
| argument of periapsis | аргумент перицентра | |
| periapsis / apoapsis | перицентр / апоцентр | «периапсис» |
| perigee / apogee | перигей / апогей | |
| perihelion / aphelion | перигелий / афелий | |
| perijove | перийовий | |
| ground track | трасса (подспутниковая трасса) | «наземный трек» |
| footprint (coverage) | зона обзора; зона покрытия | «след» |
| revisit time | период повторного обзора | |
| sun-synchronous orbit | солнечно-синхронная орбита | |
| Molniya orbit | орбита типа «Молния» | |
| frozen orbit | «замороженная» орбита | |
| halo orbit | гало-орбита | |
| Lagrange point | точка Лагранжа (L1…L5) | |
| sphere of influence | сфера действия | «сфера влияния» |
| gravity assist / flyby | гравитационный манёвр; пролёт | «гравитационная праща», «пертурбационный манёвр» (old) |
| slingshot | гравитационный манёвр | «рогатка» |
| patched conics | метод сопряжённых конических сечений | |
| hyperbolic trajectory | гиперболическая траектория | |
| free-return trajectory | траектория свободного возврата | |
| launch window | стартовое окно; окно запуска | |
| porkchop plot | диаграмма «свиная отбивная» (porkchop plot) | |
| phase angle | фазовый угол | |
| synodic period | синодический период | |
| sidereal day | звёздные сутки | |
| solar day | солнечные сутки | |
| rendezvous | сближение | «рандеву» |
| docking | стыковка | |
| station-keeping | удержание на орбите | «станционное удержание» |
| deorbit (burn) | сход с орбиты; тормозной импульс для схода с орбиты | «деорбитинг» |
| orbital decay | снижение орбиты (из-за торможения в атмосфере) | «распад орбиты» |
| atmospheric drag | сопротивление атмосферы; аэродинамическое торможение | |
| aerobraking | аэроторможение | |
| aerocapture | аэрозахват | |
| two-body problem | задача двух тел | |
| Kepler's equation / laws | уравнение Кеплера / законы Кеплера | |
| mean / true anomaly | средняя / истинная аномалия | |
| gravitational parameter (μ, GM) | гравитационный параметр | |
| gravity well | гравитационный колодец | |
| Oberth effect | эффект Оберта | |
| mascon | маскон | |
| oblateness (J2) | сжатие (J2) | «сплюснутость» |
| precession | прецессия | |
| tidal locking | приливный захват | |

### Propulsion and launch

| English | Russian | Avoid |
|---|---|---|
| rocket | ракета | |
| launch vehicle | ракета-носитель; носитель | «пусковое средство» |
| launch (n.) | запуск; (of a rocket, technical) пуск; (moment) старт | |
| liftoff | старт; отрыв от стартового стола | «взлёт» |
| stage | ступень | |
| first stage booster (reusable) | первая ступень | «бустер» |
| side booster / strap-on | боковой ускоритель; боковой блок | «бустер» |
| upper stage | верхняя ступень; разгонный блок (kick stage) | |
| payload | полезная нагрузка | «пейлоад» |
| fairing | головной обтекатель | |
| engine | двигатель | «мотор» |
| thrust | тяга | «толчок» (except figurative) |
| thrust-to-weight ratio | тяговооружённость | |
| specific impulse (Isp) | удельный импульс; symbol I<sub>уд</sub> | «Isp», «I<sub>sp</sub>» |
| launch escape tower | система аварийного спасения (САС) | |
| drone ship | беспилотная баржа | |
| exhaust velocity | скорость истечения | «скорость выхлопа» in technical text |
| propellant | топливо (both components); компоненты топлива | «пропеллент» |
| fuel | горючее (when contrasted with oxidiser); топливо otherwise | |
| oxidiser | окислитель | |
| cryogenic | криогенный | |
| liquid hydrogen / oxygen | жидкий водород / кислород | |
| methalox | метан-кислородный | |
| hypergolic | самовоспламеняющиеся компоненты | «гиперголики» |
| solid rocket motor | твердотопливный двигатель (РДТТ) | |
| combustion chamber | камера сгорания | |
| nozzle | сопло | |
| nozzle throat / exit | критическое сечение / срез сопла | «горло» |
| expansion ratio | степень расширения | |
| over-/under-expanded | перерасширенное / недорасширенное (сопло) | |
| thrust coefficient | коэффициент тяги | |
| gas generator cycle | схема с газогенератором (открытая схема) | |
| staged combustion | схема с дожиганием генераторного газа (закрытая схема) | |
| turbopump | турбонасосный агрегат (ТНА) | |
| throttle (v.) | дросселировать; регулировать тягу | |
| throttleable | с регулируемой тягой | |
| gimbal | качание двигателя; карданный подвес | |
| retrorocket | тормозной двигатель | «ретроракета» |
| attitude thrusters | двигатели ориентации | |
| RCS | реактивная система управления | |
| ion engine / thruster | ионный двигатель | |
| Hall thruster | холловский двигатель (СПД) | |
| electric propulsion | электрореактивная двигательная установка | |
| nuclear thermal propulsion | ядерный ракетный двигатель (ЯРД) | |
| solar sail | солнечный парус | |
| rocket equation | уравнение Циолковского | «ракетное уравнение» |
| mass ratio | отношение масс | |
| dry mass | сухая масса | |
| propellant fraction | доля топлива | |
| Max Q | максимальный скоростной напор | |
| launch pad | стартовый стол; стартовая площадка | «лаунчпад» |
| launch site / cosmodrome | космодром; стартовый комплекс | |
| landing (of a booster) | посадка | |
| reusable | многоразовый | «переиспользуемый» |
| recovery | возвращение; спасение (of a stage) | |

### Spacecraft engineering and operations

| English | Russian | Avoid |
|---|---|---|
| spacecraft | космический аппарат; аппарат | «космический корабль» (only crewed) |
| crewed spacecraft | пилотируемый корабль | |
| crewed / uncrewed | пилотируемый / беспилотный; автоматический (robotic) | «с экипажем» in labels is fine |
| probe | зонд; автоматическая станция (Soviet) | |
| orbiter | орбитальный аппарат | «орбитер» |
| lander | посадочный модуль (site default); посадочный аппарат (acceptable, keep where used) | «лэндер» |
| rover (Mars) | марсоход | «ровер» |
| rover (Moon) | луноход | |
| impactor | ударный зонд | «импактор» |
| flyby (n.) | пролёт | |
| capsule | капсула; спускаемый аппарат (crewed) | |
| descent module | спускаемый аппарат | |
| sample return | доставка образцов (на Землю) | «возврат образцов» in headings is acceptable |
| entry, descent and landing (EDL) | вход в атмосферу, спуск и посадка | |
| entry interface | граница входа в атмосферу | |
| heat shield | теплозащитный экран | «тепловой щит» |
| aeroshell | аэродинамическая капсула (оболочка) | «аэродинамический экран» |
| ablator / ablative | абляционный материал / абляционный | |
| backshell | задний кожух капсулы | |
| parachute | парашют | |
| skycrane | «небесный кран» | |
| airbags | надувные амортизаторы; посадочные подушки | |
| landing legs | посадочные опоры | |
| solar array / panel | солнечная батарея | «солнечная панель» acceptable (keep) |
| solar cells | солнечные элементы | |
| battery | аккумулятор (rechargeable); батарея | |
| RTG | радиоизотопный термоэлектрический генератор (РИТЭГ) | |
| radiator | радиатор | |
| thermal control | система терморегулирования | |
| attitude control | ориентация; система ориентации | «контроль положения» |
| reaction wheel | маховик (двигатель-маховик) | «реакционное колесо» |
| star tracker | звёздный датчик | «звёздный трекер» |
| gyroscope | гироскоп | |
| high-gain antenna | остронаправленная антенна | «высокоусиленная» |
| low-gain antenna | слабонаправленная антенна | |
| uplink / downlink | восходящий / нисходящий канал; линия «Земля — борт» / «борт — Земля» | |
| feed horn | облучатель | |
| telemetry | телеметрия | |
| command (n.) | команда | |
| ground station | наземная станция | |
| Deep Space Network | Сеть дальней космической связи (DSN) | |
| transponder | транспондер; приёмоответчик | |
| link budget | энергетический баланс радиолинии | «бюджет линии» |
| bit rate | скорость передачи данных | |
| signal-to-noise ratio | отношение сигнал/шум | |
| light time / signal delay | время распространения сигнала; задержка сигнала | |
| solar conjunction | соединение с Солнцем | |
| safe mode | безопасный режим | |
| instrument (science) | научный прибор | «инструмент» |
| instrument (interactive figure) | прибор | |
| detector | детектор | |
| spectrometer | спектрометр | |
| imager / camera | камера; формирователь изображений | «имиджер» |
| radar | радиолокатор; радар (in headings) | |
| magnetometer | магнитометр | |
| seismometer | сейсмометр | |
| mission (programme) | миссия; полёт; экспедиция (crewed) | |
| design lifetime | расчётный срок службы | |
| primary mission | основная программа (миссии) | |
| extended mission | продлённая миссия | |
| end of mission / decommissioning | завершение миссии / вывод из эксплуатации | |
| space debris | космический мусор | |
| collision avoidance | уклонение от столкновения | |
| constellation (of satellites) | группировка | «созвездие» |
| megaconstellation | мегагруппировка | |
| space station | орбитальная станция; космическая станция | |
| module | модуль; базовый блок (core module) | |
| spacewalk / EVA | выход в открытый космос | |
| airlock | шлюзовая камера; шлюз | |
| prebreathe | десатурация | |
| spacesuit | скафандр | «космический костюм» |
| life support | система жизнеобеспечения | |
| crew | экипаж | |
| astronaut / cosmonaut / taikonaut | астронавт / космонавт / **тайконавт** for every Chinese crew member (decision 4), even where the English says "astronaut" | «космонавт» for Chinese crews |
| mission control | центр управления полётами (ЦУП) | |
| countdown | обратный отсчёт | |
| abort | аварийное прекращение полёта; спасение | «отмена» |
| test flight | испытательный полёт | |

### Astronomy and astrophysics

| English | Russian | Avoid |
|---|---|---|
| astronomical unit (AU) | астрономическая единица (а. е.) | |
| light-year | световой год (св. год) | |
| parsec | парсек (пк) | |
| redshift | красное смещение | |
| Doppler shift | доплеровский сдвиг; эффект Доплера | |
| spectrum / spectral line | спектр / спектральная линия | |
| absorption / emission line | линия поглощения / излучения | |
| equivalent width | эквивалентная ширина | |
| blackbody | абсолютно чёрное тело | «чёрное тело» |
| cosmic microwave background (CMB) | реликтовое излучение | «космический микроволновый фон» |
| dipole (CMB) | дипольная анизотропия; диполь | |
| acoustic peak | акустический пик | |
| multipole | мультиполь | |
| dark matter / dark energy | тёмная материя / тёмная энергия | «тёмное вещество» (keep only if a page uses it consistently) |
| rotation curve | кривая вращения | |
| gravitational lensing | гравитационное линзирование | |
| gravitational wave | гравитационная волна | |
| merger | слияние | |
| gamma-ray burst | гамма-всплеск | |
| afterglow | послесвечение | |
| jet (astrophysics) | струя; джет | |
| neutron star / black hole | нейтронная звезда / чёрная дыра | |
| supernova | сверхновая | |
| exoplanet | экзопланета | |
| transit | транзит (прохождение планеты по диску звезды) | |
| radial velocity | лучевая скорость | «радиальная скорость» |
| parallax | параллакс | |
| astrometry | астрометрия | |
| magnitude (stellar) | звёздная величина | |
| light curve | кривая блеска | «световая кривая» |
| telescope aperture | апертура; диаметр зеркала | |
| primary mirror | главное зеркало | «первичное зеркало» |
| focal plane | фокальная плоскость | |
| angular resolution | угловое разрешение | |
| field of view | поле зрения | |
| infrared / ultraviolet / X-ray | инфракрасный (ИК) / ультрафиолетовый (УФ) / рентгеновский | |
| wavelength | длина волны | |
| solar wind | солнечный ветер | |
| corona (solar) | солнечная корона | |
| coronal mass ejection | корональный выброс массы | |
| solar flare | солнечная вспышка | |
| solar energetic particles | солнечные космические лучи; солнечные энергичные частицы | |
| solar particle events | солнечные протонные события | |
| Shoemaker–Levy 9 | комета Шумейкеров — Леви 9 | |
| milliarcsecond | мс дуги | |
| focal ratio | диафрагменное число | |
| galactic cosmic rays | галактические космические лучи | |
| heliosphere / heliopause | гелиосфера / гелиопауза | |
| interstellar space | межзвёздное пространство | |
| magnetosphere | магнитосфера | |
| radiation belts | радиационные пояса (Ван Аллена) | |
| opposition (Mars) | противостояние | «оппозиция» |
| conjunction | соединение | |
| elongation | элонгация | |
| ecliptic | эклиптика | |
| equinox / solstice | равноденствие / солнцестояние | |

### Planetary science

| English | Russian | Avoid |
|---|---|---|
| terrestrial planet | планета земной группы | |
| gas / ice giant | газовый / ледяной гигант | |
| dwarf planet | карликовая планета | |
| main belt (asteroids) | главный пояс астероидов | |
| near-Earth object | околоземный объект (АСЗ for asteroids) | |
| moon (natural satellite) | спутник; (Earth's) Луна | «луна» lowercase for other moons |
| far side of the Moon | обратная сторона Луны | «тёмная сторона» |
| mare / maria | море / моря (Море Спокойствия) | |
| crater rim / floor | вал / дно кратера | |
| ejecta | выброс; выбросы | |
| regolith | реголит | |
| soil (Mars, Moon) | грунт | «почва» (except quoting English "soil" on Earth) |
| bedrock | коренные породы | |
| sample | образец | |
| marsquake / moonquake | марсотрясение / лунотрясение | |
| magnitude (quake) | магнитуда | |
| crust / mantle / core | кора / мантия / ядро | |
| surface gravity | ускорение свободного падения на поверхности | «поверхностная гравитация» |
| surface pressure | давление у поверхности | |
| atmospheric escape | диссипация атмосферы; потеря атмосферы; (escape guide's term for channels) убегание: фотохимическое убегание | «побег атмосферы» |
| Jeans escape (decision 10) | джинсовская диссипация | «джинсовское убегание», «джинсовский уход» |
| Venus coronae / tesserae | венцы / тессеры | |
| superpressure balloon | аэростат сверхдавления | |
| dust storm | пылевая буря | |
| polar cap | полярная шапка | |
| water ice | водяной лёд | |
| subsurface ocean | подлёдный (подповерхностный) океан | |
| cryovolcano | криовулкан | |
| habitability | обитаемость; пригодность для жизни | |
| biosignature | биосигнатура | |
| planetary protection | планетарная защита | |
| planetary defence | планетарная защита от астероидов | |
| impact (n.) | удар; столкновение; падение | «импакт» |
| impact crater | ударный кратер | |
| mascon | маскон | |
| gravity field | гравитационное поле | |
| albedo | альбедо | |
| sol (Mars day) | сол | |
| Martian / lunar | марсианский / лунный | |
| Jezero Crater / Gale Crater | кратер Езеро / кратер Гейл (gen. кратера Гейла) — **no quotes** (decision 9) | «кратер „Езеро“» |
| Eagle / Endurance / Victoria / Endeavour craters | кратеры Игл, Эндуранс, Виктория, Индевор (no quotes); Apollo 11's LM Eagle stays «Игл» in quotes as a craft | |
| Meridiani Planum / Marathon Valley | плато Меридиана / долина Марафон (no quotes) | |
| Mount Sharp | гора Шарп | |
| Chryse Planitia / Utopia Planitia | равнина Хриса / равнина Утопия | |
| Elysium Planitia | равнина Элизий | |
| Mare Tranquillitatis | Море Спокойствия | |

### Physics, measurement, maths

| English | Russian | Avoid |
|---|---|---|
| gravity (force) | тяготение; гравитация; притяжение | |
| weightlessness / microgravity | невесомость / микрогравитация | |
| mass vs weight | масса / вес | |
| acceleration | ускорение | |
| velocity / speed | скорость | |
| momentum | импульс | «момент» |
| angular momentum | момент импульса | «угловой момент» |
| torque | момент силы | |
| energy / power | энергия / мощность | |
| heat flux | тепловой поток | |
| dynamic pressure | скоростной напор | |
| drag coefficient | коэффициент лобового сопротивления | |
| scale height | высота однородной атмосферы; шкала высот | |
| dose (radiation) | доза; эквивалентная доза (Sv) | |
| half-life | период полураспада | |
| uncertainty / error bar | погрешность; неопределённость | «ошибка» in measured values |
| significance (statistics) | значимость | |
| confidence interval | доверительный интервал | |
| model (scientific) | модель | |
| assumption | допущение | «предположение» acceptable |
| approximation | приближение | |
| first-order | в первом приближении | «первого порядка» (only for formulas) |
| order of magnitude | порядок величины | |
| logarithmic scale | логарифмическая шкала | |
| equation / formula | уравнение / формула | |
| derivation | вывод | «деривация» |
| proof | доказательство | |
| ratio | отношение | |
| proportional to | пропорционально | |
| dex | декада | |
| logic gate | логический элемент | |
| two's complement | дополнительный код | |
| ASIC | специализированная интегральная схема (ASIC) | «СБИС» (never) |
| FPGA | ПЛИС | |
| LIBS | лазерно-искровая спектроскопия | |
| inverse square law | закон обратных квадратов | |

### Site UI words

| English | Russian | Avoid |
|---|---|---|
| index (back link) | ← ОГЛАВЛЕНИЕ | «Индекс» |
| begin — chapter 01 | НАЧАТЬ — ГЛАВА 01 | |
| chapter | глава | |
| figure | рис. (РИС. 00) | «фиг.» |
| field guide | справочник; полевой справочник (in titles) | «путеводитель», «гид» |
| legacy (chapter) | НАСЛЕДИЕ | |
| references | ИСТОЧНИКИ | «Литература», «Ссылки» |
| see also | Смотрите также | |
| search | Поиск | |
| play / pause | ▶ ПУСК / ❚❚ ПАУЗА | «Играть», «Воспроизвести» |
| reset / replay | СБРОС / ↺ ЗАНОВО | «Перезагрузить» |
| launch (button) | СТАРТ | «Запустить!» |
| today | СЕГОДНЯ | |
| next / previous | следующий / предыдущий | |
| select / choose | выберите (hint); выбранный (label) | |
| slider | ползунок | «слайдер» |
| drag (hint) | потяните; двигайте | «тащите» |
| tap / click | нажмите | «кликните», «тапните» |
| readout | показания; табло | «ридаут» |
| status | статус; состояние | |
| active (mission) | АКТИВНА / РАБОТАЕТ (agree with the noun: миссия → АКТИВНА, аппарат → РАБОТАЕТ) | «АКТИВЕН» for a mission |
| ended | ЗАВЕРШЕНА (миссия) | |
| planned | ЗАПЛАНИРОВАНА | |
| model (label) | модель | |
| schematic | схема | |
| illustrative | иллюстративно; ориентировочно | |
| not to scale | не в масштабе | |
| to scale | в масштабе | |
| top-down view | вид сверху | |
| timeline | хронология | «таймлайн» |
| legend | легенда; условные обозначения | |
| loading… | загрузка… | |
| animation needs WebGL 2 | Для анимации нужен WebGL 2 | |
| mission of the day | Миссия дня | |
| read the field guide | Читать справочник → | «Читать путеводитель» |
| no field guide yet | Справочника пока нет | |
| period (era chip) | период | |
| preset | предустановка | |
| cover name | имя-прикрытие | |
| Selective Availability (GPS) | режим избирательного доступа (Selective Availability) | |

---

## Open questions for the coordinator (not for batch editors)

Status 2026-11-12: questions 1 and 2 were resolved by the coordinator (HUD `*_ru` fields + `data-phase-ru`; Russian
integers group only from 10 000). Kept below for the record.

1. **HUD labels in generated guides are English in Russian mode** (assemble.py writes `PHASE`, `meta.hud1/hud2`;
   `data-phase` on chapters). Proposal: `phase0_ru`, `hud1_ru`, `hud2_ru` in meta.json + `data-phase-ru` on chapters,
   and `helpers.js` picks by `lang`. Hand-made reference pages now do this in-page (`viking.html`, `transfer-earth-to-mars.html`).
2. **`fmtInt()` groups 4-digit numbers** (`1 524`), while Russian text doesn't (`1524`). Proposal: in RU mode group only
   |n| ≥ 10 000 (one-line change in helpers.js, then rebuild; checks.js that compare formatted strings may need updating).
3. **«CH.01 / 08»** stays Latin site-wide. If a Russian code is wanted, it is one mechanical sweep («ГЛ. 01 / 08») by the
   coordinator, not batch editors.
