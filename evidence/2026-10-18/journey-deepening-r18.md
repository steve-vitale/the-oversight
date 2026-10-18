# Journey leg: DEEPENING (days 40–80) R18 — the article class + curious substance — 2026-10-18

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14)
- **Question:** in the deepening window on the fixed tree — (a) does the r18 article-class fix (`Game.articlePhrase`) hold in the wild; (b) does the landing-r22 "curious"-want filler loop (#541) persist in mid-game transcripts, and does substantive curious material (added this run) surface; (c) the deepening census: wave 2–3 engagement, knowledge economy/specialists, regional links.
- **Binding metrics:** A1 article-wild — 0 double-article matches in captured sayLines (proof test GREEN pre-run; wild confirm). A2 curious — ≥8 transcripts sense-read, filler flagged; if ≥2 show curious-want filler, the content addition is REQUIRED and must pass its proof test. H2–H5 holds — pipeline health on ≥3/4 (r17: GO 4/4, carried as hold). M5 people — ≥10 transcripts read in full, 0 senseless. M6 winnable — alive at day 100 on ≥2/4.
- **Interesting-finding bar:** a villager-named monster's flesh referenced cleanly in a real beat; a mid-game curious conversation with a real thread; specialists teaching; regional link beats read for sense.
- **Seeds:** 9101–9104 (pilot, §9). Policy: competent (base; no r17 regionalPlay/gearUp extensions). DAYCAP=100, death-aware. Two runs: pre-fix baseline + post-fix wild-confirm (same seeds, narration-only changes → trajectory-identical by construction).
- **Canon read:** CANON.md; MONSTER-WAVES.md; Steve 2026-10-16 haul-unrevealed design; PRESERVATION.md. No new canon.

## What ran
- Harness: `scripts/journey-deepening-r18-20261018.js` (lean: competent × 100d, sayLine capture with article-double scan, curious-want filler census, conversations d45/60/80, end census). Base master@80b442c38. All work in worktree journey-deepening.
- Proof tests: `scripts/test-article-phrase-20261018.js` (22 checks, RED→GREEN), `scripts/test-curious-deeper-20261018.js` (5 checks, GREEN incl. live integration).
- Outputs: `evidence/2026-10-18/journey-deepening-r18-{census-*.json,summary.json,run.log,run2.log,transcript-*.txt}`.

## BLANK 1 FILLED: the double-article class (#542 + 5 wild-caught siblings)
Landing r22 found "the The Loud Beast flesh" (Mara's line). Root cause: callers compose `"the " + monsterNoun()/monsterDisplayName()` blindly. monsterNoun keeps proper/village names' casing ("The Loud Beast"); monsterDisplayName returns raw descriptors that carry articles ("the toad like a war drum", "a dog-shaped silence"). Fix: `Game.articlePhrase(noun, cap)` (game.js, after monsterNoun) — strips a LOWERCASE leading article only (grammar, not the name); capitalized first words stand bare (village coinage "The Loud Beast", System names "The Redactor"); `cap=true` for sentence starts. Convention matches the existing game.js:31247 precedent.
- Sites fixed (11): food.js testMonsterMeat ×2 (the r22 line), game.js villagerExperimentBeat ×2, game.js patrol summary ×2, game.js impact ×2, game.js counter-observed possessive, game.js fled-monster re-find, havenGrowth raid ×1 + sortie ×2, party-formal split-team ×4, contestEngine "wins the The Lottery" (systemic — "The Pit"/"The Moot"/"The Box" all doubled), villager-objectives haul departure + teachChoreLine article regex, villager-agency teach deed article regex, villager-mapmem haul find/butcher ×2.
- Wild-confirm: 12 doubles (run 1) → 1 (run 2; the counter-observed site, fixed after run 2 started) → proof test covers all 13 compositions. A1: GO.
- Live wild lines post-fix: "Jenny sets out for The Big Beast." / "James finds The Big Beast — too far gone." (haul diagnostic).

## BLANK 2 FILLED: curious-want substance (#541)
Landing r22's shape (Priya 77/d8, Paluku 76/d10): curious question asked → answered → react → dry-pool filler ("That's... pretty much all of it.") → dead-react loops ("So."/"Well."/"Anyway."), yet resolved "engaged". The engine wasn't broken; the pool was thin — no substantive post-answer material existed (the `follow` field fired 50% and never continued the thread; 0/36 transcripts had a follow line).
- Content (data-first): all 36 curious bespoke questions in `src/data/characterGen.json` now carry a `deeper` beat — the NPC's own substantive stake in their question (their reflection, their experience; `{occ}`/`{origin}`/`{an_occ}`/`{skill}` personalized via fillTalkLine; no fabricated shared history). 36 lines, e.g. q_first_week: "Spite, mostly. Pure, clean spite at the sky. Then someone shared food with me and the spite turned into something else."
- Wire (minimal): the answer handler queues `deeper` RELIABLY as a held beat (replaces the 50% follow lottery on this path) — answering a real question earns a real exchange; unspoken beats die honestly if the player moves on (existing one-beat-turns rule).
- Live shape now (Teresa, q_laugh_memory): Q → A → react ("Stealing joy. I like that.") → continuer → deeper ("Three days ago. Someone dropped a whole basket of tubers..."). The middle has substance. A2: GO (proof test 5/5 GREEN incl. live integration).
- Residual (documented, not a violation): 3/24 run-2 curious transcripts show dry-pool lines, all the STAGE-0 shape — a substantive opener (recall/teach thread) with a waiting curious want that never surfaced; the player pumped "Go on" on a complete beat and got honest admissions; resolution=unestablished (honest, unlike r17's unearned-engaged). The deeper doesn't apply (no question was answered). No content is missing — the opener had meaning.

## Verdicts on the binding metrics
- **A1 article-wild — GO.** 12 → 1 → 0 (the 1 was fixed post-run-2; proof test covers it).
- **A2 curious — GO.** 25 curious conversations (run 1); the answered-question filler shape confirmed (Otis/James/Grace); deeper content added (36/36), proof test GREEN, live shape verified.
- **H2–H5 holds — INSUFFICIENT DATA (honest).** My lean harness didn't instrument the haul chain; a same-seed diagnostic (9101) showed offers 2 / choices 0 / arrivals 0, experiment beat 101 daily checks (mostly no-ops — no unknown flesh on natural competent substrate), 1 reveal. r17's GO 4/4 stands; my substrate didn't produce haul traffic. Not a regression — narration-only changes.
- **M5 people — GO (12 read, 0 senseless).** Standouts: Harper (q_left_behind) — "Just: 'Yeah.' A long quiet. 'Me too.'" — restraint done right; Miles (seek_taken) opener has real need; Eamon (seek_comfort) warm. Wrinkle: Eamon's closing line is one of r17's verbatim-repeat lines (social lane's item, already handed over).
- **M6 winnable — GO (4/4 survived to day 102).** Wave 3 on 3/4, wave 4 on 1/4 (9104). Pops 7–11.

## Village assessments (plain words)
- **9101 (9 alive, wave 3):** the steady one. Pantry 6.5k. No specialists, no regional (base competent lacks r17's drivers — measurement note, not a game finding).
- **9102 (11 alive, wave 3):** the populous one. Pantry 11k. Harper's left-behind exchange was the run's best beat.
- **9103 (7 alive, wave 3):** the thin one. Pantry 10.5k. Eamon's comfort thread warm but unresolved.
- **9104 (8 alive, wave 4):** the ambitious one. Pantry 21k. Reached wave 4 on base competent — the Standing gate is reachable without policy drivers.

## Deepening census notes
- **Specialists: 0/4 seeds.** The knowledge-economy specialist layer isn't emerging on base competent play in the window (r15: "2 preservers only"). Open question for a future leg — is the specialist economy reachable at all, or driver-dependent?
- **Regional: 0/4.** My harness dropped r17's regionalPlay/gearUp policy extensions; r17 had regional 4/4 WITH them. The delta is harness, not game. A future run should carry the extensions for comparability.
- **Wave 4 on 9104** via Standing on base competent — the diplomacy/standing road is live without drivers.

## Telemetry deviation check
`telemetry-check.js` vs deepening.json: **1 LOUD line, EXPLAINED** — "popAlive newly appeared: baseline 0 -> current 35" is a schema artifact (my r18 census is a different instrument than r17's sweep that seeded the baseline; the baseline's wave-fight metrics aren't in my files). Not a real deviation. No baseline roll (my instrument doesn't produce the baseline's metrics).

## Metric review (§14)
- **A1's bar (0 doubles) was honest** — the scan caught 5 site-classes beyond the reported one, including a systemic contest bug. The instrument earned its keep.
- **A2's "≥2 → content required" fired correctly**, but the residual filler is a different shape (stage-0 honest wind-down, not the #541 violation). Proposed A2': split into answered-shape (deeper's target — now fixed) vs stage-0 shape (honest; track separately, don't conflate).
- **H2–H5 as "holds" needs the haul instrumentation** — my lean harness dropped r17's chain wraps. Next deepening run should carry them or drop the hold claim.

## Reachable / fun / winnable (deepening leg)
- **Reachable:** YES — wave 3 on 3/4, wave 4 on 1/4, curious conversations with real threads on 24/36 transcripts, the article fix holding across 13 composition sites in the wild.
- **Fun:** the curious want now has a middle — Teresa's tuber story, Harper's quiet "Me too." The NPCs' own stakes make the exchange feel like two people, not a menu.
- **Winnable:** 4/4 alive at day 102, including a wave-4 reach on base competent.
