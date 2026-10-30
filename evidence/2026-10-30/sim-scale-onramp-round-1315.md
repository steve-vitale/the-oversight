# sim-scale-onramp-round-1315 — coordinator evidence (3 arms, merged locally pending ship)

Run: flesh-out loop, run fleshout-20261030T1315Z, axis scale-onramp
(converging, NOT converged). Sibling loop B live on food-economy at
run start (claim 1230Z, NOT touched; B started a new 1332Z round
mid-run with trees sim-stashfetch-b + sim-stranded-warmth-b, NOT
touched) and sibling playtest journey-establishment live (NOT
touched). No lock at run start, main tree clean, disk 18%. No live
claim on scale-onramp at run start, so the axis was free. This run
took the 1215Z run's ranked-next items (1) and (3) in order — the
in-call dissolve probe, then the natural fled policy — plus the
scale-axis look at the leanlink survival tradeoff that loop B's
vests arm flagged (evidence/2026-10-30/sim-vests-b.md).
Rotation NOT advanced: the standing directive suspends rotation
until a run demonstrates national reached in sims.

All three arms DIAG / measurement only, zero src/js game changes,
no default flip, no gate move, no deed-bar move. No [needs-eyes]:
no arm changes feel, combat, or UI. Merged locally, pending ship.
No push, no version bump, no live verification (the batch ship job
owns deploys).

## Pre-registration (binding, per arm)

- sim-dissolveprobe-a: prereg 4febbb075 (worker original d4c52f84b),
  committed BEFORE any judged analysis. Primary metric: in-call
  bracket rate on reproduced dissolved rows (bar: bracket the
  nulling step to a single call/window on >=95% of rows) +
  substrate leg (sweep rows identical modulo recorded filesystem
  paths). Pilot gate: 8 seeds before any confirm spend.
- sim-fleepolicy-a: prereg 9f5c93016 (worker original 711832b63),
  committed BEFORE any judged analysis. GO: >=1 natural fled
  lingerer fight with origin + restore classified; STRONGER GO:
  >=3 covering the clear-restored / blocked-blocked contrast.
  Defined in advance: 0 fled means coverage-still-empty, NEVER a
  rate; instrument-induced fled counts are a classification
  sample, never a frequency.
- sim-leantrade-a: prereg dbb86467d (worker original 0a44d7ce8),
  committed BEFORE any judged analysis. GO: every village-lost
  seed in both corpora attributed to a primary cause class with
  cited corpus evidence, plus loss-day distribution and a
  quantified tribute/proposal-cost section (or an explicit gap
  statement if the corpus cannot support it). Analysis only: no
  new sims, by design, so as not to collide with loop B's live
  vestcounter work.

## Arm 1 — sim-dissolveprobe-a (DIAG-NO-GO on bars, mechanism ANSWERED)

The two halves are both true and must not be collapsed: the
prereg bars FAIL as written, and the ranked-next question is
ANSWERED — because the bar's premise was false.

What the probe found: the 120 "dissolved" fights are
TITAN-ENTRY-GATE REFUSALS, not in-call nulls. The titans.js
startCombat wrapper refuses a solo scholar face of the Herald
before core startCombat ever runs: herald is a titan def
(src/data/titans.json, minAllies 10, coalition-only);
titanEntryGate('herald') returns null (finale-only override),
so the hard muster gate applies; with fewer than 10 mustered
blades it says once, records titanRecordOutcome('herald',
'refused'), and returns null. No fight is created, no tbEnd,
no HP cost, no barrier, no mantle. The prior arm's
'start-post-gone' label MISDESCRIBES this population: nothing
vanished — nothing was ever let in.

Judged pilot counts (8 seeds 75101-75108, 180d death-aware,
tableseat-nowait substrate verbatim): dissolved reproduced
exactly, 120 rows (75102: 32, 75104: 45, 75105: 43; all other
pilot seeds 0), same counts and fates as dissolvecause (75
SCHOLAR-RESTORED / 45 SPAWN-ENDED, 0 UNCLASSIFIED, 120/120
cause 'start-post-gone' on the old recorder). Probe logs
120/120 (100%), every log the identical 4-event shape:
startCombat enter (null) -> one say enter/exit (null) ->
startCombat exit (null). Zero tbBeginTurn / tbAdvance / tbEnd
events on any dissolved row; zero live herald scholar fights
on the band. Bracket rate 0/120, all reason 'no-live-event':
there is no live->null window because there is no live fight.
Wrapper elimination (all 10 startCombat wrappers read): only
titans refuses herald; core's refused path requires a live
fight, contradicted by enter-null + recorder kind 'start'.
One gap, stated not hidden: the probe records say events
without their text (node sims stub Game.say), so the gate's
have/need numbers per row are NOT captured; muster-branch
identification rests on code elimination (titanEntryGate null
for herald), not captured text.

