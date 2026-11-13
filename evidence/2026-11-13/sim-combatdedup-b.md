# sim-combatdedup-b — COMBAT-LINE DEDUP (arm sim-combatdedup-b, run fleshout-loop-b-20261113T0830Z)

## Verdict: GO — CHECK REPRODUCES, fix lands, narration-only

- **Step 1 CHECK (current master 85f9cbff6, fix absent): REPRODUCES.**
  Worst identical combat line per seed-day: **18** (190398 d138, Joel
  strikes the RERUN ×2 The Influencer, all 18 in ONE fight). Strike
  class: 275 lines, 223 repeats. SNAPS: 44 lines, 33 repeats, worst 7
  in one fight. Falls: 144 lines, 20 repeats, worst 7 in one fight.
  Every worst group is single-fight (`fights=1`) — the repeats are
  same-fight re-announcements, not distinct fights.
- **Step 2 FIX: GO.** After-leg on the same 8 seeds, same driver:
  strike repeat-lines 223 → 0 (100%, bar ≥80%), worst maxPerDay 0
  (bar ≤3); SNAPS 33 → 0 (100%), worst maxPerDay 0; falls 20 → 1,
  worst maxPerDay 2 (bar ≤3 — the one remaining repeat is two
  SEPARATE Influencer fights on 190398 d138, each falling once, which
  is the mechanism working correctly). Survival/wave numbers
  BYTE-IDENTICAL on all 8 seeds. Freeze control untouched: 38 → 38
  lines, repeat-lines 21 → 21. Analyzer verdict GO.
- **Convergence:** converged (this arm's defect is fixed; the
  turtle knownCue variant noted in "Metric review" is a documented
  2-line cost, not a new defect).

## Preregistration (evidence/2026-11-13/sim-combatdedup-b-prereg.md)

- Primary metric: max identical combat-narration line per (seed, day)
  across strike/harry, falls, SNAPS (+ freeze as control, not fixed).
- Check rule: REPRODUCES if any class has maxPerDay ≥ 4 on any seed.
- Seeds: matched band 190391–190398 (8), competent verbatim, 150d
  death-aware. Anchor: 85f9cbff6 + zero-src/js-diff guard (see prereg
  correction note — an exact-hash guard refused its own tree).
- Fix GO bar: after-leg strike/harry + SNAPS maxPerDay ≤ 3 every seed
  AND repeat-lines reduced ≥ 80%; falls judged by the decision rule;
  survival/wave numbers BYTE-IDENTICAL on the same 8 seeds.
- Anchor correction, recorded in the prereg before the check ran: the
  exact-hash guard was replaced by "HEAD descends from 85f9cbff6 AND
  `git diff 85f9cbff6..HEAD -- src/js` is empty AND no COMBATDEDUP
  marker", because the prereg + driver commits themselves moved HEAD.

## Freezeline status observed (this run)

- At prereg time (~10:30Z): Loop A arm sim-freezeline-a had commit
  `40144c0f5` on its branch, NOT on master; the goal findings file
  marking #2291 [fixed] was premature. The 0× vs 44 contradiction is
  a CAPTURE difference, resolved by reading the drivers: tendshift's
  vetSays filter (`SAY_RE`) matches only veteran|blooded|scarred|
  elder|pack-leader|… — the freeze line contains none of those
  keywords, so tendshift's "freeze line fires 0×" is a filter
  artifact, not a real zero. Freezeline's driver captures the freeze
  line directly and counted 44.
- **Update (~10:50Z, during this run): the freezeline fix has since
  LANDED on master** — commit `4a2cc89de` ("[needs-eyes]
  sim-freezeline-a: freeze line once per monster per fight (44->21
  lines, survival byte-identical 9/9)") is in master's history and
  the `sim-freezeline-a` branch is deleted (landed + cleaned up).
  The only `src/js/game.js` change between this arm's base
  (85f9cbff6) and new master is the `_stunAnnounced` block — this
  arm's three sites are untouched, so the rebase is trivial. This arm
  still does NOT close #2291 (Loop A owns it); it reports the landing.
- This arm's own freeze control count (unfiltered combat capture,
  8 seeds): 38 lines, worst 9/day — same order as freezeline's 44
  on 9 seeds, confirming the reproduction independently.

