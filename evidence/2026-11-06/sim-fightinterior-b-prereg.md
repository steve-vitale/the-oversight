# Fight-interior recorder — per-turn damage trace for wave-4 TB fights — PRE-REGISTRATION (arm sim-fightinterior-b)

Run: fleshout-loop-b-20261106T1430Z (Loop B, second axis). Axis:
winnability chain (wild ally-join → wave-4 kills → veterans →
readiness-5 release → wave-5 facing → full seat). Committed BEFORE any
judged sim. DIAG ONLY: zero src/js, no policy built, no lever pilot
spent. The recorder is the deliverable; the next lever is sized, not
built, here.

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/MONSTER-WAVES.md` §§Wave 4/5:
  wave-4 bands damage 35–95, HP 850–1500, pierce 0.2–0.5; a 4–6 round
  fight for a godhood build (~220 dmg/round). Wave 5 demands 2 LIVING
  villagers with wave-4+ kills. No canon invented here.
- "Monster encounters are fought, not rolled" (CANON.md): the recorder
  reads the fight the engine actually fought — per-hit damage through
  `tbDamage`, the engine's single damage choke point — never a SAY
  line, never an outcome table.

## Prior evidence read (not re-run, not re-proved)

- `evidence/2026-11-06/sim-stageally-confirm-b.md` (+ prereg): NO-GO
  on a fresh band. Company reproduces (allies present in wave-4 TB
  fights 44%→73%, party-days ≥2 16→141) but kills reverse (9→3) and TB
  survival falls (13.5% armed vs 29.4% baseline). Named next blank:
  what happens INSIDE the fight once company is there — damage,
  staying, finishing. The rally's round-1 strike cost is a live
  suspect: `tbPlayerRally()` sets `p.acted = true` and calls
  `tbAfterPlayerAction()`, so a round-1 rally costs the scholar's
  round-1 strike (verified by reading `src/js/game.js`, not assumed).
- `evidence/2026-11-06/sim-finishprobe-a.md` (+ prereg): Stage 1
  DIAG-GO via P3 (TB kill rate 5.0%, 71% of TB losses end beast >50%
  HP, abilities used in 17.5% of TB fights); Stage 2 NO-GO by
  arithmetic — SOLO levers sized and rejected (generous upper bound
  flips at most 1/38 lost fights, ceiling 7.5% < 10% GO bar). With
  company the arithmetic differs (party damage) and is unmeasured —
  this arm measures it. The probe's ending taxonomy (kill / mFlee /
  vFlee / vDie / evade; TB kill-or-rout / flee / death) is reused;
  mFlee was 0/57 and is re-checked here.
- `evidence/2026-11-06/sim-winnability-round-0615.md`,
  `sim-winnability-round-0730.md`: the 0615Z/0730Z records naming the
  fight-interior blank; the 1130Z round record likewise.
- Stageally-confirm's unexplained case, carried as this arm's anomaly
  target: 53006 day 149, a SOLO 1-round Congregation kill, scholar
  ending at 76.4% HP — a wave-4 monster carries 850–1500 HP; one round
  ending it, alone, is unexplained by the fight row. The trace must
  either explain the shape (wounded entry, one-shot source) or flag
  an equivalent case on this band.

## The instrument (scripts only)

- `scripts/fightinterior-instrument-20261106.js` layers on the
  stageally instrument (tbFights rows, daily snapshots, kill log) and
  adds, for every wave-4+ TB fight: a HIT LOG (every `tbDamage` call —
  round, acting fighter, source key/label, target key/kind, damage
  requested vs actually applied, target HP after), TURN RECORDS
  (`tbVillagerTurn` / `tbMonsterTurn` wraps: damage dealt/taken per
  actor turn, sliced from the hit log), VERB RECORDS (the scholar's
  strike / wait / move / rally / warcry / shout / offer_food / flee /
  useAbility, with round, target, return value), and a FIGHT CLOSE
  (finishing classification from engine records: kill = won + a
  same-day wave-4 kill-log match whose killer fought in this fight;
  rout = won without one; scholar-death = lost; scholar-flee = fled;
  unfinished = still open at finalize; plus beast HP at end, rounds,
  scholar HP at end, and whether the scholar struck in the rally
  round). Direct HP writes that bypass `tbDamage` are NOT captured
  (caveat, recorded in the evidence file); no such path is known to
  carry fight damage on this engine.
- `scripts/fightinterior-driver-20261106.js` (baseline vs staged legs,
  identical seeds), `scripts/fightinterior-analyze-20261106.js`
  (classification completeness, damage/round by side, rally cost,
  Stage-2-style sizing of the next lever), proof
  `scripts/test-fightinterior-20261106.js` (fixture + live legs to
  /tmp: trace present on a real wave-4 fight, neutrality off-vs-on,
  determinism byte-identical).

## Question

Once company is in the wave-4 turn-based fight, what actually
happens inside it — how much damage does each side deal per round,
how long does the party survive, how does the fight end, and what
does the rally's round-1 strike cost? And: which lever does the
interior point at next, at what size, with what ceiling?

## Design (staged per docs/MEASUREMENT.md §§9–12, 14–15)

- Fresh band 51001–51008 (see seed-freshness record below), competent
  policy verbatim for the baseline, stageally-armed policy
  (`scripts/policies/competent-stageally-a.js`, unchanged) for the
  armed leg, 150d death-aware horizon (dead villages stop simulating,
  +10d tail max via runDays).
- Stage 0 smoke (2 seeds, 55002 baseline + staged, 90d, to /tmp, NOT
  judged): the recorder fires on a real wave-4 fight — traces exist,
  hits and turns recorded, endings classified, rally verbs traced.
  55002 reaches wave-4 TB fights by day 72 on the finishprobe band.
- Baseline: POLICY=baseline on 51001–51008. Armed: POLICY=staged on
  the SAME seeds (identical seeds, policy-side only). Corpus:
  `evidence/2026-11-06/perseed-fightinterior-b/` (16 files, 8 baseline
  + 8 staged).
- No confirm spend: this is a DIAG pilot (8 seeds). A confirm would
  need a lever to confirm; there is none until the sizing lands.

## Primary metric (binding — DIAG GO thresholds)

DIAG-GO iff BOTH hold on the judged corpus:
- D1 classification completeness: EVERY wave-4 TB fight row
  (stageally `tbFights`, wave ≥ 4) carries a trace with an ending in
  {kill, rout, scholar-death, scholar-flee, unfinished} — zero
  UNCLASSIFIED.
- D2 per-turn trace present for ≥ 90% of traced wave-4 TB fights:
  trace-present = at least one turn record OR one player verb
  recorded inside the fight (a fight with zero turns AND zero verbs
  means the wrappers never fired — an instrument failure, not a
  quiet fight).

DIAG-NO-GO otherwise (instrument failure, not a lever failure — the
kill taxonomy §14a does not apply to a diag instrument; a D1/D2 miss
is reported as SUBSTRATE-MISSING for the next run).

GUARDRAIL (binds the verdict — a failed guard is NO-GO even if the
primary holds):
- G-survival: armed median survival ≥ baseline median survival − 10d
  (same guard as the stageally confirm; the armed leg must not buy
  its trace at the village's expense).

## Secondary (reported, never re-scored)

- Damage/round by side (player side vs monster side, median + mean),
  both legs; damage/round by actor class (scholar / ally / monster).
- Rounds survived (median), beast HP at fight end (median frac),
  finishing classification counts per leg (kill / rout /
  scholar-death / scholar-flee / unfinished).
- Rally cost: round-1 player-side damage with vs without a rally;
  scholar strikes in the rally round (should be 0 — rally sets
  acted); rally fights' round-1 damage vs non-rally fights'.
- Verb mix per fight (strikes / waits / moves / abilities fired,
  abilities held-but-never-fired), both legs.
- Anomaly flags: any kill in ≤ 1 round, any single round dealing
  > 50% of entry HP — the 53006-day-149 shape, traced or flagged.
- Stage-2-style sizing of the next lever (finishprobe shape): for
  each LOST wave-4 TB fight, the generous upper bound "the party dealt
  its best observed damage-per-round on EVERY round it survived, plus
  one aimed strike at 2.5x that round's damage" — count flips, report
  the ceiling kill rate, and NAME the lever the interior points at
  (hold-ground / survival-time / damage-per-strike / entry-HP
  wounding / party damage), its size, and its ceiling vs the 10% GO
  bar. The sizing is the arm's second deliverable, not a build.
- Wall numbers every run: wins, national/global, table, wave 4–5
  unlocks, wave 4–5 faced, wave-4 kills, wave-5 kills,
  readiness-5-ready days, median survival.
- Sense-test: read the transcript of at least one armed-leg wave-4
  fight (fightLines/deathSays in the corpus) — judge meaning and
  coherence, never just counts. In particular: does a rallied fight
  read as a line holding, and does a 1-round kill (if one occurs)
  read as anything at all?

## Seed-freshness record (per local_seed_band_freshness skill)

Chosen band: 51001–51008.
- Whole-token grep of every candidate seed across ALL dated preregs
  (`evidence/*/sim-*-prereg.md`): 0 hits each. FRESH.
- Whole-token grep across all evidence `.md` files: 0 hits each.
  FRESH.
- Per-seed filename search (`find evidence -name '*s5100[1-8]*'`):
  0 files. FRESH.
- Full-content whole-token grep over `evidence/` (all files): 81
  files match, EVERY match verified by context as a data value, not
  a seed use — `pantryKcal: 51006` (the same class as the stageally
  prereg's `pantryKcalAtShare: 55001` / `pantryFreshAfter: 53004`)
  and float fragments (`freshDays: 8.55510028…`). A second pass
  grepping for `"seed": 5100[1-8]` / `seed=5100[1-8]` /
  `SEEDS=…5100[1-8]` across the same 81 files returned 0 seed-uses.
  FRESH.
- Bands rejected on the way here, recorded so the next worker does
  not repeat them: 54001–54008 (54001 was a real seed — tabledeed
  per-seed files `belongfeast-s54001.json` / `leadfeast-s54001.json`,
  2026-10-18); 56001–56008 and 57001–57016 (taken by sibling arm
  sim-killerwild-b, prereg 2026-11-06); 55001–55008 (finishprobe +
  stageally pilot); 53001–53008 (stageally confirm).
- No dedicated forbidden/contaminated band-list file exists in
  hidden_files; preregs naming "forbidden" are the Oct 26–27 era
  (other bands).

## Metric review (per §14; filled at verdict time, not now)

- Whether the D2 90% trace-present line is the right power line for
  a recorder (vs 100% — a fight the wrappers never fire for is an
  instrument miss, and the miss itself may be the finding).
- Whether the finishprobe ending taxonomy (kill vs rout by kill-log
  match) holds up once per-turn traces exist, or whether the trace
  shows a third won-shape (e.g. monster dismissed by a signature
  mechanic mid-fight).
- Whether the Stage-2-style sizing bound (best observed round ×
  survived rounds + one aimed strike) is still the honest ceiling
  once party damage is in the numerator, or whether it over-credits
  a party that never actually strikes together.
- Whether rally cost should be measured as round-1 damage foregone
  or as the whole fight's first-round survival (the rally may buy
  the line's survival with the scholar's strike).

## Balanced panel (§15)

Attempted, outcome recorded honestly: there is no Game-root change
to compare — baseline vs armed differ ONLY in the policy (competent
verbatim vs competent + staging + rally wrapper) on identical seeds
with an identical instrument. `scripts/balance-panel.js` takes no
corpus input (prior arms: `--help` errors, and a started `--out`
run does its own full panel and cannot compare competent vs
stageally on identical seeds). The matched-seed paired comparison
per the stageally-confirm precedent is used instead and the record
attached; no compare `.md` is fabricated.

## Telemetry deviation check

Attempted at verdict time; the tool has refused recorder corpora on
every prior killer-chain arm — the refusal, if it recurs, is the
result. The WINSEAT baseline's own regime note forbids pre-seat
comparisons — check it first.

## Proof (re-run, not rewritten)

`scripts/test-fightinterior-20261106.js` — fixture tests (trace
presence, damage-by-round sides split, rally-cost rows, Stage-2
sizing bound, classification completeness on a synthetic corpus)
plus live legs to /tmp (baseline + staged smoke on 55002/90d,
determinism byte-identical, neutrality off-vs-on). Run green on
this worktree before the judged run.

## What this arm is NOT claiming

- It does not claim a lever: no policy is built, no pilot is spent,
  no gate/price/deed change is proposed. The sizing names the next
  lever; the next run builds it.
- It does not claim the pair or the kill: the primary is recorder
  completeness, not kills. Kill numbers are reported as the interior
  they sit in, never as a GO.
- It does not claim field fights move: the trace covers turn-based
  fights only; field fights keep the finishprobe classification
  (control channel, unchanged).
- It does not claim the 53006-day-149 kill is explained unless an
  equivalent case occurs on this band with a full trace; if none
  occurs, the anomaly stays open and is reported as such.
- It does not re-judge the stageally confirm: the NO-GO stands as
  measured on its band; this arm measures the interior the NO-GO
  pointed at.