Pilot-gate substrate leg FAILS as written (0/8 normalized
rows) — sole cause is the probe's own removeWorldMonster
wrapper frame shifting the removal recorder's 8-frame stack
window. All game data is proven identical: 0 residual diffs
after frame-shift reconciliation on all 8 pilot seeds, census
byte-identical, s75102 re-run byte-identical. Per prereg, a
failed pilot gate stops the run: NO confirm sweep was run.
Per §14 both failures are reported as failed, never re-scored
— the mechanism answer does not rescue the bars, and the
bars' failure does not hide the answer.

Pilot wall (8 seeds, report-only): won 6 (full 0), national
ever 6, national final 6, table reached 7, entered 6, wave
reach 8/8/7/5/0, median 114d, deaths 232. Sense: 2 chains read
end to end (s75102 pinned herald d74-d80 + census; s75104
phantom herald d96-d101, no herald anywhere on census) — both
read coherently as repeated gate refusal, not combat.
Attach-rule findings (disclosed, immaterial to dissolved
rows): orphan-end rows pick up the next window's log; nested
startCombat calls are real (s75105 seq 46/47 share one log)
and the max-fightSeq attach rule misattributes outer rows on
nesting — but dissolved rows' windows are never nested (a
nested herald call during a live fight logs kind 'refused',
never dissolved).

Proof: scripts/test-dissolveprobe-a.js FIXTURES-PASS 72/72
(green under both wrap orders, before judged analysis, and
re-run green on the merged tip). Commits (rebased twice for
sequential merging; worker originals in parentheses): prereg
4febbb075 (d4c52f84b), instrument 49bf3c00c (3a4b5b17),
evidence 0f602ad51 (d3c174fff). Corpus (pilot only, 8 seeds):
evidence/2026-10-30/perseed-dissolveprobe-a/; analysis
evidence/2026-10-30/sim-dissolveprobe-a-pilot-analysis.json.

## Arm 2 — sim-fleepolicy-a (GO-STRONG)

The natural fled population is no longer empty. The policy
(scripts/policies/fleepolicy-a.js, gated on FLEEPOLICY=1,
gate-off delegates to the base fight untouched) wraps the
tableseat-nowait stack and, on lingerer-origin fights only
(worldOrigin.lingering, not titan), fights 2 damaging strikes
then flees — Haven door tile (4,6) when inside, grid edge +
tbBarrierExit (repeat crossings for chasers) when outside,
path-switch after 3 no-progress turns, abandon to base fight
after 30 flee turns (counted, never scored as fled). No game
change, no new recorder field (draftflag + scholarmelt reused
verbatim; counters live on the run ctx as an additive
sweep-row field only).

Judged counts (confirm band 75301-75308, 180d death-aware):
instrument fired — 46 lingerer fights seen, 19 entered the
flee phase, 49 flee turns (door 4, edge 45), 0 abandonments.
GO-STRONG: 16 natural fled lingerer fights, ALL classified,
0 unclassified — 13 RESTORED, 3 BLOCKED. Blockers, all
standing on (4,4) at tbEnd: sweeps_week 1 HP w1, chorus_line
1 HP w3, suburb 975 HP w4. The suburb blocker carries NO
lingering flag, so OCCUPANCY blocks, not lingering status —
a refinement of the lost-half finding (whose blockers were
all fellow besiegers). All 16 fled tbend rows are
linger-origin; scholarmelt shows 17 fled meetings, the extra
one a separately-counted bystander-hold fled (75302
nightcourt, zero damage either side, no worldOrigin — never
folded into the linger count). Coverage boundary: 27/46 seen
lingerer fights ended before the flee phase (won/routed/lost
in <=2 scholar strikes); seeds 75304/75306 never entered the
flee phase. The exit path never failed; fight length and
trigger timing are the volume lever, not the exit.
Scenario proofs (real-engine door/chase, determinism
byte-identical) reproduce fledcover-a's numbers exactly
(door restore 130 HP, chase restore 68 HP). Sense: 3 chains
read end to end, all coherent — 75301 d26 anaconda restored
at the 1 HP cap; 75307 d133 belltoad blocked by the suburb
on (4,4) (same beast restored 3x earlier while alone on the
tile); 75305 d140-144 ad_break/chorus_line pair trading the
same patch until one fled while the other stood there and
melted.

