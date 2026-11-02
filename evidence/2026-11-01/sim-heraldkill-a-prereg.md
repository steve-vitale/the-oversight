# sim-heraldkill-a — preregistration: DOES KILLING THE HERALD HELP OR HURT THE TITAN ROAD? (DIAG ONLY, zero src/js)

- Run: fleshout-loop-a-20261102T0045Z (Loop A, axis scale-onramp).
- Worker branch: sim-heraldkill-a. Arm: DIAG/instrument ONLY. Zero
  `src/js` changes, no gates, stages, deed bars, or win prices touched,
  nothing from the #1538 steve-call queue built. No `[needs-eyes]`
  (DIAG instrumentation only; nothing player-facing changes).
- This file was committed BEFORE any judged sim in this arm. Judged
  exactly against this header; a miss is NO-GO, never re-scored
  against a friendlier metric mid-run (MEASUREMENT.md §14). Every
  evidence file carries a "metric review" section.

## Question (from the 2315Z round, arm sim-heraldsteer-adopt-a)

Villagers now KILL the Herald — 5 times across the steered band
(95402 d169 villager app_mgpspj0m52; 95433 d133; 95438 d155
adaeze_nwosu; 95439 d147 miguel_santos; 95440 d143 ines_duarte;
each followed by a removal record and no re-placement — single
lair only) — and DIE to it twice (95423 d174 thabo_maseko, d175
app_mgpsphjz297, both on the Haven tile (4,4) while the Herald
sat there). Heraldarr2 saw zero Herald deaths either way. The
question is whether killing the Herald helps or hurts the titan
road. This arm answers it by re-running the kill seeds on
current master with capture ON and recording post-kill state per
dawn.

## Canon read before sims

- docs/CANON.md (manifest) + docs/MONSTER-WAVES.md (wave law;
  the Herald is a wave-6 herald / titan per MONSTER-WAVES.md:248
  context, not a wave monster) + docs/TABLE.md (the key's gate
  needs all three titans slain — TABLE.md:464,470: herald,
  nielsen and finale slain).
- docs/godpath/STEVE-ANSWERS.md (titan finale feeds the Table).
- NO canon doc covers Herald kill / re-placement / kill-gating.
  Governing sources are code reads in this tree (below) — nothing
  here invents canon.

## Code-read mechanism (this tree, before sims — the hypothesis)

- `src/js/titans.js` `titanMaybeOmen`: returns early if
  `st.slain[titanId]` OR if an omen already exists (`if (o)
  return`). A kill does not create a new omen, and the old omen
  blocks a fresh one.
- `src/js/titans.js` `titanAdvanceOmen`: places the titan
  (`titanPlace`) ONLY on the stage 1 → 2 transition. Once stage
  2, no re-placement path exists.
- `src/js/titans.js` `titanPlace` / `titanEscalate`: escalation
  fires while omen stage ≥ 2 AND not slain AND not resolved —
  with NO monster-presence check. A removed Herald's omen can
  therefore keep striking (pantry drain / allied trust −5)
  after the monster is gone. (Whether it does in live sims is
  a probe leg below, not assumed.)
- `src/js/game.js` `resolveWildMonsterEncounter`, `vKill`
  branch: calls `removeWorldMonster(m)` and records corpse /
  loot / trust / memory — it NEVER sets `state.titans.slain`,
  never resolves the omen, never says the titan FALLS. The
  coalition-slain path (`titanResolveFight` →
  `st.slain[titanId] = true`, "FALLS" line, relic) is reached
  only through a coalition fight, never through a field kill.
- `src/js/titans.js` `soundTitanCall`: has NO Herald-presence
  check and NO slain check on the call itself — it forms a
  muster from active links whenever called. `titanCommitOwn`
  gates only on omen stage ≥ 2 (which a killed Herald's omen
  still satisfies) and on slain (which a field kill never
  sets). `titanMusterReady` counts muster blades only
  (minAllies 10 for the Herald, `src/data/titans.json`).
- Predicted consequence, to be measured not assumed: after a
  field kill, the Herald is absent, the omen is frozen at
  stage 2, no re-placement fires, no slain credit lands, the
  call still forms a muster (and upkeep still charges
  1000 kcal/blade/day) against a monster that is not there,
  and no coalition fight can ever start (no monster tile to
  contact or march against). The road's first titan becomes
  un-fightable, un-re-summonable, and un-credited. If the
  re-run shows this on every kill seed, killing HURTS.

