# Journey — Scale r273

**Run:** `playtest-loop-20261123T1007Z`, scheduled 03:45 CST Mon 2026-11-23 / 09:45Z.
**Leg:** 3 SCALE (days 80–140), Lane A. **Base:** master `9c458f55a` at prereg.
**Seeds:** FRESH 106277–106284 (8-panel) + probe seed 106285 (unscored extra).
**Policy:** r244–r251 control verbatim, single arm B (`scalecourt-traderoad-r113-linkraise-sit` + muster ON + march ON, MUSTER_HOLD=sitting, STAGE_CAPSTONE=off, ANSWERMAIL off, COMPETENT_ROUTE_AROUND=1 for the march walk only). DAYCAP 140, death-aware stop.
**Pre-flight note:** main tree had ONE untracked file at run start,
`evidence/2026-11-23/sim-scale-onramp-round-0815.md` (the
fleshout-20261123T0815Z coordinator's round record; no live owner, lock
deleted at its closeout, no registry tree). Left untouched — another
run's real work, never committed here; it cannot be swept into a
worktree safe-commit or an ff-merge. Disk 50%. Lock
`playtest-loop-20261123T1007Z` created 10:08:00Z; rotation 3→0 written
at run start and read back.
**Finisher note:** this run completed in one occurrence (no timeout
adoption needed). Registration took ~12 min (loaded box); no flap
window observed during the run.

## Leg question (prereg)

Can a competent village reach national standing / the table approach in days 80–140 on current master, and what blocks it? Interesting iff ≥3/8 national, OR a new blocker class, OR a taxonomy miss (UNKNOWN), OR a fixable defect in the table-approach path. Else QUIET.

**Short answer: QUIET — but the wall moved, and the run found and fixed the mechanism that dissolved the one national.** One seed reached national AND global (106282, trade road, d71/d72); the same seed then LOST national on d115 because its standing muster bled the trade league's trust to death — and the fix (fruitless-march stand-down, proven by same-seed replay) keeps it global to the horizon. The panel verdict is QUIET on the unfixed driver; the fix is proven, not just proposed, and the next run's panel measures it band-wide.

## Panel numbers (arm B, seeds 106277–106284)

| Seed | End | Rank | Lesser | Full | w4 fights/kills | w5 faced | Deaths |
|------|-----|------|--------|------|-----------------|----------|--------|
| 106277 | 39d OVER | regional | d32 | — | 0 / 0 | 0 | 6 |
| 106278 | 141d | regional | d52 | — | 1 / 1 | 0 | 9 |
| 106279 | 141d | regional | d37 | — | 10 / 3 | 0 | 13 |
| 106280 | 134d OVER | regional | d34 | — | 6 / 2 | 4 fights | 16 |
| 106281 | 141d | regional | d40 | — | 14 / 1 | 0 | 16 |
| 106282 | 141d | global* | d59 | — | 6 / 3 | 0 | 22 |
| 106283 | 65d OVER | regional | d32 | — | 1 / 0 | 0 | 6 |
| 106284 | 141d | regional | d36 | — | 14 / 6 | 1 fight | 5 |

\* 106282 reached national d71 and global d72, then LOST national d115 (see the blank below); its end rank in the unfixed panel is regional. The fixed-driver replay ends it global (see Fix).

Band: national **1/8**, lesser seat priced **8/8**, full seat **0/8**, wave-4 fights **52** / kills **16**, wave-5 faced **2/8**, survival **5/8**, lived-days mean 117.9 (control 123, −4.1%, HOLD). Deaths 93 panel-wide; starvation deaths 4 (all on 106277, the d39 collapse); collapses 106277 (d39), 106280 (d134), 106283 (d65).

**Wave-4 fight slide: 231 → 168 → 101 → 62 → 82 → 85 → 52 (r246–r273).** The band total fell below the r249 trough — but the decomposition says composition, not spawn: the two pre-wave-4 collapses (d39, d65) contributed 1 wave-4 fight between them, and per-surviving-village wave-4 fights are 9.0 (45 over 5 survivors) vs r251's 10.0 (50 over 5). The kill rate is unchanged (16/52 = 31% vs r251's 27/85 = 32%). No spawn/engagement change is indicated; the watch stays open one more run.