Wall numbers (this band only, report-only, NEVER mixed with
other bands, and NOT a before/after comparison — different
seeds, different policy): won 3/8 (full 0), national ever
6/8, national final 5/8, table 5/8, entered 3/8, wave reach
8/8/8/4/0 (wave 5: 0/8), median 180d (capped), deaths 290.

Is the natural fled RATE now measured? NO — and that
distinction is the point. The natural fled POPULATION is no
longer empty (16 classified), and the fled answer under
natural siege composition matches the scripted answer (tile
clear -> restore wounded; tile held -> melt, blocker named).
But a fled RATE for unmodified play is still unmeasured:
these 16 are instrument-induced (a policy that chooses to
run), so they are a classification sample, never a frequency
— and the 0/24 unmodified-play statement stands untouched.
No rate is quoted anywhere in the arm evidence.

Proof: scripts/test-fleepolicy-a.js FIXTURES-PASS 24/24
(re-run green on the merged tip). Commits (rebased; worker
originals in parentheses): prereg 9f5c93016 (711832b63), work
a4be41e4a (bdda23ad4). Evidence + corpus:
evidence/2026-10-30/sim-fleepolicy-a.md,
sim-fleepolicy-a-analysis.json, sim-fleepolicy-a-scenarios.json,
perseed-fleepolicy-a/ (8 rows + 8 census + summary).

## Arm 3 — sim-leantrade-a (DIAG-GO)

Loop B's vests arm flagged national 5/8 with village-lost 4/8
vs competent 1/8 and named "tribute/proposal costs plus
trajectory divergence" as the possible cause. This arm
decomposed that flag from the COMMITTED corpora only
(seeds 9911-9918, competent vs leanlink, pairing confirmed:
identical seed lists, so paired claims rest on the same
starting dice — not on the path, which diverges completely
once leanlink's first proposal lands).

Per-seed loss attribution (dominant aggregate death-cause
share; the corpus has no timestamped death log and no
terminal-cause field — see gaps; margin rule >2 deaths, no
lost seed ambiguous, margins 18-22):

| Lost seed | Policy / loss day | Primary cause | National / table at loss |
|---|---|---|---|
| 9913 | competent, day 86 (early) | monster-combat 26/31 | 0 / 0, village rank |
| 9911 | leanlink, day 166 (late) | monster-combat 27/38 | 0 / 1 (lesser seat), regional |
| 9912 | leanlink, day 139 (mid) | monster-combat 29/39 | 1 / 0, maxRank global -> regional |
| 9913 | leanlink, day 129 (mid) | monster-combat 30/42 | 1 / 1, maxRank global -> regional |
| 9918 | leanlink, day 159 (late) | monster-combat 33/55 | 1 / 1, national -> regional |

STARVATION IS ABSENT from the leanlink column entirely (0
deaths). The only sustenance deaths on lost seeds are one
thirst each on leanlink 9912/9913, and 9918's 8
sustenance-disease deaths (6 sickness + 2 wounds) still
trail its 33 monster-combat deaths. Column totals nearly
identical: competent 318 deaths vs leanlink 317 — and
monster-combat is actually LOWER under leanlink (238 vs
258), while player-field deaths are higher (51 vs 31).
Nothing in the death data supports "tribute starved the
village."

Loss-day distribution: competent 1 loss, day 86 (early).
Leanlink 4 losses at days 129, 139, 159, 166 — 2
mid-ambition (100-150d), 2 late (>150d), ZERO early; honest
median 173. This does NOT match the old scale-wall shape
(starve ~day 39, dead by ~63). Every leanlink loss happened
AFTER reaching regional-or-better, and 3 of 4 after reaching
national and/or the table. The villages didn't die trying to
climb; they climbed, then died fighting monsters.

Tribute/proposal costs — NOT quantifiable from this corpus
(explicit gap, prereg-accepted): court totals under leanlink
are 30 proposals led, 23 accords, 5 national beats, 2 global
beats, 2 counters (competent: none — the instrument is
leanlink-only), and endGate links on lost seeds still show
live trust (9912: 77/43/45; 9913: 45/65/39; 9918: 70/22/1).
But the corpus contains NO pantry time series, NO
tribute-payment events, and NO proposal timing
(grep-verified: no pantry/kcal/tribute fields anywhere in
either corpus). Tribute kcal actually paid cannot be
computed, and proposal timing vs loss timing cannot be
established. Canon context only, not measurement: docs/
SCALE.md sets courtship tribute at 4,000 kcal/week and the
leanlink policy proposes exactly that — but whether any
village paid it into distress is unobservable here. One flag
for follow-up: leanlink 9911 proposed 9 times with 2
counters and no national beat (vs 3 proposals on every other
leanlink seed) — proposal churn without payoff, on a seed
that still reached the table but lost at day 166.

Paired or confounded? BOTH — and the confound cuts both
ways. Tradeoff real on 3 seeds (9911 -14d, 9912 -41d, 9918
-21d), REVERSED on 9913 (+43 days: leanlink extended life
and reached global/national/table where competent died at
village rank), and 9914-9917 survived under both (national
gained on 9914, 9917). And 9912 is the tell for divergence:
leanlink lost the village with FEWER total deaths (39) than
the competent run that survived (44) — so the loss can't be
a death-volume story. It has to be about population dynamics
(joiners vs deaths over time), which the corpus doesn't
record.

Sense: two loss trajectories read end to end. Competent
9913: ground down by monsters before ever leaving village
scale (26/31 monster-combat, dead day 86) — the classic
early wall death. Leanlink 9912: climbed to global with a
national beat, then died at day 139 while its three links
still stood at trust 77/43/45 — the polity outlived the
village. It died fighting monsters (29/39), not starving,
not fraying. A realm with no village left in it is the story
the counts alone would miss.

Plain-words verdict: NO — leanlink's national reach is NOT
shown to be bought with village survival in any way this
corpus can show. Villages under leanlink don't starve, don't
die early, and don't die more often by the death count (317
vs 318 total). They reach national and the table, and then —
on 3 of 8 seeds — they die late, fighting monsters, at days
129-166. What looks like a tradeoff on the totals is, seed by
seed, trajectory divergence plus an unmeasured population
dynamic. "Tribute costs plus trajectory divergence" should
be reported as an open question with divergence as the
evidenced half, not as a finding.

