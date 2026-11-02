# sim-heraldkill-a — KILLING THE HERALD HURTS THE TITAN ROAD (DIAG ONLY, zero src/js)

- Run: fleshout-loop-a-20261102T0045Z (Loop A, axis scale-onramp).
- Arm: DIAG/instrument ONLY. Zero `src/js` changes, no gates,
  stages, deed bars, or win prices touched, nothing from the
  #1538 steve-call queue built. No `[needs-eyes]` (DIAG only).
- Verdict: **HURTS — killing the Herald hurts the titan road,
  unanimously on all 5 kill seeds.** After a villager field
  kill, the Herald is never replaced, its omen freezes at
  stage 2, no slain credit lands, the call still forms a
  muster (and Haven still commits blades) against a monster
  that is not there, and the dead Herald keeps striking —
  26 phantom escalation lines across the 5 seeds, eating
  pantry kcal and cutting allied trust for a fight that can
  never start. The road's first titan becomes un-fightable,
  un-re-summonable, and un-credited, while still charging
  its costs.
- Stack (named exactly; numbers NEVER pooled across
  stacks/bases): substrate `scripts/policies/tableseat-nowait.js`
  (`LEANLINKRESCUE=1`, `TABLESEATNOWAIT=1`) + recorders reused
  UNMODIFIED: `fullseat-diag` (`FULLSEAT=1`), `wavegate-diag`
  (`WAVEGATE=1`). Instrument:
  `scripts/sim-heraldarr2-a-sweep.js` +
  `scripts/sim-heraldarr2-a-lib.js` reused UNMODIFIED (capture
  ON = `SIMHERALDARR2=1`). Horizon: `DAYS=180`, death-aware.
  Probe: new DIAG `scripts/sim-heraldkill-a-probe.js` (same
  substrate, no heraldarr2 capture; throwaway processes that
  never continue a run after calling — probe calls cannot
  contaminate any judged timeline).
- Preregistration: `evidence/2026-11-01/sim-heraldkill-a-prereg.md`
  (commit `d2302085a`, BEFORE any judged sim). Judged exactly
  against that header; no bar moved after seeing results.