**Wave-5:** faced on 2/8 seeds (census fightsByWave['5'] > 0). 106280 MIXED (10 w5 fights, 4 scholar + 6 field; recurring lingerers ling10 ×4, ling12 ×3; wild Editor hp1500, timeslot, cancellation; the village died d134). 106284 UNANSWERED (4 w5 fights, all wild spoiler hp1300; the spoiler lived d117–d140, 56 days, fought 4 times, never killed). No village faced the wave-5 door as a door — roaming/field wave-5 entities again, same as r250/r251.

**Tribute:** DELIVERED 1/8 (106284 military_tribute d123); READY-UNPAYABLE 1/8 (106280: ready d97, 8 attempts, all veterans-short); NEVER-READY 6/8. The veteran shortage, not the deed, is what blocks tribute delivery — same as r251. Trade charter delivered 1/8 (106282 d72).

## Q1 — QUIET (the wall stands as measured)

Blocker taxonomy: NATIONAL 1 (106282), FORMATION-LATE 1 (106284 — LEAD 3rd link formed late, 2/3 seasoned with 3 active), COLLAPSE 3 (106277 d39, 106280 d134, 106283 d65), FORMATION-FEW 3 (106278, 106279, 106281 — LEAD 2/3 ever seasoned, one link short each). No RUNG, no RUNG-HORIZON, no UNKNOWN this band — the new RUNG-HORIZON split did not fire, and RUNG (observed since r251) did not fire either. The interesting-bar (≥3/8 national) was not met; no new class; no taxonomy miss.

### Stall — 18 phantom days, 0 stalled-while-ready

Standing-199 stall: 18 phantom days on 1 seed (106284, d123–d140). The per-day split says **0 days stalled-while-ready, 18 stalled-while-not-ready** — the stall is not binding. And the mechanism is visible: the stall starts exactly on the day 106284 DELIVERED its military tribute (d123) — the delivery sends two veterans away, the living-veteran count drops below the wave-5 demand, and the readiness gate holds the village at the t5−1 cap for the rest of the horizon. The tribute and the readiness bar pull in opposite directions: a village that pays tribute cannot reach readiness-5 afterward on this horizon. That is honest mechanics (the price is real), not a defect — but it is a design tension, noted for Steve, not fixed here.

## Q2 — WINPLAN (ported snapshot)

Plans ignite on **8/8 seeds**: 76 plan seeds, **160 departures** on 8 seeds, **trios=0 quads=0**, 627 party fights, 0 reseeds, 0 expiries. The homebody-metric-a handoff is IN this run's base — and departures are still all pairs. Per-seed departures range 5–46; the largest (106284, 46 departures, 187 fights) still never fields a trio. The handoff moves a range-0 holder's plan to a walkable companion (still a pair); it was never a third-person mechanism, and the pair-only wall is unchanged since r249/r251. 106282 seeded 49 plans but departed only 15 — the plan store is awake, the launches stay paired.

## Q3 — REGRESSION GUARDS: all HOLD/GO