What a follow-up measurement needs to separate cost from
divergence: (a) a per-day pantry series plus actual
tribute-payment events; (b) a timestamped death log (or at
least last-7-days deaths) to name the terminal cause instead
of the dominant share; (c) a population series (villagers +
joiners over time) to explain losses like 9912; (d) a
tribute-isolating arm — same seeds, leanlink courting with
tribute zeroed — so the cost of paying is separated from the
divergence of courting.

Proof: scripts/test-leantrade-a.js 30 assertions passed
(re-run green on the merged tip; includes a fixture that
caught a real bug — a missing counterpart seed now throws a
loud pairing error instead of crashing). Commits (rebased;
worker originals in parentheses): prereg dbb86467d
(0a44d7ce8), analyzer 6322d3fde (c8a29a767), evidence
2101370ed (4b2aa90b5). Evidence + analysis:
evidence/2026-10-30/sim-leantrade-a.md,
sim-leantrade-a-analysis.json. (The arm evidence file was
written by a follow-up worker from the committed prereg +
analysis JSON after the first worker shipped without it;
every number in it traces to one of those two.)

## Wall numbers (per band, never mixed)

- Dissolveprobe pilot (75101-75108, tableseat-nowait):
  won 6/8 (full 0), national ever 6/8, final 6/8, table 7/8,
  entered 6/8, wave 8/8/7/5/0, median 114d, deaths 232.
- Fleepolicy band (75301-75308, flee policy): won 3/8
  (full 0), national ever 6/8, final 5/8, table 5/8, entered
  3/8, wave 8/8/8/4/0, median 180d (capped), deaths 290.
- Leantrade corpora (9911-9918, competent vs leanlink):
  competent national 0/8, table 0/8, lost 1/8; leanlink
  national 5/8, table 4/8, lost 4/8, median 173.
No before/after claim anywhere: all three arms are
instruments, a non-default policy, or a re-analysis. The
wall's SHAPE is unchanged — full seat 0 and wave 5 0 on
every band in this run, as on every band this cycle.

## Reachability verdict