- Corpus (capture ON): judged
  `evidence/2026-11-01/perseed-heraldkill-a/judged/` (6 JSONs),
  reference-only
  `evidence/2026-11-01/perseed-heraldkill-a/reference/` (3 JSONs),
  probes `evidence/2026-11-01/perseed-heraldkill-a/probe/`
  (11 JSONs: early+full per kill seed, early for 95423).
  Analyses: `sim-heraldkill-a-analysis.json` (judged),
  `sim-heraldkill-a-reference-analysis.json` (reference),
  `sim-heraldkill-a-heraldarr2-analysis.json` (heraldarr2-format,
  for the reused test's corpus legs). Per-seed `.err` progress
  files removed, not committed (prior-arm convention: JSONs only).
- Reproduction note (stronger than expected): the kill
  phenomenon reproduced EXACTLY on current master on all 9
  re-run seeds — same kill days, same killers, same lairs,
  same removals, same end fields as the heraldsteer corpus.
  The moved-base worry in the prereg did not materialize for
  these seeds. Judged anchor: `dd558cd3` (this arm's tooling
  commit); the determinism re-run of 95402 reproduces its
  judged JSON byte-identically, anchor included.

## The answer in one paragraph

A villager can now do what the whole coalition cannot: kill
the Herald in the field. The game does not know what to do
with that. The field-kill path (`resolveWildMonsterEncounter`,
`vKill` branch) removes the monster and records corpse, loot,
trust, and memory — but never sets the titan slain flag,
never resolves the omen, never speaks the FALLS line. So the
Herald's omen sits at stage 2 forever: the omen system
refuses a fresh omen while one exists, and placement only
fires on the stage 1 → 2 transition, so nothing ever comes
back. The scholar's last refusal before each kill still says
"muster 10 allied blades (you have 0)" — and after the kill
there is nothing left to muster against, yet the call still
takes your allies' names and Haven still sends its own
blades, and every five days the dead Herald still "feeds in
the night" or "strikes" an ally. Killing the Herald does not
advance the road past its first titan. It bricks the road
and keeps billing for it.

## Per-seed judged results (K = 5)

| seed | kill (day, killer) | lair → removal | post-kill dawns: Herald present | omen kill → end | re-placement | end (rank/wave/days) |
|---|---|---|---|---|---|---|
| 95402 | d169 app_mgpspj0m52 | d83 (8,4) → d169 (3,3) | 0 / 12 | 2 → 2 frozen | NO | survived, regional, w4, 181d |
| 95433 | d133 app_mgpspiem554 | d89 (7,4) → d133 (4,4) | 0 / 19 | 2 → 2 frozen | NO | village-lost, regional, w4, 152d |
| 95438 | d155 adaeze_nwosu | d111 (7,4) → d155 (4,4) | 0 / 26 | 2 → 2 frozen | NO | survived, regional, w4, 181d |
| 95439 | d147 miguel_santos | d123 (7,4) → d147 (4,4) | 0 / 27 | 2 → 2 frozen | NO | village-lost, global, w4, 174d |
| 95440 | d143 ines_duarte | d101 (7,4) → d143 (4,4) | 0 / 38 | 2 → 2 frozen | NO | survived, regional, w5, 181d |

Every kill seed: exactly 1 lair, exactly 1 removal, 0
Herald-present dawns after the kill, 0 scholar contacts and
0 villager contacts after the kill, 0 Herald-named say lines
after the kill. End fields: national 2/5 on kill seeds
(95439 global; 95402/95433/95438/95440 regional), table 2/5
(95402, 95438), won 0/5 — descriptive only, never
verdict-driving (see prereg).

Reverse direction (descriptive only, never in K): 95423
reproduces exactly — Herald kills thabo_maseko d174 and
app_mgpsphjz297 d175 on the Haven tile, no removal, Herald
present at end (3,4), omen 2, survived, global, w4, 181d.
When the Herald kills villagers, the road stays intact
(monster present, omen live). The asymmetry is the finding:
death in one direction leaves a live road; death in the
other bricks it.

Reference-only re-runs (same stack/horizon, NOT judged,
never pooled): 95411 (no kill, Herald present at end (7,5),
village-lost, regional, w4, 168d), 95413 (no kill, Herald
present at end (4,4), survived, global, w4, 181d), 95425
(no kill, zero contacts, Herald present at end (8,5),
survived, regional, w5, 180d). All three reproduce their
heraldsteer-corpus end states exactly. On non-kill seeds
the road stays live to the end; on kill seeds it stops at
the kill day.

## Probe results (per kill seed — the call / slain / ghost legs)

Probe snapshots BEFORE any probe call, early (kill+3) and
full (day 181/152): Herald absent, omen stage 2, omen
unresolved, `slain.herald` false, no muster standing (the
policy never sounds the call in judged runs — every scholar
contact is a refusal at muster 0 < 10). Early snapshots
match the judged corpus on every kill seed (validator leg).

| seed | phantom Herald escalation after kill | call returns | commit (tap1 → tap2) | slain after probe |
|---|---|---|---|---|
| 95402 | 2 lines, d173 + d178, both "fed in the night" (2,400 + 0 kcal) | muster allies 4 | confirm → muster (4 allies + 3 Haven = 7, needs 10) | false |
| 95433 | 4 lines, d134–149 every 5d: 2 feeds (1,000 + 0 kcal) + 2 strikes (Stonebridge trust −5 ×2) | muster allies 2 | confirm → muster (2 + 1 = 3, needs 10) | false |
| 95438 | 6 Herald lines, d156–181 every 5d: 3 feeds (0 kcal) + 3 strikes (trust −5 ×3) — interleaved with genuine Nielsen strikes (Nielsen is alive; its lines are real, the Herald's are not) | muster allies 0 (both links refuse) | confirm → muster (0 + 3 = 3, needs 10) | false |
| 95439 | 6 lines, d148–173 every 5d: 6 strikes (Stonebridge/Thornfield/Emberhold trust −5 ×6), 0 feeds | muster allies 4 | null → null, "No one is free to march" — NOT slain-gated, NOT stage-gated (the line is "THE HERALD waits": the stage-2 gate passed, the volunteer pool was empty) | false |
| 95440 | 8 lines, d146–181 every 5d: 3 feeds (0 kcal) + 5 strikes (trust −5 ×5) | muster allies 2 | confirm → muster (2 + 1 = 3, needs 10) | false |

Totals: 26 phantom Herald escalation lines (10 pantry feeds,
16 allied trust strikes = 80 trust-points of ghost damage)
across 5 seeds, all dated after the kill day, all on the
5-day escalation clock. The call forms a muster on 5/5
seeds and Haven commits blades on 4/5 (95439's pool was
empty, not gated) — against a monster absent on every
post-kill dawn. A muster formed this way would charge
1000 kcal/blade/day in upkeep for a fight that cannot
start: there is no monster tile to contact or march
against, and the hard gate's "muster 10" was never reached
on any probe (7, 3, 3, 4, 3 blades). No FALLS line, no
relic, no slain flag on any probe — the coalition-slain
path (`titanResolveFight`) never runs for a field kill.

Road-context note (not a rescue): 95438's NEXT titan still
arrives — Nielsen's lair is found d157, two days after the
Herald's kill, and Nielsen's escalation lines are genuine.
The road's later titans are unaffected. What is bricked is
specifically the Herald slot — and the Table's key gate
needs herald AND nielsen AND finale slain (TABLE.md:464,
470). A Herald that is dead-but-not-slain can never satisfy
its leg of the key.

## Pre-registered verdict rule (judged exactly as written)

- K = 5 (95402, 95433, 95438, 95439, 95440 all re-kill).
- HURTS requires, on ALL K seeds: re-placement = 0 (TRUE
  5/5) AND omen frozen kill-day → end (TRUE 5/5, all at
  stage 2) AND probe slain = false with no FALLS/relic
  (TRUE 5/5) AND call meaningless — call forms a muster
  and/or commit passes its gates while the monster is
  absent on every post-kill dawn (TRUE 5/5: call forms a
  muster on all 5; commit fully passes on 4, gate-passes
  with an empty pool on 95439). Phantom escalation is
  supporting, not required — and it is present on 5/5
  anyway (26 lines).
- HELPS requires re-placement with road continuing OR
  slain credited on ANY seed: neither occurs on any seed.
- NEUTRAL requires slain credited OR omen reset on ALL
  seeds: neither occurs on any seed.
- No MIXED split: all 5 seeds agree on every verdict leg.
- **Verdict: HURTS.** The kill phenomenon is real (5/5
  reproduction), the stall is total (5/5 on every leg),
  and the mechanism is the code path itself, not noise.

## SENSE-TESTING: the kill reads as a silent removal

Pre-kill, the Herald is LOUD: refusal lines ("muster 10
allied blades (you have 0)"), raid lines naming it, nightly
gorges with real kcal. Post-kill, on all 5 seeds:

- 0 Herald-named say lines after the kill day (the say
  channel goes quiet about the Herald entirely; later lines
  are other monsters' raids and gorges).
- 0 Herald contacts of either channel after the kill day.
- Kill narration (the `vKill` branch's `tell()` line:
  "⚔️ … The village cheers.") is spoken into
  `scholar.awayNews` at kill time by code — but at
  kill-day + 3 it is present on 0/5 seeds. 95402/95433/
  95440 show empty awayNews; 95438's window holds a
  Redactor mFlee line ("Adaeze stood down the Redactor…");
  95439's holds an Eater-killed-Miguel death line. Other
  fights' news survives; the Herald kill's does not.
- The reverse direction is silent the same way: 95423's
  death lines are absent from awayNews at death-day + 3.
- Nothing ever says the Herald is gone, the omen is spent,
  or the road is closed. The player is left with a frozen
  omen ("Sound the call" still reads as the standing
  instruction), a callable muster, and a ghost that eats
  and strikes — with no line anywhere explaining that the
  titan they killed is neither slain nor coming back.

This is not a "numbers" verdict. A player who watches a
villager kill the Herald, then sounds the call, commits
Haven's blades, and keeps losing stores to "THE HERALD fed
in the night" for a corpse, is being lied to by every
channel at once. The kill is the biggest event on these
seeds and the quietest.

## Delivery spec for a future arm (NOT built here — DIAG scope)

The data supports a two-layer fix; the layers must not be
confused, because one is a bug and the other is a design call.

Layer 1 — stop the ghost (pure correctness, no design call):
(a) `titanEscalate` must check monster presence: an omen
whose monster is removed must not feed from the pantry or
strike allies. The escalation lines are false statements
about a monster that does not exist. (b) `soundTitanCall`
and `titanCommitOwn` must check monster presence: a call
against an absent titan should say "there is nothing
located to march against" (the line `titanCommitOwn`
already uses for stage < 2) instead of forming a muster
and charging upkeep. Either layer-1 fix alone stops active
harm, but neither un-bricks the road.

Layer 2 — decide what a field kill MEANS (design call, for
Steve/coordinator — do not build until ruled):
(A) Re-placement rule: a field kill clears the omen (stage
reset, escalation silenced), so `titanMaybeOmen` can fire
again and a new Herald can be placed — the road restarts,
at the cost of re-earning the titan. (B) Kill-gating:
villager field kills cannot kill a titan at all (the
Herald flees, or the fight refuses at the titan gate the
way scholar contact does) — the titan can only fall to
the coalition, preserving "no solo titans" and the key's
slain accounting. (C) Slain credit: a field kill counts
as slain (FALLS line, relic, key leg) — the simplest road
repair, but it lets one villager bypass the coalition
fight the titan class is built around, so it needs
Steve's ruling, not a worker's default. The arm's
recommendation: layer 1 always; layer 2 as (A) unless
Steve rules (B) or (C) — (A) keeps the road playable
without rewriting what a titan is.

## Confirm (owed, not done — band named)

The pilot verdict fires cleanly (HURTS, all K seeds agree)
and the confirm band IS nameable per the prereg: fresh
substrate-only screen from 95441 upward, same qualifier
rule (`gameDays > 120 AND won == 0`), cap 72 scanned, up
to 16 qualifiers, capture ON, same stack/horizon/bars.
It is NOT run in this run: a 72-seed screen plus capture
runs plus probes costs roughly 2 hours against an hourly
loop, and the pilot is already unanimous 5/5 with a
code-read mechanism and probe confirmation — the
confirm's job would be to check generalization beyond
these 5 seeds, not to re-decide HURTS. Reported honestly
as OWED with the band named above, never as done.

## Wall numbers (bands kept separate, never pooled)

- Judged band (6 screened seeds): won 0/6, national 2/6
  (95423, 95439 at global), table 2/6 (95402, 95438),
  wave-4 6/6, wave-5 1/6 (95440), median survival 181d,
  max 181d. Full seat: 0. Wave-5 fight chain completed: 0
  (no wave-5 fight instrument; 95440 pairs wave-5 reach
  with a Herald killed d143 — no wave-5 fight recorded).
- Reference band (3 seeds): won 0/3, national 1/3 (95413),
  table 0/3, wave-4 3/3, wave-5 1/3 (95425), median
  survival 180d, max 181d.
- scale-onramp stays CONVERGING, NOT converged: the Herald
  arrival blocker is closed (heraldsteer), but the titan
  road now has a bricked-first-titan failure mode that
  only appears once villagers get strong enough to kill
  the thing they were supposed to muster against.

## Guardrails / legs (judged exactly)

1. All 6 judged seeds complete: JSONs present, capture
   errors 0, end fields present. PASS.
2. Instrument/substrate unmodified: `git diff HEAD` empty
   for `sim-heraldarr2-a-sweep.js`, `sim-heraldarr2-a-lib.js`,
   and `scripts/policies/`; zero `src/js` changes in this
   arm's commits. PASS.
3. Determinism leg: 95402 re-run to a scratch dir
   reproduces its judged JSON byte-identically (anchor
   included — no commit landed between sweep and re-run).
   PASS.
4. Proof tests green: `test-sim-heraldarr2-a.js` on the
   judged corpus with the parameterized size leg (expected
   6): 1209/1209. `test-sim-heraldkill-a.js` synthetic +
   corpus + probe legs: 99/99 on the corpus run (which
   includes the 7 synthetic legs; synthetic-only run
   separately 7/7). PASS. The parameterized leg is the prereg's
   tooling fix, exercised on a 6-seed corpus: the leg
   asserts exact equality to the passed count (default 8
   preserves old behavior — verified 1614/1614 on the
   prior 8-seed pilot corpus with an explicit 8).
5. Sense-test: read above. PASS as a finding (the finding
   is the silence, not a pass of the narration).

Panel (MEASUREMENT.md §15): NOT APPLICABLE — DIAG census
on a moved base plus within-seed pre/post-kill trajectories
(each kill seed's post-kill state judged against its own
pre-kill state on the same seed, same run); no same-base
before/after panel exists and none is fabricated. The
within-seed comparison is in fact the cleanest available:
the same seed, the same run, the Herald present and loud
before the kill day and absent and silent after it.

## Metric review (mandatory)

- **Pre-registration bound the run.** Judged exactly
  against the committed header: K defined on the re-run
  (not the prior corpus), re-placement defined as new
  lair OR post-kill Herald dawn, "call meaningless"
  defined as available-in-code but unable to start a
  fight (not as call-blocked). No bar moved after seeing
  results. The verdict rule's strictness (ALL K seeds)
  was met without needing the MIXED branch.
- **Doubts filed, not resolved by re-scoring.**
  (a) The judged corpus carries no slain flag, muster
  state, or awayNews — the probe legs cover those, and
  every probe-derived claim above is labeled as a probe
  leg. Probe pre-call snapshots matched the judged corpus
  on all 5 kill seeds (Herald absent, omen = kill-day
  stage), which is what licenses trusting the probe's
  post-call state. (b) The base moved since the
  heraldsteer corpus, but all 9 re-run seeds reproduced
  exactly — the moved-base caveat did not materialize
  here; it is retained for the confirm band, which has
  not run. (c) n = 5 unanimous on a screened band: the
  verdict is about the mechanism (re-placement / omen /
  slain / call), not about rates — no kill rate, no
  stall rate, and no outcome difference is claimed.
  (d) The probe's call state is end-of-run state
  (links/trust at day 181/152/174); a player calling
  mid-post-kill would see different quotas, but the
  gates (slain false, stage 2, monster absent) do not
  depend on quotas — availability is judged on gates +
  absence, never on a quota forecast. (e) The probe's
  escalation regex catches every titan's lines; all
  counts above are Herald-filtered (95438's and 95440's
  totals include genuine Nielsen/other-titan lines in
  the raw probe files — the Herald-only counts are the
  ones tabled). (f) 95439's commit is gate-passed but
  pool-empty: the prereg's "commit passes its gates"
  clause is satisfied (neither the slain gate nor the
  stage gate fired), and the distinction is reported,
  not smoothed into a full pass. (g) awayNews at
  kill+3: the kill line is spoken into awayNews at kill
  time by code (the `tell()` call), so the sense finding
  is precisely "gone by kill+3 on 5/5", not "never
  spoken" — whether a player checking news on kill day
  itself would see it depends on awayNews delivery /
  reading, which this arm did not instrument; that
  delivery question is an open instrument gap, not a
  verdict input. (h) Phantom-escalation kcal: several
  post-kill feeds report "0 kcal" (stores already empty)
  — the lie is the line claiming the Herald fed, not the
  number; the trust strikes are the real cost.
- **Revisions for the NEXT run, not this one.** (1) The
  confirm band above (screen from 95441) should run with
  the same prereg bars before anyone claims the HURTS
  verdict generalizes beyond these 5 seeds. (2) A future
  arm should instrument awayNews delivery (when the
  scholar reads it, when it clears) before claiming a
  kill line is ever seen. (3) If layer-1 fixes land, this
  arm's probe script re-runs unchanged as the regression
  check: escalation lines after a kill must be 0, and the
  call against an absent titan must refuse.

## Blanks filled or documented

- Filled (measured): the Herald-kill question itself —
  killing HURTS, 5/5 unanimous, mechanism traced to the
  code path (omen/slain/call/escalation), with a delivery
  spec for the fix. Plus the tooling fix: the heraldarr2
  test's corpus-size leg is now parameterized (default 8,
  exact-equality preserved), exercised on this 6-seed corpus.
- Documented, not filled (for later arms, NOT this one):
  (a) Layer-2 design call (re-placement vs kill-gating vs
  slain credit) — needs Steve/coordinator ruling. (b) The
  confirm band (screen from 95441) — owed. (c) awayNews
  delivery/reading instrumentation. (d) #1538 (refused-face
  routing) still pending and untouched — every scholar
  contact on every judged seed is still a refusal at
  muster 0 < 10; the probes' musters (3–7 blades) confirm
  the call path itself works when sounded, which sharpens
  #1538 rather than answering it.

## Convergence state

converging (measurement, not a lever): the scale-onramp
axis gains a precisely located failure mode — the titan
road's first step breaks exactly when villagers become
strong enough to kill its herald — while the climb past
wave 4 to a full seat still does not complete anywhere in
this run. No new game change landed (DIAG only).

## Readiness

Ready for coordinator merge ('merged locally, pending ship'
is the coordinator's call) — NOT pushed, NOT version-bumped,
NOT live-verified. No `[needs-eyes]` (DIAG instrumentation
only; nothing player-facing changed by this arm). Worktree
clean after commit (see commit message for the file list);
scratch leg dir (/tmp/heraldkill-det) and probe `.err` files
live outside the tree / removed, not committed.