## Stack (named exactly — numbers NEVER pooled across stacks/bases)

Substrate: `scripts/policies/tableseat-nowait.js`
(`LEANLINKRESCUE=1`, `TABLESEATNOWAIT=1`) + recorders reused
UNMODIFIED: `fullseat-diag` (`FULLSEAT=1`), `wavegate-diag`
(`WAVEGATE=1`). Instrument: `scripts/sim-heraldarr2-a-sweep.js`
+ `scripts/sim-heraldarr2-a-lib.js` reused UNMODIFIED (capture
ON = `SIMHERALDARR2=1`). Same stack as the heraldsteer band.
Horizon: `DAYS=180`, death-aware (matching the heraldsteer
band).

## Seeds (exact literals)

- JUDGED pilot (6 seeds — they ARE the pilot; the kill
  phenomenon is rare, do not pad with unrelated seeds):
  95402, 95433, 95438, 95439, 95440 (kill seeds) + 95423
  (Herald-kills-villager seed; reverse direction, descriptive
  only, never counted in K).
- REFERENCE-ONLY re-runs (not judged, never pooled into the
  verdict counts, same stack/horizon): 95411, 95413 (non-kill
  contacted seeds from the same band), 95425 (no-contact
  wave-5 seed). They show what the road looks like on
  current master when the Herald is NOT killed.
- BASE NOTE (fixed now): this worktree's HEAD has moved
  since the heraldsteer corpus (Loop B 2330Z round evidence
  landed after it). The heraldsteer corpora below are
  therefore REFERENCE values on a prior base, not a
  seed-identical baseline. A kill seed that no longer kills
  on current master is reported as not-reproduced, not
  silently replaced. No old code is checked out to fake a
  baseline.

## Prior-corpus reference values (heraldsteer band, prior base — directional only)

| seed | lair | kill (day, killer) | removal | post-kill dawns: Herald present | omen at end | end (rank/wave/days) |
|---|---|---|---|---|---|---|
| 95402 | d83 (8,4) | d169 app_mgpspj0m52 | d169 (3,3) | 0 / 12 | 2 | survived, regional, w4, 181d |
| 95433 | d89 (7,4) | d133 app_mgpspiem554 | d133 (4,4) | 0 / 19 | 2 | village-lost, regional, w4, 152d |
| 95438 | d111 (7,4) | d155 adaeze_nwosu | d155 (4,4) | 0 / 26 | 2 | survived, regional, w4, 181d |
| 95439 | d123 (7,4) | d147 miguel_santos | d147 (4,4) | 0 / 27 | 2 | village-lost, global, w4, 174d |
| 95440 | d101 (7,4) | d143 ines_duarte | d143 (4,4) | 0 / 38 | 2 | survived, regional, w5, 181d |
| 95423 | d152 (7,4) | — (2 vDie d174/175) | none | Herald present at end (3,4) | 2 | survived, global, w4, 181d |
| 95411 | d84 (8,4) | none | none | Herald present at end (7,5) | 2 | village-lost, regional, w4, 168d |
| 95413 | d170 (7,4) | none | none | Herald present at end (4,4) | 2 | survived, global, w4, 181d |
| 95425 | d127 (7,3) | none, zero contacts | none | Herald present at end (8,5) | 2 | survived, regional, w5, 180d |

Prior-corpus pattern (all 5 kill seeds): exactly 1 lair, exactly
1 removal, 0 Herald-present dawns after the kill, omen frozen
at stage 2 through the end. No re-placement on any kill seed.

## Primary metric (one)

Per kill seed, post-kill titan-road state, from the judged
heraldarr2 corpus + the call probe (below):

1. Re-placement ever? = a NEW lair event (`lairs[]`) dated
   after the kill day, OR any dawn after the kill day with a
   Herald tile. Either one counts as re-placement.
2. Omen trajectory = omen stage at the kill dawn → omen stage
   at the end (from `dawns[].omenStage` + `endHerald.omenStage`).
   Frozen = unchanged from kill day to end.
3. Slain credit = probe snapshot of `state.titans.slain.herald`
   at end of the probe run (true/false), plus any "FALLS"
   line or relic record in the probe run. (The judged corpus
   carries no slain field; the probe is the only slain leg,
   and it is reported as a probe leg, never as corpus data.)