Unchanged by this run (measurement only): waves 1-4
reachable, wave 5 unreachable on every band (0/8, 0/8),
the table reachable only through the lesser seat, the full
seat unreached. What this run changes is the wall's
plumbing, twice over: the 120 "dissolved" scholar fights
are reframed as gate refusals (nothing ever entered, so
there is no dissolved-fight damage, cost, or restore to
chase — the chase moves to mustering and to why the bot
re-faces a refused gate); and the fled half of
lingerer-keeps now has a natural classification sample
(13 restored / 3 blocked) instead of only scripted
scenarios. The leanlink tradeoff is reframed with it: not
a starvation cost, but late monster deaths after a climb
plus unmeasured population dynamics.

## Village assessment (plain words)

When the scholar walks up to the great herald beast alone,
the beast's own gate turns her away before any fight starts
— she was never let in, so nothing was fought, nothing was
lost, and nothing was spent. She keeps walking up to that
gate, day after day, because the promise of the beast never
leaves and never lets her in either. When she does run from
a siege fight she can actually fight, what happens next is
decided by the ground, not by how she left: clear treeline
and the beast comes back wounded; another beast still
standing there and it melts away, even a mighty one with
975 strength left in it. And the villages that learn to
reach for the wider world do reach it — then, on some
seeds, they die late, fighting monsters, with their
alliances still standing and their trust still warm. The
realm outlives the village. That is not a village starved
by its own ambition. It is a village that climbed and then
could not hold the ground it climbed to.

## Metric review

- All three preregs bound their runs and were honored: no
  metric was re-scored mid-run. Dissolveprobe's NO-GO is
  reported as failed even though the mechanism question is
  answered — §14 binds, and the evidence is written so the
  stricter and looser readings can both be applied without
  re-running anything. The coordinator judgment call from
  1215Z (DIAG-GO on the "what code path STARTS a herald
  fight" bar) is now SUPERSEDED in wording, not in fact:
  the start path is the titan gate's refusal, and the
  "dissolved" label itself was the misdescription.
- Prereg-wording notes for the NEXT run (from dissolveprobe,
  not revisions to this verdict): write a bracket bar with
  a 'refusal' kind alongside live->null kinds, so a
  gate-refusal population can PASS instead of failing on a
  false premise; write a substrate leg that pins the
  wrapper set and the stack-frame window (a probe that
  wraps removeWorldMonster shifts the window); capture
  say text (Game.say is stubbed in node sims — the gate's
  have/need numbers need a text-capturing probe, not a
  shape-only one).
- Fleepolicy wording note: scenario counts and
  instrument-induced counts are classification samples,
  never rates; the natural fled rate for unmodified play
  stays unmeasured at 0/24 seeds, and the 16 fled fights
  must never be quoted as "16 fled out of N" without the
  instrument named.
- Leantrade wording note: aggregate death-share attribution
  is a proxy, not a terminal cause; the next prereg for a
  loss decomposition should require a pantry series and a
  population series as corpus inputs, or accept the gap
  statement up front.

## Telemetry deviation check

node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-30/perseed-dissolveprobe-a/s*-fresh.json'
--sweep-rows --metrics national,table,wins,exiled — ONE LOUD
line: wins swung -62% (baseline 16 -> current 6, n=8 seed
rows). INVESTIGATED, EXPLAINED, NOT A BUG — and the baseline
was NOT rolled. The baseline file's own _regime label says
it is the "winseat — full win-side win stack, ~100%-win
suite" (wins 16/16 on a WINPURSUIT/WINDEFER/SEATDRIVE policy
stack), and it warns in terms: "DO NOT compare pre-seat /
courtship / readiness substrates against this baseline —
telemetry-check will fire a spurious LOUD 'wins
disappeared'." This pilot is tableseat-nowait, n=8, compared
by raw count against a 16-run winseat regime: 6/8 won (75%)
on this substrate is consistent with the dissolvecause band
(9/16) and is not a disappearance. The check was NOT run on
the fleepolicy band for the same reason (different policy,
different seeds — a LOUD line there would be the same
regime artifact, manufactured, not measured). The 1215Z
round's QUIET result was on the same-substrate 16-seed
corpus; this round's pilot is 8 seeds by prereg design
(pilot gate stopped the run), so no 16-seed reproduction
exists to re-check quietly. That is a pilot-stopped scope
limit, stated here, not a hidden gap.

## Infrastructure notes (disclosed, all repaired)

- safe-commit index-clobber (known class) hit worker commits
  on all three arms and the follow-up evidence commit
  (bogus staged deletions/modifications, worktree files
  intact); every worker repaired via update-index --cacheinfo
  from the HEAD blob, verifying contents byte-identical and
  status clean before proceeding. The commits themselves are
  correct; only the main index lied.