- VETBAR **GO** (0 disagreements across 8 seeds).
- Lived-days **HOLD** (117.9 vs control 123, −4.1%, guardrail ±25%).
- Lesser seat priced **8/8 HOLD** (bar ≥4/8).
- SPOKEN-RAISE **GO** (11 talks: 8 properly-answered, 2 counter, 0 not-offered-spoken defect, 1 not-offered-unspoken correct hold).
- TRAP-LINE **HOLD** (0 defect sittings; mimes in capture 15).
- BETRAYAL sibling **HOLD** (0 defects; Thabo verdict stands).
- NOD-LOOP **HOLD** (0 sittings with a ≥4 identical nv: react streak; worst 3× nod).
- MUSTER **MOVED**: 321 titan days, 4 calls, 1 titan slain, 1 titan fight started, 15 refused meetings, 4 committed blades died. Living-veteran peak 6.
- MARCH **MOVED**: 67 march days, arrived 67/67, 1 fight on-march, 1 slain on-march. (The 64-day fruitless march on 106282 is the blank below — counted here in the unfixed panel.)
- DOWNEDTWICE watch: **no recurrence** (no doubled downed-ally trust hits in the corpus).
- GONE-BEARER watch: **no recurrence** (no dead bearer's joint run urged as finishable in the read transcripts).
- SUBCAP guard: lever OFF as designed. ANSWERMAIL: 0/8 fired, as designed.

## Q4 — PEOPLE CHECK: PASS (with the blank below)

Two full transcripts read in full (plus a third and the warn check), all 11 raise talks, all 3 nonverbal sittings, 12 driver transcripts scanned.

- **106282 d90 (Nora, tailor, gentle, trust 47, want: curious):** reads as a person. Opens on grief ("We gave them a good burial. Doesn't feel like enough, does it?"), the invite pays off in open conversation ("Come see what I found" → accept → "It's quiet at the hollow. Nora doesn't say much. Sometimes that's the whole point."), then the curious want lands ("So what's your plan here? Just... get through it?"). A thread opened and closed.
- **106278 d90 (Jack, rail conductor, cautious, trust 92, want: ask_favor):** the best transcript of the run. "The future is a rumor. Today is a fact. I deal in facts." The "Go on / Tell me more / I'm listening" picks each draw a distinct, characterful line ("Whatever it costs. I've decided." / "I'm not proud of how I survive. I'm just committed to it." / "Survival's not a goal. It's a prerequisite for having goals."). The tell-me-more is answered with substance every time — NOT the r239 echo defect.
- **106280 d120 (Giulia, crossing guard, warm, trust 84, want: warn_you):** warn_you HEED confirmed, working as designed. The player heeds three times; Giulia escalates ("Last night I laid awake listening. Every sound was you not coming back. Please. Just — come back."). The want progresses stage 1→3.
- **106284 d120 (Ava, street artist, gentle, trust 31, want: ask_favor):** short but coherent — a cut she can't clean one-handed, the player commits to come back and help, "Careful with it. And — thank you." Stage 1→3.
- **106280-2 raise talk (Mía, veterinarian):** "I used to be a veterinarian who worried about being on time. Now I worry about being alive. Same worry, bigger font." Reads as a person.
- **Closing-line duplication: count stays 6.** No new verbatim SPOKEN closing-line duplication across the 12 driver transcripts ("Good talk." ×1 only). Variety note, not the counted class: the nonverbal closer "They press their palms together — thanks, or goodbye, or both. Then turn back to their own thoughts." repeats 3× across the 3 NV sittings.
- **NV 3-nod flat spot persists:** all three NV sittings run nod ×3 (Hanna the Ukrainian hunting guide; Farid the Bengali locksmith, twice). The guard HOLDs (worst 3×, bar is ≥4), but the flat spot is unchanged since r250.
- **Tell-me-more echo:** not observed (the two "Tell me more" picks are answered with new lines). **warn_you heed:** confirmed (Giulia, above).

## Q5 — CENSUS + spotter d90 + W5-INSTANCE

Spotter: 1 villager with foodXp.spotter>0 on most seeds at d90 and end; spotter skill≥1 on 0–1 per seed. Thin but present, same as r251. W5-INSTANCE: see Wave-5 above (106280 MIXED, 106284 UNANSWERED). Sortie: inert by design (0 called, 0 lingerer days).

## Q6 — DIALOGUE WATCH: the blank — orphaned raise-talk invite lines (counted in LINES this run)

**Count this run: 4 orphaned invite LINES in 11 panel raise talks** (r251: 2 lines in 7 talks — the count grows in line terms):

- 106277 d10, Godelive: "Come see what I found. You won't believe it." spoken mid-raise-talk; the player answers the raise; the invitation dies.
- 106279 d6, Ivy: "Help me haul something back? Too much for one." spoken mid-raise-talk; the player answers the raise; the haul is never addressed.
- 106280 d120, Greta (not-offered): "Come see what I found." spoken in a sitting whose raise was never offered; the invite dies with the sitting.
- 106284 d134, Ava: "Help me haul something back? Too much for one." spoken mid-raise-talk; the player answers the raise; the haul dies.

**Counter-evidence — open-conversation invites resolve:** the same lines in open conversation own the menu and pay off (106282 d90 Nora, above; 106284 d90 Farid's mime-accept walks the trap line). The orphan is specific to the raise-answer-talk shape, not to the invite system — same as r251's finding, now with a line count.

**Why not fixed here:** same as r251 — the fix touches the conversation engine's menu/held-beat plumbing (the invite-honesty invariant) and cannot be landed on an unproven trace. This run's one blank is the fruitless-march stand-down (below), which was fully traced. The orphaned-invite finding stays filed for a builder arm, updated with this run's count (4 lines / 11 talks) and the Greta variant (invite orphaned in a not-offered sitting, not just an answered raise).

## The blank — FRUITLESS-MARCH STAND-DOWN (fixed this run)

**The finding (106282, traced end to end in the panel corpus):** the village reached national d71 (trade road, 3/3 seasoned, charter delivered d72) and global d72 (viewership 42). On d77 the herald (stage 2) was located and the muster was called (13 allied blades + 2 Haven). The march then walked to the herald's tile **64 days running (d77–d140), arrived every day, and no encounter ever started** (pending=0 on all 64 rows; the roaming herald's lair moved daily: 8,4 → 7,4 → 7,5 → 5,4 → 4,3). The standing muster was hungry the whole time — 15 blades × 1,000 kcal/day the village could not feed — and the game charges that hunger as **−2 trust per allied link per hunger day** (titans.js upkeep; the charge is honest, the policy is what's wrong). **251 muster-hunger events** bled all four links: the three trade links fell from ~50 to below the 40 seasoned bar, trade dropped 3/3 → 2/3 on d115, the league dissolved, and national (45 days) and global (44 days) lapsed. The village that reached global on d72 ended regional with trust 0 on every link. The muster was never stood down — the driver's only stand-down trigger is a titan going absent, and the herald never left.

**The fix (driver policy only — zero src/js change):** in `scripts/journey-scale-r273-20261123.js`, after **7 consecutive arrived-but-no-pending march days**, stand the muster down (`G.titanStandDown`) and hold the re-call for **30 days** (a season) in the muster step (`fruitless-cooldown`), so the stand-down sticks instead of re-sounding the call the next morning. A pending encounter resets the count — the march did its job. The hunger bleed stops with the muster (titans.js upkeep returns early on an empty muster).

**Proof (same-seed replay, seed 106282, fixed driver vs the panel corpus):**

| Measure | Unfixed (panel) | Fixed (replay) |
|---|---|---|
| muster-hunger events | 251 | 52 |
| national days | 45 (d71–d114) | 70 (d71–d140, unbroken) |
| global days | 44 | 69 |
| march rows | 63 | 14 |
| final rank / trade | regional, 0/3 | **global, 3/3** |
| fruitless stand-downs | 0 | 2 (d83, d120) |
| re-call cooldown holds | 0 | 49 |

The stand-down fired d83 (the 7th fruitless day), the re-call was held on cooldown, a second fruitless week after the d113 re-call stood down again d120, and the realm held. Proof test `scripts/test-fruitless-standdown-r273.js`: **10 passed, 0 failed** (3 control assertions on the unfixed corpus + 7 fixed-run assertions, replaying the seed live in ~40s). The analyzer proof test: **159 passed, 0 failed** (rewritten case 58: RUNG is observed now so the RUNG panel is QUIET; new cases 70: UNKNOWN still fires INTERESTING; 71: RUNG-HORIZON classifies and stays QUIET).

**Scope note:** the fix is proven on one seed; its band-wide effect is the NEXT run's panel (the next scale run clones this driver). The panel verdict above is on the unfixed driver, as pre-registered. The fix touches only the r273 driver scripts — no game code, no gate, no threshold, no price.

## Village assessment (plain words)

Five of eight villages are still standing at day 140, and the one that reached national did it on the trade road — three seasoned trade links, a charter delivered, national the next day and global the day after. Then it lost everything, not to a monster or a famine, but to its own army standing hungry in a field for two months: the muster it called to kill the herald never got its fight, and every day it stood there unfed, every village it was linked to trusted Haven a little less, until the league that made it a nation fell apart. The villages that died, died the old way — scattered by hunger and monster pressure before their links seasoned (106277 gone by day 39 with zero wave-4 kills; 106283 down by day 65). The villages that lived fought in pairs, as always — 160 plan departures and not one trio, even with the handoff lever now in the game. The strongest village (106284, nine alive, six wave-4 kills, tribute delivered) still sat one seasoned link short of national, and paying its tribute cost it the veterans its readiness needed. The people themselves read as people — a rail conductor who has decided what survival costs, a crossing guard lying awake listening for someone to come home, a veterinarian who worries about being alive now — but four times in eleven raise talks someone offered to show the player something, or asked for a hand hauling, and the conversation walked past it like it hadn't been said.

**Reachable / fun / winnable:** the table approach is reachable (lesser seat priced 8/8, national 1/8 + the fix keeps it); the full seat is still unwon on the control policy (0/8, and the deed gate's tribute delivery is veteran-starved, not deed-starved). Fun holds where the people talk well; the orphaned invitations and the nod-nod-nod sittings are the visible cracks in it.

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-r273-gate` on the rebased tip `cc5fc220a` (base `70120c554`): **339 passed, 5 failed in 687s, exit 1. 0 attributable.** The 5 are the same standing set as r251's first gate (also 339/5):

1. `scripts/godpath/test-measurement-proof-update.js` — "Proof source inputs are not current" (balance-proof-update validator; the retained proof's inputs changed under it).
2. `scripts/godpath/test-measurement-workflow.js` — "retained neutrality proof covers the current Game/controller/harness inputs" (8/1).
3. `scripts/godpath/test-phone-frame-proof.js` — retained browser inputs vs current source (index.html et al.) + "Phone receipt source is stale or missing: index.html" (3/3).
4. `scripts/godpath/test-living-garden-deed-attainment.js` — 120s check.js cap timeout.
5. `scripts/godpath/test-one-person-army-deed-attainment.js` — 120s check.js cap timeout (same timeout in r251's gate).

All three proof failures are staleness drift from the intervening landings (fleshout adoption + social-life r268 changed Game/controller/index.html inputs under retained proofs) — not from this run, which touches no src/js, no index.html, no godpath files (4 new r273 scripts + 2 evidence notes only). The two timeouts are slow seed-loop tests, not logic failures: the garden test re-ran **green standalone** (8/0, ~143s, exit 0). The army test's first standalone re-run died empty (exit 1, 0 lines) **inside an active write-flap window** (flap-watch 11:05–11:10Z: A=FAIL@write, B=FAIL update-ref, node-fsync-rename EPERM) — a flap artifact, not a test verdict. **Re-run in the clear: exit 0 (green).** The same flap window also killed a fruitless-proof re-run mid-flight (4/6 — the replay corpus landed only 3 files); re-run in the clear: **10/10 green**. Flap window 11:05–11:10Z (~5 min); the heartbeat failed twice inside it (10:55:03Z → 11:10:31Z) and was re-landed by retry — no staleness threshold was breached. Gate adjudication complete: **339/5, 0 attributable.**

## Telemetry

`node scripts/telemetry-check.js --baseline scale-wall.json --current 'journey-scale-r273-b-*.json' --metrics national,table,wins,exiled`: **3 LOUD lines** (national 12→0, table 16→0, wins 16→0; n=126 files). **Explained, not a deviation** — identical to r251: the baseline's own `_regime` note says not to compare readiness substrates against it; wins are structurally ~0 there and the check fires a spurious LOUD. This panel is a readiness substrate (control policy, wins 0/8 by design). **Baseline NOT rolled.**

## Metric review

- **RUNG-HORIZON:** the split worked as designed — no RUNG-HORIZON fired this band (no rung completed on a final day), and the proof cases (58/70/71) pin the behavior. RUNG is now observed; UNKNOWN still fires INTERESTING by design. The observed set for the next run stays {TRUST-LOW, NATIONAL, SNAP, FORMATION-FEW, FORMATION-LATE, COLLAPSE, RUNG, RUNG-HORIZON}.
- **Standing-199 stall:** the per-day split is the adopted reading (0 ready / 18 not-ready on 106284). The peak split (18 ready) is invalid as written and is kept only for continuity, labeled invalid. New mechanism noted: the stall starts on the tribute-delivery day — the delivery's own veteran price. The next run should watch whether tribute delivery systematically stalls readiness.
- **Wave-4 fight slide:** 52 this band — the decomposition (early collapses, flat per-survivor rate) says composition, not spawn. Keep the watch one more run; if the next band is also <60 with no early collapses, ask whether spawn/engagement changed.
- **Orphaned invitations:** counted in LINES per raise talk from this run on (4 lines / 11 talks). The r250 10/18 and r251 2/7 counts are not directly comparable (invitations vs talks vs lines) — the line count is the unit now.
- **Homebody handoff:** in base, departures still all pairs (160 departures, 0 trios). The handoff is a plan-survival mechanism, not a party-size mechanism — the trio question needs a different lever, not a re-run of this one.

## Method notes (for the next run)

- The driver prints per-seed JSON to stdout and never writes a seed file; the panel outputs live in goal hidden_files/evidence/2026-11-23/ (arm B). The analyzer reads that dir and prints to stdout — capture it with a direct redirect, never pipe through head (SIGPIPE killed the finisher's first attempt in r264's closeout; same hazard here).
- The analyzer proof test (`scripts/test-journey-scale-r273-analyzer-20261123.js`) runs 159/159 BEFORE the panel, per the prereg. The fruitless proof test (`scripts/test-fruitless-standdown-r273.js`) replays seed 106282 live (~40s) — 10/10.
- Probe seed 106285 ran as an unscored extra (collapsed d108, pop 1/1); the analyzer scores only 106277–106284.
- Registration took ~12 min on a loaded box (git reset --hard is the slow step); no flap window observed this run.
- The next scale run clones the r273 driver WITH the fruitless stand-down — its panel is the band-wide measurement of the fix. Do not re-run the panel on the unfixed driver.

## Closeout

- Panel commit `766eb26f4` (base `9c458f55a`) rebased onto local master `70120c554` (fleshout adoption + social-life r268 landed first) → tip `cc5fc220a`; proof tests re-run green on the rebased tip (analyzer 159/159, fruitless 10/10). Gate on `cc5fc220a`: 339/5, 0 attributable (see Gate). Gate-section commit (this note + a one-line house-rule fix: the new fruitless helper's empty catch now logs via console.error) → merged `--ff-only` into local master; worktree released; main tree verified clean (the one pre-existing untracked fleshout round-record file, `evidence/2026-11-23/sim-scale-onramp-round-0815.md`, still present — another run's work, untouched).
- Telemetry: 3 LOUD lines, explained regime artifact; baseline NOT rolled.
- Lock `playtest-loop-20261123T1007Z` deleted at closeout (same-call read + delete, run_id match).
- Flap window 11:05–11:10Z (~5 min) struck the gate-adjudication re-runs and two heartbeats; nothing lost; the fruitless proof and the army re-run both went green in the clear.
- Rotation-a 3→0, read back. Merged locally, pending ship — no version tag; the ship job reports the tag when it goes live.