4. Call availability / meaningfulness (probe only, see below):
   at a post-kill state, does `soundTitanCall('herald')`
   return a muster, and does `titanCommitOwn('herald')`
   pass its gates — while no fight can start because the
   monster is absent on every post-kill dawn? "Available in
   code but meaningless in play" counts as ROAD STALLED,
   not road alive: meaningful = a coalition fight can
   actually start (monster present to contact/march against)
   OR slain credit advances the road. Availability-in-code
   alone is not meaningfulness.
5. Phantom escalation (probe only): escalation say lines
   ("fed in the night" / "struck … in the night") dated after
   the kill day in the probe run. Present/absent per seed,
   counted, never assumed from the code read.
6. End fields per seed (secondary, descriptive only, never
   verdict-driving): rank / wave / national / table / won /
   survival days / end reason — vs the reference-only
   re-runs, never pooled.

## The call probe (separate process, NOT the judged corpus)

New DIAG script `scripts/sim-heraldkill-a-probe.js` (same
substrate stack, no heraldarr2 capture): replay a kill seed
to kill-day + 3 dawns (kill day taken from the judged corpus,
never guessed), then snapshot BEFORE any probe call:
Herald presence, omen stage, `slain.herald`, muster state —
and verify the pre-call snapshot matches the judged corpus
(Herald absent, omen stage = kill-day stage; a mismatch
invalidates that seed's probe leg and is reported, not
smoothed). Then call `soundTitanCall('herald')` once and
record its return + say lines; then drive `titanCommitOwn`
through its two taps and record the result. Then stop — the
probe never continues the run after calling, so probe calls
cannot contaminate any judged timeline. The probe also wraps
`Game.say` to count post-kill escalation lines. Probe runs
are throwaway processes; their outputs live in
`evidence/2026-11-01/perseed-heraldkill-a/` alongside the
judged corpus, clearly named `*-probe.json`.

## Counting rules (fixed before sims)

- K = judged seeds (among the 6, excluding 95423's
  reverse-direction role) with ≥ 1 `vKill` villager contact
  against the Herald in the RE-RUN corpus. 95423 counts
  toward K only if it gains a vKill in the re-run (it had
  none before); its vDie role is descriptive either way.
- Re-placement is per seed (any new lair after kill day OR
  any Herald-present dawn after kill day). A seed with a
  removal but no later lair/dawn is re-placement = 0.
- Omen frozen = `omenStage` identical on every dawn from
  the kill day through the end (the prior-corpus pattern
  is frozen at 2; a seed frozen at a different stage still
  counts as frozen, with the stage named).
- Within-seed pre/post comparison is the comparison: each
  kill seed's post-kill trajectory is judged against its
  own pre-kill trajectory (contacts flowing, Herald
  present, omen advancing) on the same seed, same run.
  Cross-seed pooling is never used for the verdict; the
  reference-only re-runs are context, not a control group
  with a pooled rate.
- Panel (MEASUREMENT.md §15): NOT APPLICABLE to the headline
  verdict — the comparison is a DIAG census on a moved base
  (see BASE NOTE) plus within-seed pre/post trajectories;
  no same-base before/after panel exists and none is
  fabricated.

## Pre-registered verdict rule (judge exactly against this)

Let K = number of judged seeds with a vKill in the re-run.

- INSUFFICIENT-DATA: K = 0. The kill phenomenon did not
  reproduce on current master. Nothing is claimed about the
  road; the confirm is owed as a fresh kill screen (below),
  never reported as done.
- HURTS: K ≥ 1 AND on ALL K seeds: re-placement = 0 AND
  omen frozen kill-day → end AND probe slain = false with
  no FALLS/relic AND call meaningless (probe call forms a
  muster and/or commit passes its gates while the monster
  is absent on every post-kill dawn, so no fight can start).
  Phantom escalation, if observed, is supporting evidence
  for HURTS but is NOT required for it.
- HELPS: on ANY K seed: re-placement with road continuing
  (new lair AND new scholar contacts after re-placement)
  OR slain credited (probe slain = true, or a FALLS line /
  relic in the probe run) with the road advancing.
- NEUTRAL: re-placement = 0 on ALL K seeds BUT slain
  credited OR the omen resets (a fresh omen cycle becomes
  possible — new omen0 line + new placement) on ALL K
  seeds, so the road can proceed by another route.
- MIXED (no single-word override): HURTS conditions hold on
  some K seeds while HELPS/NEUTRAL conditions hold on
  others, or the probe legs disagree across K seeds. Report
  the per-seed table; do not force a pooled verdict.