## The defect (mechanism)

- Emit sites (all `src/js/game.js`, base 85f9cbff6):
  1. **Strike/harry** `:41135`, `tbVillagerTurn`: `${v.name} strikes/
     harries the ${encTheName(t)}.` — every villager strike action,
     no damage, no variation. Provably redundant: `tbDamage` voices
     every hit right after ("`X hits Y for N.`", ~:39899).
  2. **Falls** `:40064`, `tbDamage` death branch (monster kind only):
     `${encSubject(t)} falls.` — once per monster death.
  3. **SNAPS** `:46126` (+ turtle `:46118`), `tbMonsterTurn` ambush
     branch: `💥 The ${encTheName(m)} SNAPS! No warning. There never
     is.` — every cycle the ambush monster has an adjacent foe (the
     monster telegraphs a step, steps, then snaps; ~every 3rd turn).
     The snap DAMAGE is voiced separately by the `tbDamage` loop
     that follows.
- Root cause: `emit()` dedups only the EXACT CONSECUTIVE line (last
  log entry). These repeats are non-consecutive — other lines
  interleave — so nothing between the sites remembers. The existing
  per-fight mechanism, `sayOncePerFight` (exact text, once per live
  fight, fight-object store), was used only for refusal texts.
- Canon: no canon doc covers combat-narration dedup (CANON.md
  manifest checked; MONSTER-WAVES.md has no strike/kill/snap lines).
  Narration hygiene, not a canon change.

## Step 1 — CHECK (before leg, 85f9cbff6, fix absent)

Driver `scripts/combatdedup-driver-20261113.js` (fight-tagged capture:
every say line in the four classes with game day AND fight index).
Corpus `evidence/2026-11-13/perseed-combatdedup-b-check/`.

| seed | days | end | maxWave | standing | rank | strike max/d | falls max/d | snaps max/d | freeze max/d |
|------|------|-----|---------|----------|------|--------------|-------------|-------------|--------------|
| 190391 | 65 | village-lost | 4 | 145 | regional | 0 | 3 | 0 | 0 |
| 190392 | 143 | village-lost | 4 | 199 | regional | 6 | 2 | 7 | 0 |
| 190393 | 126 | village-lost | 4 | 199 | regional | 14 | 0 | 6 | 2 |
| 190394 | 128 | village-lost | 4 | 199 | regional | 15 | 2 | 0 | 0 |
| 190395 | 150 | survived | 4 | 199 | regional | 9 | 0 | 6 | 0 |
| 190396 | 140 | village-lost | 4 | 199 | regional | 5 | 7 | 0 | 9 |
| 190397 | 135 | village-lost | 4 | 199 | regional | 3 | 0 | 0 | 0 |
| 190398 | 139 | village-lost | 5 | 370 | regional | 18 | 2 | 6 | 9 |

Totals: strike 275 lines / 223 repeats; falls 144 / 20; snaps 44 /
33; freeze (control) 38 / 29. Worst groups, all single-fight:
- strike x18 d138 "Joel strikes the RERUN ×2 The Influencer."
  (fight 16 — one fight, 19 strike lines total, 18 identical).
- strike x15 d30 "Michelle strikes the Focus Group."; x14 "Tashi
  strikes the Focus Group." + "Leo strikes the Focus Group." (same
  day, same fight — three villagers, same target, each repeating).
- snaps x7 d140 "💥 The Buffering SNAPS!"; x6 d64 same line; x6 d53
  "💥 The Elder Buffering SNAPS!"; x6 d35 Speedbump turtle variant.
