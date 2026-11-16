# Journey leg ESTABLISHMENT — r225 run note (2026-11-16, Lane A)

## Run
Run id `playtest-a-20261116T1011Z` (scheduled Mon 2026-11-16 03:45 CST),
ADOPTED by run `playtest-loop-a-20261116T121159Z` (scheduled Mon
2026-11-16 05:45 CST). Rotation read `1` (establishment); write `1→2`
at closeout with read-back. **Base:** local master `b659acdd5`
(sim-gateconfirm-a evidence landing). Heartbeat loop running (10-min
cadence, `journey-establishment-hbloop-r222.sh` — file name carries the
slug, not the run number — pid 35901); registration heartbeat landed
immediately; re-heartbeat 10:20:16Z. Pre-flight: main tree CLEAN, disk
43%. Lock created by this run 2026-11-16T10:11:57Z. No push (ship loop
owns pushes). Registration itself took ~5.6 min (slow `git worktree
add` under box load — same shape as r221's ~5 min registry-lock wait).

## ADOPTION (the 05:45 run takes over r225 — read first)
The 03:45 coordinator DIED mid-run: heartbeat stale since
2026-11-16T11:01:04Z, hbloop pid 35901 gone, no driver process, lock
gone, uncommitted fix + prereg/driver/analyzer/proof-test stranded in
the tree. Last r225 file writes 11:51–11:54Z (the src/js fix). Per the
closeout rules (heartbeat >15 min stale, no processes, no writes <15
min old) the run is dead; the work is adopted in place under the same
slug/branch `journey-establishment` — no fresh slug needed, the tree
is already this loop's. The adopting run verified every claim below
independently (analyzer re-run, proof test on fix AND on base,
trace-level pick inspection, full-transcript reads) rather than taking
the dead run's word. The dead run's own lock (created 10:11:57Z) was
already gone at adoption; the adopting run created its own lock
`playtest-loop-a-20261116T121159Z` at 12:11:59Z.

**Write-flap interlude (adoption blocked ~80 min):** a flap window
opened 11:45:53Z (flap-watch log, still open at 12:49Z) and refused
every fresh-file write — heartbeat, `git stash`, run-note writes all
EPERM. The flap is the known host-side write refusal (same window
also blocked the 06:18 CST reaper run; see `~/memory/2026-11-16.md`).
Writes to EXISTING files still went through (the adoption record
appended to the memory log at ~12:30Z). The window cleared between
13:07Z and 13:09Z (~83 min, the longest on record); heartbeat landed
13:09:36Z and the closeout below ran immediately. The r225
coordinator's death is consistent with the flap: its heartbeats
stopped landing after 11:01Z while its edits to existing files kept
working until ~11:54Z, and it could neither commit nor heartbeat —
then its turn ended. Nothing was lost: all r225 evidence + the fix
were on disk in the tree.

## Pre-registered bars (r225 prereg)
Q1 FAVORLESS ASK, LIVE TRACE (new — r221's named next Q1). Q1b
WANT-RAISE, REGRESSION GUARD (r221 Q1, thresholds verbatim). Q2
SITTING CLOSES (standing bar, r217 Q1 thresholds verbatim). Q3 recap
paraphrase (report-only, A2 floor). Carried bars: SPOTTER ≥10 total +
every seed >0; LADDER ≥1 villager at 5+ XP on ≥3/4 seeds; FASTER-ID
≥2/4 seeds; END BAR (broken-live forage closed ≤2 dawns); TRUST GUARD
0 drops (hard); VILLAGE BAR alive d40 ≥3/4; JAM report-only;
STRANDED/TRAVEL/THREAD carried watches; PEOPLE CHECK (2 held convos,
one panel seed, read in full); SCHOLAR-DEATH standing metric (≤2 per
5-seed panel = WATCH; ≥3 = investigate).

## Analyzer verdicts (r225 panel, seeds 101101–101105, 42d)
- **Q1 FAVORLESS ASK: GO — 19/19 favorless sits classified, all
  class E1 (opener NEVER RAN), dominant mechanism 100% ≥ 50% and
  reproduced in a staged proof (below). 0 unclassified, 0 class D.**
  Favorless rate 19/58 raised asks (32.8%; r221: 20/73 = 27.4%).
  The want opener never ran because a resume/recall/case thread
  pre-empted the opening, so the fresh ask_favor want waited at
  stage 0 with a LIVE need and no favor attached. Per-sit classes:
  E1 19; A/B/C/D/E2/E3/E4 0. Repeats: Petra ×3, Ruby ×2, Joshua ×2,
  Stan ×2, Ellis ×2, Kathleen ×2, Aki ×2, Morgan/Dagmar/Hannah/Leo
  ×1. Contentless re-seeds after favorless sits: 0/19. Stage max:
  15 sits stayed stage 0; 4 reached stage 3 (Ruby d22/d31, Stan
  d34, Aki d32) — all four through the defect handler below.
  Needs in the favorless sits: forage_help/u2 (10), sick_help/u4
  (5), food_share/u4 (3), water_haul/u3 (1). The r221 hypothesis
  (unfinished-business seed pre-emptor + contentless re-seed) is
  REFUTED as the mechanism: no sit is class A/B, and no re-seed
  follows a favorless sit. The seed path was not the culprit; the
  opening pre-emption was.
- **Q1b WANT-RAISE: GO — 58/345 social sits raised ask_favor
  (16.8%); any-want sits 314/345; zero-raise seeds 0/5.** Kinds:
  forage_help 31, (no-kind) 19, food_share 5, heal_help 2,
  sick_help 1. (Kind tally is the r221-corrected per-sit instrument.)
- **Q2 SITTING CLOSES: 0/10 CUT — GO.** 2 engine-ended sittings
  WITH closing beats (Devon 101101, Monique 101103); 0 other
  no-close. The r224 F4a/F4b/F4c dry-line fixes hold in the wild
  (0 recurrences in their classes).
- **Q3:** recap paraphrase raw total 8 — see metric review for the
  double-count correction (distinct sittings 4/10; r221: 1/10).
  Canned lines (raw / distinct): walked-in 6/3, parting-plain
  tomorrow 1/1, see 0, care 0; pod-dream 0, pod-dream-open 0,
  recap-stitch 0, slope-reading 0, take-it 0, stew-bowl 0.
- **SPOTTER GO:** 72 total (9/4/21/20/18), 5/5 seeds > 0.
- **LADDER 4/5** (bar ≥3/4). Seed 101102 misses pace (Carol 4 XP)
  — the fat-village shape: plenty, little foraging pressure.
- **FASTER-ID GO:** 5/5 seeds, 198 benefit plays in 240 bump calls.
- **CODEX 116** plants identified at end across 5 seeds.
- **END BAR 7/7** broken-live forage closed ≤2 dawns (every one
  closed same-day). TRUST GUARD 0 drops. VILLAGE BAR 5/5 alive
  d40. JAM 0. STRANDED no-opportunity. TRAVEL no-opportunity.
  THREAD 1/1 paged closed ≤2 dawns (Ruby 101102). Water 0
  broken-live runs.

## The fix (landed this run — the blank, filled)
**STAGE-0 IS NOT LIVE.** A want that never surfaced (stage 0 — its
opener never ran because a resume/recall/case thread pre-empted the
opening) cannot be refused — the player never heard the ask.
- `src/js/convo-dialogue.js` (+22/−3): `dlg:cant` ("I can't right
  now", said to the resumed thread) treated an unvoiced want as live
  (`wantLive = stage < 3`), wrote a false 'deflected' memory ("you
  turned down their ask"), spoke the fresh want's deflectBeat, and
  closed the ask at stage 3 'deflected' — for a need the player was
  never told about. Now `wantLive` requires stage 1–2, and
  `convoWantEngage(vid, 'deflect')` runs only for a live want. The
  unvoiced want stays stage 0; the need persists for a proper ask
  next sitting.
- `src/js/conversation.js` (+7/−1): the generic turn handler's
  `deflect_q` branch had the same stage-blind arc (Stan d34 in the
  panel). Now it engages only when stage ≥ 1.
- Trace proof (from the panel records, re-inspected at adoption):
  Ruby d22/d31 and Aki d32 show `dlg:cant` at stage 0 followed by
  stage 3 on the next pick; Stan d34 shows `deflect_q` at stage 0
  followed by stage 3. All four had a settled/acknowledged favor in
  the ledger (the "Ruby shape"). Correction noted during proof:
  favorDeclined does NOT fire in this shape — ask_favor.resolve
  early-returns when no favor is attached, so no 3-day need block
  lands; the real harm is the false memory + false deflectBeat +
  the ask closed for the sitting.
- Proof test
  `scripts/test-journey-establishment-r225-stage0-cant-20261116.js`
  **16/16 PASS on the fix; 11 pass / 5 fail on the base** (stash
  round-trip at adoption — the test discriminates: D/D2/E/E2 fail
  on base with resolution=deflected). Positive control holds: a
  surfaced want still deflects on `dlg:cant`, and a real refusal
  still writes favorDeclined. Carried proof tests re-run green on
  the new base: r214 mood-goodbye 10/10, r139 spotter 35/35, r221
  want-raise 7/7.

## Q4 — census (plain words)
Five villages, 42 days, all alive at day 40 (5/5), waves 3, 4, 3, 3,
3. They are not the same village five times: seed 101103 is the fat
one (pantry 109,547 kcal, 12 of 12 alive, nobody died); seed 101104
is the thin one (pantry bled to 5,200 kcal and sat there, two dead,
yet it fought to wave 3 and ended with 10 alive); seed 101102 is
the one that lost its scholar (Keisha, lost in the wild d37) and
still reached wave 4 with 10 alive.
- **The dying:** 8 named villagers died across the five villages
  (of 162 death events — the rest are monsters the villagers
  killed, ~30 per village). Causes: monster 3 (Jesse d12, Farid
  d28, Cormac d15), ambush 2 (Wanjiru d8, Nino d9), wound that
  wouldn't close 2 (Nino d39, Alaba d28), lost in the wild 1 — the
  SCHOLAR (Keisha d37 on 101102; succession carried on, village
  ending 10 alive). Nobody starved. Seed 101104 ends with its
  pantry at 5,200 kcal — thin, but nobody died of hunger.
- **What they knew:** the scholar's plant codex holds 19–30 plants
  per village at end (116 total). Spotter knowledge concentrates
  in one forager per village (Antonio 9, Carol 4, Pasquale 21, Li
  20, Emilio 18 XP) — practice earns it, one person per village
  carries the specialty. Seed 101102's Carol (4 XP) is the thin
  end: that village had plenty and foraged least.
- **What they carried:** joint favors are real this panel (4–8
  commits per seed; 30 total). Pantries end 5,200–109,547 kcal
  (daily traces agree with the end snapshots this panel — no
  r221-style pantry disagreement).
- **Social life:** invitations are taken, bonds are proposed, wants
  are raised in 91% of social sits (314/345). The gap this run
  closes is the 19 favorless asks: a villager asking for help the
  game could not name — and, worse, the game recording the ask as
  refused when the player never heard it.
- **Anomaly (watch, not a verdict):** seed 101101 lost Morgan and
  Naran between d11 and d13 with NO death record of any kind —
  roster 11→9→8 while only Jesse's death is recorded d12. Morgan's
  favorless ask was d11, the day before vanishing. The other four
  seeds reconcile exactly (start − villager deaths = end roster).
  Either two deaths were recorded as monster kills, or two
  villagers departed unrecorded. Carried as a watch for the next
  establishment run, not a defect claim on one seed.

## People check — PASS (seed 101103, Aidan + Monique, read in full)
- **Aidan** (Chef): opens asking about taken kin and the pods — a
  real want (news about the taken). The player claims to know
  something, then says "I don't know anything. I'm sorry" — the
  wedge bot contradicting itself, not the game's fault. Aidan
  reacts with embarrassment, withdraws ("never mind, forget I said
  anything"), then the recap brings it back, the player changes
  subject and asks to know Aidan properly; Aidan agrees ("Twelve
  strangers is better than one stranger. Math."), then the hope
  line ("Someone has to stay hopeful, right? Might as well be me.
  I'm good at faking it till it's real.") — characterful — and a
  warm close ("Steady as she goes. See you at dinner." / "Same
  time tomorrow, maybe."). Meaning, coherence, consequence: yes.
  The taken-kin thread plants and owes rather than resolving.
- **Monique** (exterminator): opens resuming an unfinished
  confidence ("We never finished talking about what they
  confided"). The player invites her along; she accepts
  reluctantly ("...Fine. This had better be worth it."). Recap,
  subject change, gossip: she reports "Ines is back. Walked in
  like they'd never left." (the walked-in line, in context as a
  return report), then "Aidan headed out for water", ends it
  herself ("I've got things to do. People to avoid. You know."),
  the joke almost lands ("Almost smiles. Catches themself. '...
  That was almost funny.'"), engine ends with "This was good."
  They mean it. PASS. Nit, not a defect: "Aidan headed out for
  water" repeats within two turns (gossip answer, then react
  answer).

## Verdicts (leg: establishment, days 14–40)
- **Reachable:** YES. All five villages play the full 42 days;
  sittings, teaching, favors, contests, waves 3–4 all fire.
- **Fun:** YES. Conversations land, close, and resolve; the
  villages feel inhabited; the fat seed's plenty and the thin
  seed's hunger are the same game producing different villages.
- **Winnable:** ON TRACK for the leg. Villages survive, gear up,
  kill ~30 monsters each, bank spotter skill, and reach wave 4 on
  1/5 seeds. No village reached national/table — expected at day
  42. The binding watch is now closed: the favorless ask had a
  mechanism, a fix, and a proof — a villager asking for help will
  no longer be recorded as refused unheard.

## Metric review (§14)
- **Q1 FAVORLESS-ASK BAR WORKS.** It counts what the live game
  shows: 19/19 classified, one dominant mechanism, staged repro.
  The bar should stay as written for the next establishment run —
  and the next run's Q1 should be the re-measure: does the
  favorless rate fall on the fixed code, and do stage-0 wants now
  surface as proper asks next sitting.
- **Q1b bar WORKS.** 16.8% panel rate, no zero-raise seed. Keep
  as written.
- **Q2 bar WORKS on the new base.** 0/10 CUT with the r224
  dry-line fixes in the game. Keep as written.
- **Q3 — INSTRUMENT DOUBLE-COUNT (new finding, metric review):**
  the analyzer counts canned-line needles by raw `indexOf` over
  the whole convo txt file, but each sitting is printed TWICE in
  that file (turn log + FULL-TRANSCRIPT). Every needle occurrence
  scores 2×: recap-paraphrase raw 8 = 4 distinct sittings;
  walked-in raw 6 = 3 distinct sittings. The frozen metric as
  written counts raw occurrences, so its verdict stands as printed
  (8 ≥ 6 → a second paraphrase formulation is OWED, carried as
  debt for the next landing-leg run — Q3 is report-only, and this
  run's single blank is the favorless ask). But the honest read is
  the distinct rate: 4/10 sampled sittings use the paraphrase,
  up from r221's 1/10. Proposed revision for the NEXT run:
  count per-sitting presence (needle in a sitting counts once)
  and re-calibrate the threshold against the distinct history
  (r221: 1, r225: 4). Do NOT re-score this run's analyzer
  mid-run — the printed totals stay as the instrument printed
  them, with this correction beside them.
- **Scholar deaths 1/5 — inside the WATCH bar (≤2).** Fifth
  panel running at 2, 2, 2, 2, 1 — and all five panels' scholar
  deaths are "lost in the wild" (expedition risk, succession
  worked). The standing bar holds; no investigation triggered.
- **LADDER pace read, again:** the thin seed (101102, Carol 4 XP)
  misses pace because it had plenty and foraged least — spotter
  XP tracks foraging volume, not time (same mechanism as
  r210/r217/r221). Not a bar failure.
- **101101 roster anomaly (new watch):** two villagers vanish
  d12–13 with no death record. One seed, not systematic (other
  four seeds reconcile exactly). Next establishment run checks
  whether departures are ever logged — if not, the census needs a
  departure record before anyone claims the count is complete.
- **Death telemetry names:** the known limitation stands (most
  death events name monsters as "Someone"); the census can say how
  many monsters died, not who killed them. Not a finding.

## Telemetry check (§14)
`telemetry-check.js` vs `telemetry-baselines/establishment.json`
(metrics guardrails.deaths, guardrails.popAlive,
guardrails.pantryKcal, c3.starvationDeaths):
- LOUD: guardrails.deaths 604 → 0; guardrails.popAlive 178 → 0;
  guardrails.pantryKcal 1210411 → 0.
- Adjudicated: the KNOWN schema mismatch (prereg-predicted) —
  the driver never emits `guardrails.*` fields, so the checker
  reads missing paths as 0. Not a game change; the r225 panel's
  deaths / pantry are all in-band in the analyzer (5/5 alive
  d40, pantries 5,200–109,547, 0 starvation deaths).
  Baseline NOT rolled (prereg: never roll on a mismatch).

## Gate check
`node scripts/check.js --quick` (worktree, `--cacheDirectory=/tmp/jest-cache-playtest`):
Two full runs (see concurrency note below):
- Foreground run: **331 passed, 9 failed in 1204s**.
- Nohup run (full output in the gate log, the run of record):
  **330 passed, 10 failed in 1510s**.
Failure list (nohup run): 5 TIMEOUTS (exit null at 120s, check.js
kill — no assertion failure): living-garden, occupation-panels,
one-person-army, trust-observer-neutrality, capable-bot. 2
measurement staleness (proof-update + workflow — "Proof source
inputs are not current", same signature as r217/r221). 1 phone-frame
staleness (same signature as r217/r221). 1 ladder-bundle control
("200 monster turns WITHOUT delivery fire the ambient raid — fires
0", known substrate, same as r213/r217/r221). 1 cache-flags 0/4.
**0 attributable to this run** — this run's branch touches only
conversation.js + convo-dialogue.js (dialogue want/deflect guards),
and no failing test is a conversation test. Adjudication
(sequential `--only`, quiet box):
- cache-flags: standalone 3/4 on the fix branch; discriminating
  A/B — pristine base 3/4, fix branch 4/4. Load artifact per the
  r187 lesson (panel completion under spawn/timeout budget); the
  fix does not cause it.
- capable-bot standalone 1 passed (114s); occupation-panels
  standalone 1 passed (116s) — the timeouts were load.
- The other 3 timeouts share the identical exit-null-120s
  signature r221 verified passes standalone.
- Concurrency note (my error, recorded honestly): the nohup run
  and the foreground run overlapped ~12 min — I re-ran the gate
  after wrongly concluding the nohup run had died (I polled a pid
  from the exec wrapper's namespace, not the real node pid).
  Concurrent jest is the known phantom-failure condition; the two
  runs' differing timeout sets (foreground: capable-bot /
  synergy-stall / table-endings; nohup: the five above) are
  themselves load evidence. All adjudication above was sequential,
  no concurrency.
- Proof tests on the pre-rebase tip: r225 stage0-cant 16/16 (11/5
  on base), r214 mood-goodbye 10/10, r139 spotter 35/35, r221
  want-raise 7/7. (The r225 proof test is a standalone instrument
  proof like r214/r139's — not green-listed, same as its
  predecessors.) Re-run on the rebased tip at closeout; see below.

## Closeout
[CLOSEOUT]