- 95423 (reverse direction) never moves the verdict: it is
  reported descriptively (Herald present after its kills?
  omen trajectory? village outcome?).
- If killing HURTS (or MIXED with a stall on any seed),
  write the delivery spec for a future arm (re-placement
  rule, or kill-gating, whichever the data supports) — do
  NOT build the game change in this run.
- Village outcomes (rank/wave/national/table/won/survival)
  are secondary and descriptive only: with n ≤ 6 on a
  screened band, no outcome difference can drive the
  verdict, and none is claimed to.

## Confirm rule (fixed now)

A confirm runs ONLY if the pilot verdict fires cleanly
(HURTS, HELPS, or NEUTRAL with all K seeds agreeing) AND a
confirm band can be named. Named band, if it runs: fresh
substrate-only screen from 95441 upward (same qualifier
rule as the heraldsteer band: `gameDays > 120 AND won == 0`,
cap 72 scanned, up to 16 qualifiers), capture ON, same
stack/horizon/bars. Otherwise — mixed verdict, K = 0, or
no clean band — report the pilot verdict honestly with
n = 6 (or n = K) and the confirm as OWED, never as done.

## Guardrails / legs (judge exactly)

1. All 6 judged seeds complete: per-seed JSON present,
   capture errors 0, end fields present.
2. Instrument unmodified: `git status` shows no change to
   `scripts/sim-heraldarr2-a-sweep.js` or
   `scripts/sim-heraldarr2-a-lib.js`; substrate policies
   unmodified.
3. Determinism leg: one judged seed re-run to a scratch
   dir reproduces its judged per-seed JSON except for
   `anchorCommit` (any other field difference is a failure,
   reported as an instrument failure, not smoothed).
4. Proof tests green: `test-sim-heraldarr2-a.js`
   (synthetic + corpus legs on the judged corpus, with the
   corpus-size parameter — see tooling note) AND the new
   `test-sim-heraldkill-a.js` (synthetic + corpus legs
   reproducing the verdict from the corpus).
5. Sense-test: kill/death narration read for meaning (see
   below). A silent removal with no narration is a finding,
   reported in the evidence file.

## Tooling note (allowed fix, only this, only if safe)

The heraldarr2 test's hardcoded 8-seed leg
(`corpus-has-8-seeds`, line 122) fails by construction on a
16-seed confirm corpus (3036/3037 in the prior run).
Parameterize it to take the expected corpus size as an
optional 4th argv, defaulting to 8 — WITHOUT loosening any
assertion (default behavior identical; when passed, it
asserts exact equality to the passed count). If the change
proves risky in any way, leave the test untouched and
document it as owed. The parameterized leg is exercised by
running the test on this arm's 6-seed judged corpus with
expected = 6.

## Sense-test (SENSE-TESTING LAW)

Read the kill/death narration for the 6 seeds and say
whether the kill reads as a real event with consequences or
as a silent removal. NOTE (fixed now, a corpus gap): the
heraldarr2 corpus `sayLines` do NOT carry villager kill
narration — the vKill branch reports via `tell()` into
`scholar.awayNews`, which the instrument does not capture.
So the sense-test reads: (a) the probe's `awayNews`
snapshot at kill-day + 3 (kill line `⚔️ … The village
cheers.` / death line `💀 …` if still within the 8-entry
window, reported as present/absent, never reconstructed);
(b) scholar refusal lines around the kill in the judged
corpus (`sayLines` refusal needle); (c) post-kill dawn
silence — whether anything ever says the Herald is gone,
the omen is spent, or the road is closed (expected: nothing
says so, which is itself the sense finding if the road is
stalled). Judge meaning, coherence, relevance — never just
counts.

## Metric review (mandatory section in the evidence file)

Doubts go here, never into a re-score. Known in advance:
(a) The judged corpus carries no slain flag, no muster
state, and no awayNews — the probe legs cover those, and
probe legs are labeled as probe legs. (b) The base moved
since the heraldsteer corpus; non-reproduction is a
finding, not a failure to be repaired by seed shopping.
(c) n ≤ 6 on a screened band: the verdict is about the
mechanism (re-placement / omen / slain / call), not about
rates — no rate is claimed. (d) The probe's end-of-probe
call state (links/trust at kill+3) need not match a
player's call moment; availability is judged as
code-gate + monster-absence, not as a quota forecast.
(e) Escalation lines are not in the heraldarr2 NEEDLES, so
phantom escalation can only be observed via the probe.