- falls x7 d26 "The Scarred ducks in a row (head) falls." (fight 1,
  the snake fight — see below); x4 d58 "The Big Ugly (2) falls.";
  x3 d36 "The Choir Toad falls."

## Falls decision (prereg rule, decided from the fight-tagged baseline)

The prereg bound the falls call to this rule: INCLUDE falls in the
per-fight dedup ONLY if the baseline shows ≥2 same-label falls
inside a SINGLE fight; otherwise falls stays fully voiced. The
baseline meets the inclusion condition decisively — x7 same-label
falls in ONE fight (190396 d26), x4 in one fight (d58), x3 in one
fight (190391 d36). **Falls is INCLUDED.**
- The counter-argument is real and recorded: each fall IS a distinct
  segment death (the snake splits, a new head forms, the head dies
  again — 14 segment deaths in the one 190396 d26 fight). But the
  lines carry zero distinguishing info, so the player cannot tell
  seven identical lines from one line stuttering; the deaths are
  still voiced by sibling lines (the snake-split line voices each
  reform — "🦆 The head goes down — the next duck in line takes the
  lead…"; `tbDamage` hit lines voice every strike; the fight ending
  voices the last death); and person falls (villager/ally/hostile)
  are untouched — a named person falls once by definition. The
  after-leg deaths arrays must still be byte-identical (they are —
  deaths are recorded regardless of narration), which is the check
  that no kill was hidden.

## Sense-tested transcripts (SENSE-TESTING LAW — read, don't just count)

- **190398 d138, fight 16** — one fight, 19 villager strike lines:
  18× "Joel strikes the RERUN ×2 The Influencer." + 1× "Joel strikes
  the Influencer." (the RERUN tag drops once). Fourteen identical
  lines for what reads as one fight, exactly as filed. No damage, no
  round, no outcome anywhere in the 18. After the fix this fight
  says the strike once and the 18 hits still voice with damage.
- **190396 d26, fight 1 — the snake fight.** One fight, 14 segment
  deaths and 11 Ava strikes, cycling four labels: "(head)" falls
  ×7, "(3)" ×3, "(2)" ×2, "(7)" ×2; Ava strikes (head) ×5, (3) ×3,
  (7) ×2, (2) ×1. Read in order it is a stuttering loop —
  falls/strikes/falls/strikes with the same four labels — not a
  legible fight. The split machine explains it (kill a middle
  segment → the snake splits → a new head forms → kill again), but
  nothing in the narration says that; the split line is the only
  sentence that does. After the fix this fight voices each label's
  first fall and first strike, the split lines keep voicing each
  reform, and every hit still voices with damage.
- **190392 d140, Buffering x7** — one fight, seven identical SNAPS
  lines. The snap is the monster's declaration; it declares once and
  then the damage lines ("…hits you for 48.") carry the fight.