- Master moved mid-run under all three workers (loop B landed
  sicktele-b, tip e3491697c, plus journey r75): branches were
  rebased onto the moving tip clean (no conflicts), proofs
  re-run green on each new base, then merged sequentially
  with a rebase between merges (a merged arm moves master,
  so the next arm's --ff-only needs the fresh tip — the two
  "not possible to fast-forward" aborts during merging were
  this sequencing, not conflicts, and both recovered by
  rebase-then-merge). All three proof suites re-run green on
  the final tip (leantrade 30/30, fleepolicy 24/24,
  dissolveprobe 72/72).
- check.js --quick NOT run: zero src/js, zero policy defaults
  (dissolveprobe's and fleepolicy's policies are diag /
  gated non-default instruments; leantrade is pure corpus
  analysis), all proofs green post-merge, sibling loops live
  (concurrent-jest rule).
- Reap at closeout correctly refused sibling trees
  (sim-stashfetch-b, sim-stranded-warmth-b,
  journey-establishment — LOUD lines, left alone, never
  touched); all three of this run's trees were released as
  merged and their branches deleted. Main tree clean at
  closeout.
- Sibling activity during this run (NOT touched): loop B
  landed its 1230Z round, ran sicktele-b, and started a new
  1332Z round; journey-establishment continued. The
  dissolveprobe worker appended its own run note to
  ~/memory/2026-10-30.md (observations only); the
  coordinator's run note follows separately.

## Ranked next (NOT this run's work)

1. REFUSAL-CONFIRMATION INSTRUMENT (from dissolveprobe):
   re-run under a revised prereg with say-text capture + a
   'refusal' bracket kind + no removeWorldMonster wrap +
   claimed-set attach rule, to confirm gate text (have/need)
   on all 120 rows and re-judge substrate/bracket. Until
   then, the muster-branch identification rests on code
   elimination, and no have/need number per row should be
   quoted.
2. REFUSED-FACE ROUTING (steve-call, from dissolveprobe):
   the scholar bot re-faces the refused gate 5-12x/day while
   the pending never consumes. Is the re-facing loop
   intended pressure (go muster, then return), or should a
   refused solo face route toward mustering / stop
   re-facing until ready? No gate number moved here; this
   needs Steve's design ruling before any routing change.
   (Supersedes the 1215Z "phantom-pending lifecycle" wording:
   the pending is not a phantom — it is a refused gate.)
3. TRIBUTE-ISOLATING ARM + PANTRY/POPULATION SERIES (from
   leantrade): a recorder carrying a per-day pantry series,
   tribute-payment events, a timestamped death log, and a
   population series (villagers + joiners over time); then a
   same-seed arm with leanlink courting and tribute zeroed,
   so the cost of paying is separated from the divergence
   of courting.
4. BLOCKED-RESTORE DESIGN QUESTION (steve-call, carried and
   strengthened by fleepolicy): fled melts on a held tile
   too (now 3 natural + 1 scripted, blockers named) — and
   one natural blocker carries no lingering flag, so
   occupancy, not lingering status, blocks. Displace/queue
   when the tile is held, or is melt-while-the-siege-
   continues intended?
5. SAME-DAY -2 STEPS (minor, carried from dissolvecause):
   5 between-start steps of exactly -2 HP on s75102
   same-day pairs; source not in the scholar trace; not a
   dissolved-fight effect (and now, not a refusal effect
   either — within delta 0 stands).
6. STACK-FRAME BASENAMES (recorder hygiene, carried from
   dissolvecause): store basenames, not absolute worktree
   paths, in removal stack frames so future substrate legs
   pass raw.

## Convergence state

scale-onramp: converging, NOT converged. Full seat 0, wave 5
0 on every band in this run, as on every band this cycle.
No axis is converged. No gate number was moved on this
evidence, per the 2026-10-29 gate-sequencing note (prove
behavior normal before tuning gates to it). What converged
further is the siege plumbing, reframed: dissolved fights
are gate refusals (the in-call nulling step does not exist),
fled restores have a natural classification sample (tile
decides, occupancy blocks), and the leanlink tradeoff is
divergence plus unmeasured population dynamics, not a
starvation cost. Backlog: 1215Z ranked-next (1) and (3) now
DONE by this run (mechanism answered + policy built); the
1215Z phantom-pending wording is superseded by ranked next
#2 above. Rotation NOT advanced: the standing directive
suspends rotation until a run demonstrates national reached.
Claim retired to .DEAD; lock deleted.
