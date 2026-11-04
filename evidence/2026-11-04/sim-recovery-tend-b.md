# Tend-through recovery leg — Loop B, arm sim-recovery-tend-b

Axis: scale-onramp / winnability chain. POLICY-ONLY arm: one new
policy file, ZERO src/js changes, ZERO edits to leadcourt.js,
ZERO gate/price/deed changes. This arm tests ONLY tend-through;
it never tests zombie-clearing, never bundles both legs, and
never touches the sibling tree sim-recovery-zombie-b.

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-04/sim-recovery-tend-b-prereg.md`
(commit 933599404). In short:

- Question: if tending never stops for the pantry gate — tending
  weekly through thin pantries, at whatever partial credit the
  pantry actually holds — do the baseline-collapsed polities
  hold instead of dropping, or recover after a drop?
- Policy: NEW `scripts/policies/leadcourt-tendthrough.js` =
  leadcourt with ONLY the pantry > 20,000 tend gate removed
  (tending still weekly, still Haven-primary links only, still
  1,500 kcal per tend at the engine's price, proposal gate
  pantry > 12,000 unchanged, answer/counter logic unchanged).
  The diff against leadcourt.js is exactly the tend condition
  plus header/id lines — verified by diff before the leg.
- Seeds: 99401–99404 + 99409–99412, identical to the polityfrag
  corpus. Baseline CITED from `evidence/2026-11-04/
  sim-polityfrag-b.md`, not re-derived by re-running leadcourt.
- Horizon: 300 days, death-aware. WHY 300: identical window to
  polityfrag, so per-seed comparison is like-for-like; the
  death-aware stop bounds cost (no seed reached 300; max 153).
- Instrument: the diplo instrument
  (`scripts/diplo-instrument-20261104.js`) REUSED verbatim via
  a new driver (`scripts/test-recovery-tend-driver-20261104.js`,
  output `evidence/2026-11-04/perseed-recovery-tend-b/`,
  RUN=recovery-tend) and the polityfrag analyzer REUSED
  verbatim, plus a thin wrapper
  (`scripts/test-recovery-tend-analyze-20261104.js`) adding
  post-drop days lived, tend counts (incl. low-pantry tends),
  survival bands, and the GO judge. The snapshot NEVER calls
  villageStandingTotal() or unlockedWave(); ONE end-of-run
  unlockedWave() call is reported separately and never counted
  as a natural door-open. The driver refuses to overwrite an
  existing per-seed file.
- PRIMARY METRIC + GO BAR: per-seed polity trajectory +
  hold-share + drop events with cause + recovery events +
  re-proposals. GO iff BOTH: (a) at least 2 of the 3
  baseline-collapsed seeds (99402, 99403, 99411) either hold
  to village death or recover (diplomacy 0 → > 0 after a
  drop); AND (b) no more than 1 seed regresses a survival
  class vs polityfrag, where classes are death-day bands:
  A = survived to 300d, B = died 150–299d, C = died 100–149d,
  D = died < 100d. Otherwise NO-GO. A miss is NO-GO, never
  re-scored against a friendlier metric mid-run.
  INSUFFICIENT-DATA only if > 2 seeds carry instrument
  errors or zero otherVillages at day 1.
- HARD LIMITS (binding, honored): no gate/price/deed change;
  no src/js change; no edit to leadcourt.js; no
  zombie-clearing mechanism (no re-proposal of a trust-0
  link, no arrears forgiveness, no debt call-in, no snap
  change); no propose/tend verb added or removed; no file
  owned by the sibling zombie arm touched; no Loop A
  tree/claim/branch touched; no push, no bump, no live
  verification, no merge to master (coordinator merges).

## Pilot leg — per-seed before/after table

Proof `scripts/test-recovery-tend-20261104.js` 32/32 before the
leg (variant-construct checks, band/GO-judge fixtures,
low-pantry-tend counting, reused-analyzer recovery case,
live harness smoke). 0 instrument errors on all 8 pilot
seeds; analyzer classified 8/8. Columns: days, end scale,
maxW, firstDiplo, diploDays, holdShare, drops/recov,
trajectory, w5 faced, ready days, tend total (low-pantry
tends), survival band (baseline band). Baseline values are
the cited polityfrag row; candidate values are this leg.

| seed | days base → tend | scale base → tend | maxW | firstDiplo | diploDays | holdShare | drops/recov | trajectory base → tend | w5 | ready | tends (low-pantry) | band |
|------|------------------|-------------------|------|------------|-----------|-----------|-------------|------------------------|----|-------|-------------------|------|
| 99401 | 98 → 104 | regional → regional | 4 | — → — | 0 → 0 | — | 0/0 | never → never | no | 0 | 10 → 56 (22) | D → C |
| 99402 | 143 → 125 | regional → global | 5 | 60 → 60 | 29 → 66 | 0.345 → 1.000 | 1/0 → 0/0 | collapses → holds-to-death | yes | 27 → 27 | 23 → 113 (104) | C → C |
| 99403 | 118 → 141 | regional → global | 4 | 57 → 57 | 60 → 85 | 0.968 → 1.000 | 1/0 → 0/0 | collapses → holds-to-death | no | 0 | 8 → 124 (124) | C → C |
| 99404 | 76 → 146 | regional → global | 5 | — → 87 | 0 → 61 | — → 1.000 | 0/0 → 0/0 | never → holds-to-death | no → yes | 0 → 16 | 12 → 121 (105) | D → C |
| 99409 | 111 → 82 | global → global | 3 | 57 → 57 | 56 → 27 | 1.000 → 1.000 | 0/0 → 0/0 | holds-to-death → holds-to-death | no | 0 | 27 → 73 (67) | C → D REGRESSION |
| 99410 | 107 → 95 | global → global | 4 | 57 → 57 | 51 → 38 | 1.000 → 1.000 | 0/0 → 0/0 | holds-to-death → holds-to-death | no | 0 | 42 → 72 (60) | C → D REGRESSION |
| 99411 | 146 → 153 | regional → global | 4 | 58 → 58 | 78 → 98 | 0.867 → 1.000 | 1/0 → 0/0 | collapses → holds-to-death | no | 0 | 18 → 136 (121) | C → B |
| 99412 | 64 → 64 | village → village | 4 | — → — | 0 → 0 | — | 0/0 | never → never | no | 0 | 3 → 8 (8) | D → D |

Pooled, diplomacy seeds only: baseline 5 seeds, 274 diplo>0
days of 343 post-first snapshots (hold-share 0.799), 3 drops,
0 recoveries. Tend-through: 6 seeds, 375 diplo>0 days,
hold-share 1.000 on every diplomacy seed, 0 drops,
0 recoveries (there is no drop to recover from — see
Finding 4). Total tends: baseline 143 → tend-through 703,
of which 611 (87%) were attempted while the snapshot pantry
sat at or below 20,000 kcal — the lever fired, overwhelmingly
at exactly the pantry levels the old gate would have blocked.
99403's 124 tends were ALL low-pantry tends.

## Finding 1 — tend-through prevents every drop: 3/3 collapsed seeds hold

All three baseline-collapsed seeds hold to village death
under tend-through, with hold-share 1.000 and zero drop
events:

- 99402, the decisive baseline case (resumed tending
  d97/d110/d111 yet trust 21 → 0): first diplomacy still
  d60, but the dropped link's story inverts — all three
  links end at trust 90/92/92 (baseline: the weakest link
  at 0), diplomacy 102 to the grave, end-state scaleRank
  global (baseline: regional after the d89 drop). The
  first-diplomacy snapshot pantry is 6,181 kcal — already
  below the old gate — so the lever was firing before the
  polity even paid its first diplomacy.
- 99403 (baseline: 82-day gap, two links unseasoning d117,
  death d118): tends run through d140 (baseline last tend
  d35), final trusts 83/87/85, diplomacy 102 to death d141,
  end-state global. The seed that had a one-day recovery
  window in baseline now has 84 post-season days of held
  diplomacy and no drop at all.
- 99411 (baseline: 72-day gap, drop d136, death d146):
  final trusts 94/69/66, diplomacy 102 to death d153,
  end-state global, survival band C → B. Its baseline
  weakest link (trust 46 at drop) never dips below the
  40 bar in this leg's sampled trajectory (min sampled
  trust 30 is the formation value, not a dip).

GO leg (a) is met at 3/3, not just the required 2/3 — and
it is met by PREVENTION, not by recovery. No seed in this
leg drops and then comes back, because no seed drops.

## Finding 2 — the lever also creates a polity where baseline had none

99404 flips from never-diplomacy (baseline: only 2 seasoned
at once before death d76) to holds-to-death: three links
season (third formed d57, seasoned by d87), diplomacy 102
from d87 to death d146, end-state global, wave-5 faced with
16 readiness-5-ready days (baseline: 0 ready days, never
faced wave 5). Its final standing is the leg's highest
(total 502, war 400, diplomacy 102). Continuous tending did
not just defend a polity here — it built one out of a seed
that previously died before seasoning, by keeping the two
early links' trusts at 87–92 while the third ripened.
99401 improves a band (D → C, 98 → 104 days) without ever
reaching diplomacy — see Finding 3 for why it still never
pays.

## Finding 3 — tend-through does NOT fix the mixed-polity shape

99401 reproduces the polityfrag BELONG shape and still
never pays: its 2 Haven-primary links season (trusts 92/78
at death, tended 28 times each) but the third bond is a
BELONG link (Haven subordinate to village_1), never tended
(tend-through tends Haven-primary links only, as specified),
which decays and BREAKS d91 — the only broken link in the
leg. One new fact vs baseline: the break now has a window,
and leadcourt uses it — a re-proposal d93, a new link
formed d94 — but the new link is AGAIN a BELONG link
(primary village_1, subordinate Haven, trust 23 at death,
never tended), so regional+ still never fires (analyzer
neverReason: seasoned-3-but-never-regional, polity-shape).
Tending continuity cannot fix a shape problem: a village
that keeps re-binding as a subordinate keeps paying nothing
as a head, no matter how faithfully its own subordinates
are fed. That shape is the zombie leg's or a courtship
leg's problem, not this leg's — and this leg must not be
cited as fixing it.

99412 is the other never-shape, unchanged in kind: died
d64 before any link seasoned (identical death day to
baseline), 2 links formed d45/d47, trusts 37/53 at death,
8 low-pantry tends. When a village dies before seasoning,
the tend gate is irrelevant — there is no polity for the
lever to save.

## Finding 4 — the recovery question itself is NOT answered by this leg

This leg's headline is prevention, and prevention leaves
the original recovery question open: can a polity that
HAS dropped come back? Under tend-through, no polity
drops, so the post-drop recovery mechanism — re-seasoning
a dropped link from trust < 40 back above the bar, or any
replacement path — is exercised zero times. The GO bar
allowed "hold OR recover," and all three successes are
holds. The zombie-clearing leg remains the only arm that
can test post-drop recovery, because it is the only arm
that lets a drop happen and then offers a way back. Any
report that cites this leg as "recovery proven" is wrong:
what is proven is that continuous tending prevents the
collapse that needed recovering from, on these 8 seeds.
The trust-0 zombie trap itself (a faded link still
counting as a subordinate, blocking replacement) is
untouched by this lever by design — it simply never
forms here, because no link fades.

## Finding 5 — the cost: two former holders die a band earlier

GO leg (b) FAILS: 2 regressions, against a bar of at most
1. The regressors are the two baseline holders, and the
pattern is specific:

- 99409: baseline holds-to-death d111 (global, maxWave 4)
  → tend-through holds-to-death d82 (global, maxWave 3,
  wave-4 NOT faced — the leg's only wave-4-facing loss).
  Baseline tends 27, pantry at d57 44,475; tend-through
  tends 73, pantry at d57 3,500. Deaths 39 (villager
  combat 20, the wild 6, combat 5, starvation 2).
- 99410: baseline holds-to-death d107 (global) →
  tend-through holds-to-death d95 (global). Baseline
  tends 42, pantry at d57 27,376; tend-through tends 72,
  pantry at d57 20,966. Deaths 65 (combat 26, villager
  combat 19, the wild 8, starvation 2).

Both still hold diplomacy 102 to the grave and end at
global — the polity is not what regressed; the village's
life is. The leading mechanism is the grain itself:
tend-through spends 1,500 kcal per link per week through
thin pantries (99409: 73 tends vs 27; 99410: 72 vs 42),
and on a seed whose pantry was already thin, that weekly
drain plausibly hastens the pantry crash that precedes
village loss. This is stated as a mechanism hypothesis,
NOT proven causation: identical seeds do not mean
identical timelines — once the first sub-20,000 tend
fires, the timelines diverge (different pantry, different
fights, different deaths), so the d57 pantry gap is a
different timeline's number, not a controlled subtraction.
What IS established is the split: the tax is not uniform.
Four seeds improve or hold their band while gaining a
polity (99404 D → C, 99411 C → B, 99401 D → C, 99402
C → C with a polity saved), two hold their band
(99403 C → C, 99412 D → D), and the two seeds that
needed the lever least — the holders, whose baseline
tending never gapped long enough to drop — pay for grain
they did not need. A gate that tends through thin
pantries helps exactly the villages at risk of dropping
and taxes exactly the villages that were already safe.
That asymmetry is the design question for the coordinator,
not a verdict this worker re-scores: the prereg bar
counts 2 regressions as NO-GO, and it is counted as
NO-GO.

## Wall numbers (pilot leg, not wall movement)

Wins 0/8. Villages lost 8/8, survived to horizon 0/8.
National / table: end-state scaleRank global 6/8 (99402,
99403, 99404, 99409, 99410, 99411), national 0/8 at end
(global is the scaleRank read when the globalLive flag is
set — same qualifier as polityfrag; a global end-state
has passed through national, it is not a completed global
campaign), regional 1/8 (99401), village 1/8 (99412).
Table: not instrumented by this arm (stated, not faked);
no win flag observed on any seed. Wave-5 unlocks 2/8
(99402, 99404; baseline 1/8), wave-5 faced 2/8 (same two;
baseline 1/8), wave-4 faced 7/8 (all but 99409; baseline
8/8), wave-4 unlocks 7/8 by maxWave (99409 reaches
maxWave 3 only, so it never unlocks wave 4 on this leg).
Wave reach (by maxWave): wave 5 on 2 seeds, wave 4 on 5
seeds, wave 3 on 1 seed (99409). Readiness-5-ready days:
43 total (99402: 27, unchanged from baseline; 99404: 16,
new). Median survival 114.5 days (sorted 64, 82, 95, 104,
125, 141, 146, 153; baseline 109), max 153 (baseline 146).
Deaths 529 total: villager combat 221, combat 107,
expedition 65, the wild 62, monster 27, the arena 10,
sickness 8, a wound that wouldn't close 7, starvation 6,
ambush 3, a stranger 2, dehydration 1, thirst 1, contest 1,
named beasts 8 (Choir Toad 2, The Ugly Beast 1, Grief
Counselor 1, Highbeam Deer 1, Big-Eyes 1, The Redactor 1,
a drumbeat with no drummer 1). Combat accounts for
328/529 deaths (62%) — villages die fighting, not
starving, on this band, same shape as polityfrag (59%).

## Sense-testing (SENSE-TESTING LAW — transcripts, not counts)

There is no collapse to narrate, and the narration knows
it: cooling warnings ("fire is drifting") and "realm came
apart" lines occur ZERO times across all 8 seeds — the
absence is the finding, consistent with zero drops, not a
missing narration. What the sample DOES capture is the
polity beat that tend-through makes true:

- 99404 d57 (third link formed, bonds young): "Three
  fires bow to Haven. But a realm isn't leverage — it's
  seasons. These bonds are young; tend them, keep the
  trust, and the court will come." That line is the
  lever's story in the game's own voice — and on this
  seed, the court does come (diplomacy d87, global to
  death). The held polities read as consequences of
  tending because the trust numbers say so: every held
  link ends at trust 66–100, tended 20–46 times, with no
  link ever crossing below the 40 bar after seasoning.
- The rest of the sample is ordinary village talk — fire
  gossip ("Three retellings in, nobody remembers what
  actually happened"), counter-learned lines, the pantry
  counter's "We pool food here" — no robotic, static, or
  repeated diplomacy dialogue, because there is no
  diplomacy dialogue to repeat when nothing collapses.
  One honest capture limitation, same class as
  polityfrag's tribute gap: the instrument's SAY_RE does
  not match tendLink's own say-lines ("Haven sends …
  kcal of grain …"), so the tend lines themselves are
  counted as events (703, with per-link counts) but not
  quoted here — a future instrument should match tend
  lines to close that loop. The tend events, not the
  say sample, carry the "villagers fed their bonds"
  claim, and they are complete (0 unknown-pantry tends).

## Village assessment (plain words)

Picture the same eight villages, but with one rule
changed: the grain never stops. Where before the pantry
crashed and the tending stopped and the weakest bond
bled for forty to eighty silent days until the realm
dissolved in a morning, now the grain keeps going out —
small amounts, sometimes only what the pantry holds, week
after week — and the bonds never cross the line. Three
villages that watched their realm come apart last time
now die as the head of a global polity with the diplomacy
ledger still paying 102, the fires still fed. A fourth
village that died before its bonds ever ripened last
time now lives long enough, and tends steadily enough,
to become a realm itself and even face the fifth wave.
But the grain is real food, and it costs real food: the
two villages that held their realm last time without any
help still hold it — and die sooner, one of them before
it ever faces the fourth wave, because weeks of grain
sent outward is weeks of food not eaten at home. The
villages that needed the grain are saved by it; the
villages that didn't need it pay for it anyway. That is
the season's finding: tending through thin pantries is
not a free rescue. It is a trade — a realm held, against
a shorter life on the villages that were already safe —
and whether that trade is worth it is a design call, not
a measurement. The mixed village still pays nothing: it
keeps binding itself as someone else's subordinate, its
own bonds fed faithfully, its realm never forming,
because tending your subordinates cannot fix binding
yourself to another head.

## Metric review (§14 — no in-run re-scoring)

- The prereg's GO legs were judged exactly as written; no
  metric moved. Leg (a): 3/3 collapsed seeds hold (bar:
  >= 2) — PASS. Leg (b): 2 survival-band regressions
  (99409, 99410; bar: <= 1) — FAIL. Verdict: NO-GO.
  The split verdict is the honest one: the lever works
  on the polity and costs on survival, and neither half
  is softened to save the other.
- What the metric proved: the hold-vs-recover distinction
  matters — the bar allowed either, and the leg produced
  only holds, which correctly leaves the post-drop
  recovery question open (Finding 4) instead of letting
  prevention masquerade as recovery. The survival-band
  regression bar did its job as a cost guard: without it,
  this leg would read as a clean win and the two shorter
  lives would be footnoted away.
- What the metric missed, proposed for the NEXT run (not
  applied here): (1) bands are coarse — 99409's 29-day
  loss and 99410's 12-day loss both read as one
  regression each, same as a 60-day loss would; report
  death-day deltas alongside bands. (2) The bar counts
  any band drop as a lever cost, but identical seeds
  diverge into different timelines after the first
  differing tend, so a band drop is policy-effect-plus-
  cascade, not isolated grain arithmetic; a future arm
  that wants a causal survival claim needs a pantry-
  matched comparison, not just a band count. (3) The
  GO bar has no wave-facing cost leg — 99409's wave-4
  facing loss is reported but not judged; a future
  tend-gate variant (e.g. tend-through only while pantry
  > some lower floor, or tend the weakest link first)
  should pre-register a wave-facing guard alongside the
  survival guard.
- Instrument limitations recorded for the next run, not
  fixed here: (1) tendLink say-lines are not in the
  SAY_RE sample (see sense-testing); tend events carry
  the claim. (2) Per-link trust is sampled from daily
  snapshots, so intra-week moves are netted, not
  itemized. (3) scaleRank 'global' is the globalLive flag
  read, not a completed global campaign. (4) The
  wave-4 unlock count must be read from maxWave per
  seed (7/8), not from a driver-level "wave-4 faced"
  summary — 99409 reaches maxWave 3 only.
- The 300d horizon was never binding (max survival 153d);
  as in polityfrag, a future season arm should accept
  death as the horizon (and say so in its prereg) rather
  than raising the cap for no observation gain.

## Verdict — NO-GO (split: polity PASS 3/3, survival-cost FAIL 2 regressions)

GO leg (a) met: 3 of 3 baseline-collapsed seeds hold to
village death (bar: >= 2), hold-share 1.000, 0 drops.
GO leg (b) failed: 2 survival-band regressions (99409
C → D, 99410 C → D; bar: <= 1). Overall: NO-GO, judged
exactly as pre-registered. Tend-through prevents the
collapse; it does not recover from one (no drop occurs
to recover from); it does not fix the mixed-polity shape;
and it shortens the two villages that needed it least.
The pilot verdict is reported, not expanded to 12–16
seeds on this worker's authority — the coordinator decides
on confirm, and on whether the polity gain is worth the
survival cost (a Steve-level trade, not a measurement).

## Next blank, precisely (no fix in this run)

The zombie-clearing leg is now the sharper next arm, not
a repeat of this one: it is the only leg that can answer
whether a dropped polity can come back, because this leg
proves prevention while leaving post-drop recovery
untested. A second candidate, for the coordinator's call,
is a FLOORED tend-through variant (tend through thin
pantries only above a lower pantry floor, or weakest-link-
first tending) pre-registered with BOTH a survival guard
and a wave-facing guard, aimed at the asymmetry in
Finding 5: help the villages at risk of dropping without
taxing the villages already safe. NO gate/price/deed arm
follows from this evidence: standing clears 200 on war
alone in this corpus (99411 ends war 200, 99404 war 400),
diplomacy pays the full 102 when held, and the missing
piece is still a way back after a fall — plus, now, a
way to tend without taxing the safe.

## Findings for backlog (coordinator appends; not chased here)

- [open] 2026-11-04 — diplomacy — tend-through (leadcourt
  minus the 20,000-kcal tend gate) prevents every baseline
  collapse: 3/3 collapsed seeds hold to death, hold-share
  1.000, 0 drops, 703 tends (611 low-pantry) vs baseline
  143 tends — but 2 former holders regress a survival
  band, so the pilot verdict is NO-GO as pre-registered
  (this run's evidence).
- [open] 2026-11-04 — diplomacy — tend-through creates a
  polity where baseline had none (99404: never → holds,
  wave-5 faced, 16 ready days) but does not fix the mixed-
  polity shape (99401: BELONG link breaks d91, re-proposal
  d93 forms another untended BELONG link, regional+ never
  fires) (this run's evidence).
- [open] 2026-11-04 — instruments — diplo/polityfrag
  say-line sample misses tendLink's own say-lines
  ("Haven sends … kcal of grain"); future instruments
  should match tend lines so tending reads in narration,
  not just in event counts (this run's capture note).

## Proof and landing

- Proof: `scripts/test-recovery-tend-20261104.js` — 32/32
  PASS (variant constructs, band/GO-judge fixtures,
  low-pantry-tend counting, reused-analyzer recovery case,
  live harness smoke: snapshot shape, 2-day tendthrough
  run, 0 instrument errors).
- Arm commits on branch sim-recovery-tend-b (coordinator
  merges via --ff-only; committed on branch, pending
  coordinator merge — no push, no bump, no live
  verification by this worker):
  - 933599404 sim-recovery-tend-b prereg (before any
    judged sim)
  - 80be8ea32 sim-recovery-tend-b instruments + proof
    32/32 (zero src/js)
  - (this landing) sim-recovery-tend-b pilot + evidence
    (zero src/js)
- Files: prereg + evidence in `evidence/2026-11-04/
  sim-recovery-tend-b*.md`; per-seed JSON in
  `evidence/2026-11-04/perseed-recovery-tend-b/` (8 files);
  scripts `test-recovery-tend-driver-20261104.js`,
  `test-recovery-tend-analyze-20261104.js`,
  `test-recovery-tend-20261104.js`, policy
  `scripts/policies/leadcourt-tendthrough.js` (reusing
  `diplo-instrument-20261104.js` and
  `test-polityfrag-analyze-20261104.js` verbatim — not
  modified, not claimed as this arm's files).
- Index-clobber note: safe-commit.sh left bogus staged
  deletions in the worktree index after both commits
  (prereg + instruments); repaired each time via HEAD-blob
  `update-index --cacheinfo` and verified `git status`
  empty + `git diff HEAD` empty. The commits themselves
  were always correct.
- Worktree state at handoff: only committed work; no
  uncommitted leftovers (verified before reporting).
- Telemetry deviation check: ATTEMPTED and REFUSED by the
  tool — `node scripts/telemetry-check.js --baseline
  …/hidden_files/telemetry-baselines/scale-wall.json
  --current 'evidence/2026-11-04/perseed-recovery-tend-b/
  *.json' --metrics national,table,wins,exiled` refused
  with "recorder-corpus input: all 8 --current rows carry
  top-level anchorCommit, so they are sweep recorder rows,
  not runs." Recorded honestly; no compare fabricated and
  no --allow-recorder-corpus workaround used to force one.
- Heartbeats: worktree heartbeated at closeout
  (registry `sim-recovery-tend-b`, 2026-11-04T10:01:25Z).