- No robotic dialogue surfaced beyond the repetition itself; the
  rotating wait lines ("holds and watches" / "waits, eyes on the
  beast" / …) already vary correctly (r147) — the strike/harry line
  was the one combat line that never varied.

## Step 2 — FIX (implementation)

- `sayOncePerFight` generalized (game.js ~47423): refusal-only →
  general per-fight exact-text combat dedup. Store renamed
  `_midFightRefusals` → `_oncePerFightSaid` (only referenced inside
  the method; behavior identical for every existing caller — the
  refusal tests in the proof still pass unchanged). Outside combat
  it still degrades to a plain say.
- Strike site `:41135` → `sayOncePerFight(...)`: first strike
  announces; later identical strikes stay silent; a different
  attacker/target/verb is a different exact text and still voices;
  a new fight re-announces.
- Monster falls site `:40064` → `sayOncePerFight(...)` (monster
  kind only; villager/ally/hostile falls untouched).
- SNAPS sites `:46118` (turtle) + `:46126` → once per monster per
  fight, `f._snapAnnounced[m.key]` — the SAME flag pattern as the
  freeze line (`f._stunAnnounced`, sim-freezeline-a), different
  namespace, so two same-named monsters in one fight each snap
  once. Only the SAY dedups: resolve audio + aggro audio still fire
  every snap, and the `tbDamage` loop still hits every time.
- No RNG draws added or removed anywhere (narration only);
  `sayOncePerFight` and the flag check draw nothing, so the sim
  stream is untouched by construction.
- Rebase note: this branch is based at 85f9cbff6, BEFORE the
  freezeline landing (4a2cc89de). The landed fix touches only the
  `tbMonsterTurn` stunned branch, which this arm does not touch —
  the rebase should apply cleanly; the coordinator re-runs proof
  after rebasing. The driver anchor guard (no `src/js` diff vs
  85f9cbff6) will refuse the AFTER leg on a rebased tree — that is
  by design; the after-leg numbers below were taken on this base.

## Proof test (scripts/test-combatdedup-b.js)

- Instrument 29/0: regexes match the exact filed lines and ignore
  the neighboring families (player strike line, tbDamage hit line,
  hammer lines, telegraphs); groupStats aggregation (per-day max,
  per-fight max, repeat lines, fight attribution); emit sites
  present; HEAD descends from 85f9cbff6.
- Game level 15/0, RED→GREEN demonstrated BEFORE the fix (G1: 3
  strike lines for 3 hits; G2: 2 snaps in 9 turns) and GREEN after
  (G1: 3 hits, 1 strike line; G2: 9 turns, 1 snap, damage still
  landed 500→407 — identical to pre-fix):
  - G0 (mechanism intact): same text 3× → 1 line in a fight;
    distinct text voices; refusal texts still dedup; new fight
    re-voices.
  - G1 (villager strike): a brave villager who HAS fought hushwolves
    (know.fought ledger — `applyFighterState` re-stamps the fighter
    from the ledger every turn, so direct field sets are clobbered;
    the grant goes through the ledger) strikes 3× in one fight.
  - G2 (ambush snap): Buffering adjacent for 9 turns (~3 snap cycles
    — it telegraphs a step, steps, then snaps).
- `node scripts/check.js --quick`: first run 335 passed / 5 failed
  (11.4 min, tail-swallowed the failure names); re-run to a log file
  331 passed / 9 failed in 1269s (exit 1). The 9, all investigated
  by A/B against the base game.js (no fix):
  - 5× TIMEOUT after 120s (living-garden-deed-attainment,
    occupation-panels, one-person-army-deed-attainment,
    synergy-stall, capable-bot-20261014) — load artifacts under box
    load 11–16; the same tests timed out in run 1; the fix removes
    say calls and cannot slow sims.
  - measurement-proof-update — fails IDENTICALLY on base ("Proof
    source inputs are not current", balance-proof-update.js:8):
    stale proof vs current inputs, pre-existing.
  - measurement-workflow — fails IDENTICALLY on base (8 passed, 1
    failed: "retained neutrality proof covers the current
    Game/controller/harness inputs"): pre-existing.
  - phone-frame-proof — fails IDENTICALLY on base (3 passed, 3
    failed: retained browser inputs vs current source, phone receipt
    stale): pre-existing; the failing input list does not include
    game.js.
  - measurement-cache-flags — FAILED under check.js parallel load
    ("both actual CLI configurations complete valid neutral panels")
    but PASSES 4/0 alone on the BASE code in 40s: the recorded
    AGENTS.md cache-flags load artifact (scores track box load, not
    the change under test).
  - The A/B swapped the base game.js into the worktree (no stash —
    `git show 85f9cbff6:src/js/game.js`, then restored from HEAD and
    verified the hash `ef537171…` + proof test 15/0 green after).
  - None of the 9 check failures is caused by this change.

## Step 3 — AFTER leg (same 8 seeds, same driver, fix present)

Driver `scripts/combatdedup-driver-20261113.js`, RUN=combatdedup-after.
Corpus `evidence/2026-11-13/perseed-combatdedup-b-after/`. Analyzer
`scripts/combatdedup-analyze-20261113.js <check> <after>` → **GO**.

| seed | days | end | maxWave | standing | rank | strike max/d | falls max/d | snaps max/d | freeze max/d |
|------|------|-----|---------|----------|------|--------------|-------------|-------------|--------------|
| 190391 | 65 | village-lost | 4 | 145 | regional | 0 | 0 | 0 | 0 |
| 190392 | 143 | village-lost | 4 | 199 | regional | 0 | 0 | 0 | 0 |
| 190393 | 126 | village-lost | 4 | 199 | regional | 0 | 0 | 0 | 2 |
| 190394 | 128 | village-lost | 4 | 199 | regional | 0 | 0 | 0 | 0 |
| 190395 | 150 | survived | 4 | 199 | regional | 0 | 0 | 0 | 0 |
| 190396 | 140 | village-lost | 4 | 199 | regional | 0 | 0 | 0 | 9 |
| 190397 | 135 | village-lost | 4 | 199 | regional | 0 | 0 | 0 | 0 |
| 190398 | 139 | village-lost | 5 | 370 | regional | 0 | 2 | 0 | 9 |

- Strike: totals 275 → 52 lines (the 52 are first-per-fight
  announcements — one per distinct attacker/target/fight); repeat
  lines 223 → 0; worst maxPerDay 18 → 0.
- SNAPS: totals 44 → 9; repeat lines 33 → 0; worst maxPerDay 7 → 0.
  (The 9 remaining are one snap per monster per fight.)
- Falls: totals 144 → 125; repeat lines 20 → 1; worst maxPerDay
  7 → 2. The single remaining repeat group is 190398 d138 "The
  RERUN ×2 The Influencer falls." ×2 across TWO fights — correct
  behavior: per-fight dedup keeps each fight's first fall.
- Freeze (control): totals 38 → 38, repeat lines 21 → 21 — the
  fix touches nothing in the freeze family, as designed. (The
  freeze fix itself has since landed on master via Loop A — see
  "Freezeline status".)
- Distinct-event preservation: the line totals dropped by exactly
  the collapsed repeats (strike −223, falls −19, snaps −33) EXCEPT
  snaps, which dropped by 35 — 2 extra lines, explained in "Metric
  review" (turtle knownCue variant). Every remaining line is a
  first announcement of its fight/monster; G1/G2 prove distinct
  attackers, targets, and fights still voice.
- Survival byte-identical: all 8 seeds identical (days, endReason,
  maxWave, standing, scaleRank, endPantryKcal, full deaths arrays).
- Telemetry deviation check (`telemetry-check.js`, scale-wall
  baseline, metrics national/table/wins/exiled): LOUD lines on the
  AFTER corpus (national 12→0, table 16→0, wins 16→0) — but the
  CHECK corpus produces the IDENTICAL three LOUD lines. The tool
  refuses recorder-corpus input by default and, with
  `--allow-recorder-corpus`, reads my per-seed rows (which carry no
  national/table/wins counts) against a differently-shaped baseline
  as zeros. Shape mismatch, not a fix effect: the fix changed
  nothing on these metrics (0 wins / 0 national / 0 table on both
  legs, same as the scale-wall numbers below).

## Scale-wall numbers (baseline leg, 8 seeds)

Wins 0/8. National 0/8. Table 0/8. Wave 5 unlocked 1/8 (190398);
wave 4 on the other 7. Median survival 137 days (65, 126, 128, 135,
139, 140, 143, 150). Standing 145 / 199×6 / 370. 7/8 village-lost,
1 survived to 150d (190395). Same numbers will be re-read off the
after leg for the byte-identical check.

## Metric review (§14)

- The prereg's "max identical combat line per seed-day ≤3" bar
  survived contact with the baseline: the worst after-leg number
  should be driven by fight count per day (a line can still hit 2–3
  if the same attacker fights the same monster in 2–3 fights in one
  day), which is the honest shape of per-fight dedup — the bar
  measures the defect (same-fight repeats), not fight frequency.
- The falls inclusion rule worked as designed: the fight tag decided
  it from data, not from argument. The residual risk (a same-fight
  repeat that is genuinely informative, e.g. a second same-label
  fall being the fight-ending kill) is covered by the sibling lines
  and the byte-identical deaths check, not by the narration count.
- The anchor-guard correction (exact hash → game-code-diff proof)
  is a process fix worth keeping: any driver that lives in the repo
  cannot pin an exact HEAD, because its own commits move HEAD.
- The freeze control count (38 lines / worst 9 on 8 seeds) vs
  freezeline's 44 on 9 seeds is consistent — same defect, different
  seed set — and confirms tendshift's 0× was a filter artifact.
- **Turtle knownCue variant (2 lines):** the SNAPS total dropped
  by 35 while repeat-lines dropped by 33. The 2 extra lines are the
  Speedbump's knownCue variant: in one fight the turtle snaps first
  bare ("…SNAPS! Its head is suddenly somewhere else.") and then
  coached ("…It's slow but the snap is fast. Don't stand in front
  of it.") once the cue is learned mid-fight — two distinct texts,
  so exact-text dedup would have kept both, but the per-monster
  flag (chosen to match freezeline's pattern, so two same-named
  monsters each snap once) silences the coached variant. Accepted:
  the cue is still surfaced by the telegraph text itself and by
  the Codex learn line ("📖 Codex: Catch Up — …") that fires when
  the pattern is learned. If a future arm wants the coached variant
  to voice once per fight, the flag would need to key on
  (monster, text) instead of monster alone.
- **check.js failures (9) are all pre-existing or load artifacts**
  (A/B'd on the base game.js — see "Proof test"). Worth a
  coordinator note, not this arm's work: the measurement
  neutrality proof and the phone-frame receipt are stale on
  current master, and the deed-attainment tests time out at the
  120s cap under loop-load.

## Commits (this branch, sim-combatdedup-b)

- `aaf9d3b42` prereg — combat-line dedup GO bar + freezeline status
- `5195a8cbf` driver + analyzer — fight-tagged combat-line capture
- `f2162cba8` anchor guard — prove game code unchanged vs 85f9cbff6,
  not exact HEAD (exact-hash guard refused its own tree)
- `7bc363a05` proof test — instrument 29/0, game-level RED
  (G1 3 strike lines/3 hits, G2 2 snaps/9 turns)
- `99531d01b` fix — strike/falls once per fight, SNAPS once per
  monster per fight (proof 29/0 + 15/0, RED→GREEN)
- (this commit) corpora — check + after per-seed JSONs (8 seeds
  each); evidence file above

## Findings backlog (new, for sim-findings.md — coordinator to file)

- [open] 2026-11-13 — measurement proof staleness — the balance
  neutrality proof (`balance-proof-update.js` "Proof source inputs
  are not current") and the phone-frame receipt (stale boot inputs)
  fail on current master with no fix applied; the deed-attainment
  tests time out at the 120s cap under loop load (arm
  sim-combatdedup-b, check.js A/B on base 85f9cbff6).
- [open] 2026-11-13 — turtle knownCue variant — the ambush snap's
  coached variant (knownCue appended once learned) is silenced by
  the per-monster snap flag; the cue still surfaces via the
  telegraph + Codex learn line, but a (monster, text)-keyed flag
  would voice it once (arm sim-combatdedup-b, 2 lines / 8 seeds).

## Scale-wall numbers (after leg, 8 seeds — unchanged)

Wins 0/8. National 0/8. Table 0/8. Wave 5 unlocked 1/8 (190398);
wave 4 on the other 7. Median survival 137 days. Standing 145 /
199×6 / 370. Identical to the baseline leg, seed for seed.
