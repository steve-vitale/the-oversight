# sim-partyfinish-band-a — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261028T1528Z. Axis: scale-onramp
(the blocking axis). Worker: sim-partyfinish-band-a. Worktree:
`~/workspace/worktrees/sim-partyfinish-band-a` (branch
sim-partyfinish-band-a). Base: master at worktree creation
(includes the landed partyfinish mechanism + driver from
sim-partyfinish-a and the 1415Z censuses).

## Canon read first

- docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; "Monster
  encounters are fought, not rolled", Steve 2026-10-08 — every
  fight below is a real blow-by-blow fight, never an outcome
  table; wave 4 is the Mirror Draft, standing-gated, with the
  readiness bars in standing.js naming armored/armed/tricks/
  veterans as live village state) and docs/PARTY.md (parties are
  a System unlock; party members auto-join fights; trust is not
  a safety gate).
- No canon invented. This arm changes NO canon doc, NO gating
  number, NO deed bar, NO wave-unlock number, and does not
  touch TABLE.md.

## Task (verbatim scope)

The 2026-10-28 1415Z run's named next blank (1): a PARTYFINISH=1
band on wave-4-facing seeds. The partyfinish driver landed on
master; the 1415Z re-census over the PARTYFINISH=0 control
corpus found conversion still dormant by construction (zero
sortie rows, tableseat-nowait has no sortie call, engine
default 'endure'). This arm measures the driver itself,
switched ON.

## Measurement-only constraint (binding)

Verify PARTYFINISH is an existing default-OFF policy/driver
flag and use it as such. PARTYFINISH is read ONLY from the
environment in scripts/policies/partyfinish.js (`layerOn()`:
env PARTYFINISH === '1', otherwise '0' = pure delegation to
tableseat-nowait verbatim). Do NOT flip any game default, do
NOT change src/js defaults, and if the driver turns out to
require a game-code change, STOP and report that to the
coordinator instead of building it. Zero src/js changes
expected. The cornered-party mechanism it drives already
landed (fieldFights.js `opts.cornered`, havenGrowth.js
lingerSortie); this arm only switches the existing driver on.

## Substrate (verbatim from the 1415Z run)

- Seeds 75101–75108, scripts/policies/tableseat-nowait.js
  verbatim, wrapped by scripts/policies/partyfinish.js with
  PARTYFINISH=1 (armed band only; the control is the 1415Z
  PARTYFINISH=0 corpus, not a re-run).
- Env: LEANLINKRESCUE=1, TABLESEATNOWAIT=1, recorder stack on
  both sides (RAFTDRAFT, SPAWNSRC, OLDCORE, W5BIRTHS, DEFWOUND,
  NONWORLDKILL, TBDMG, W4DMG, PARTYDIAG).
- Horizon 180d DEATH-AWARE (runDays stops on death/win; 180
  is the cap, not a fixed horizon — MEASUREMENT §10).
- Sweep instrument: scripts/test-partyfinish-sweep.js
  (existing, unedited) with EVID pointed at the NEW corpus
  dir evidence/2026-10-28/perseed-partyfinish-band-a/ —
  never into perseed-partyfinish-a/ (that dir holds the
  landed partyfinish-a control/armed corpora and must not be
  mixed with this band).
- Census instrument: scripts/test-partyfinish-band-a.js (new
  this arm; copy of scripts/test-w4convert-postparty.js with
  ONLY the corpus path, the control cross-check target, and
  the verdict legs changed, plus the party-size extension
  below). It re-censuses the control corpus with the SAME
  definitions as a self-check.

## Baseline (1415Z, PARTYFINISH=0, from sim-w4convert-postparty)

Control corpus: evidence/2026-10-28/perseed-w4convert-postparty/
(8 rows + summary.json + analysis.json), cross-checked exact
against the partyfinish CONTROL corpus in the 1415Z run
(44/21/21/2 reproduced exactly). The 1415Z "16 configs" are
the two 1415Z arms' corpora, which agree exactly on wall
numbers; the census numbers below are the w4convert-postparty
census.

| measure | baseline |
|---|---|
| wave-4 universe / faced / engaged | 44 / 21 / 21 |
| wave-4 KILLED | 2 |
| field faced/engaged/killed | 11 / 11 / 0 |
| raid faced/engaged/killed (drafted-only) | 16 / 2 / 0 (9 drafted-only) |
| TB faced/engaged/killed | 14 / 14 / 2 |
| never-met / met-no-kill | 23 / 19 |
| demand-met | 2 / 50 fights (4%) |

Wall (baseline band): national ever 7/8, final 6/8; table
invited 4/8, entered 3/8; wins 3/8 (all lesser, full seat
0/8); wave-4 reach 6/8, wave-5 0/8; median survival 146d;
deaths 286; starvation 1 (75108).

Baseline party split of the 2 kills (fight-record verified
BEFORE this prereg, from the control corpus's tbEnd fighter
lists — this is the operative reading; the 1415Z coordinator
text loosely called both kills "scholar-led TB-party kills",
but the demand arm's fight-level split is the precise one):

- 75102 d172 Reunion: winning TB fight has exactly 1 human
  fighter (the scholar, Olivia Bennett at the time) — SOLO.
- 75108 d95 Suburb: winning TB fight has 2 human fighters
  (scholar Ines Duarte + villager Ruth Goldstein) — PARTY.

So baseline party kills = 1 of 2; solo kills = 1 of 2.

## Primary metric + GO threshold (binding — judge exactly this)

Primary metric: wave-4 KILLED count on the 8-seed pilot band,
counted by the w4convert census definitions (per-instance
universe, faced/engaged/killed, channel split field/raid/TB,
unclassified 0, vanished 0 required for a judged verdict).

Mechanism metric: party-kill share — kills whose killing
fight had ≥2 fighters, scholar-solo excluded. Operational
definitions, fixed here before judging:

- TB kill: party size = number of tbEnd fighters with kind
  'player' or 'villager' in the WINNING fight (the tbEnd whose
  monster fighter is dead, not fled). ≥2 = party kill;
  exactly 1 = scholar-solo kill.
- Field kill (vKill row): party size = the partyfinish-diag
  fight row's partySize for the same day+seq, else the
  fieldFight row's allies+1. ≥2 = party kill; 1 = solo.
  Sortie field kills are party kills by construction
  (sorties muster ≥2), but the row must still show it —
  a claimed sortie kill with no pf row is unattributed,
  never assumed party.
- Raid kill (none in baseline): party size = the raid row's
  raiders count. ≥2 = party kill. Recorded if it occurs;
  no raid kill is expected.
- A kill whose killing fight cannot be joined to a party-size
  record is reported as unattributed and counts toward
  KILLED but NOT toward party kills.

GO (all legs must pass; a miss on any leg is NO-GO, never
re-scored against a friendlier metric mid-run):

1. KILLED ≥ 4 (vs 2 baseline — a doubling, not a wobble).
2. ≥ 1 non-solo party kill among the band's kills.
3. Cost bar clean, BOTH parts: starvation deaths ≤ control
   total + 2 (≤ 3) AND arm-only deaths (seeds that die armed
   but survived/won on control — read off the per-seed wall
   comparison) carry starvation ≤ 2; median survival ≥ 0.8 ×
   control median 146d, i.e. ≥ 117d (median of the 8 pilot
   days, same medianOf as the sweep summary).
4. Census validity: 8/8 rows, every recorder errs 0, no
   overflow, unclassified 0, vanished 0, control re-census
   with the same definitions reproduces 44/21/21/2.
5. Driver-on proof: pfSortieCalls > 0 on the band (the
   driver actually fired; a KILLED move with zero sortie
   calls is base drift, not a driver effect, and must be
   reported as such).

If GO, confirm on a FRESH 8-seed holdout band (seeds
verified fresh against dated evidence filenames FIRST —
no seed band already used in evidence/2026-10-28/ on this
substrate) before claiming anything. If the pilot fails
the sniff test (KILLED ≤ baseline, or zero sortie calls,
or zero party kills with no plausible mechanism trace),
KILL FAST: no 12–16-seed confirm, no holdout, report NO-GO.

## Wall numbers reported every run (never pooled with baseline)

National ever/final, table invited/entered, wins
(lesser/full split), wave-4 reach, wave-5 reach, median/max
survival, death-cause shares, starvation deaths, per-seed
ends. Wall numbers come from the sweep summary rows, not
from the census analyzer's cross-checks.

## SENSE-TESTING (non-measured, wording only)

scripts/test-partyfinish-band-a-sense.js (new this arm;
adaptation of scripts/test-partyfinish-sense.js): replay the
band's most-faced seed with PARTYFINISH=1, capture sortie /
muster / treeline lines, and read them for meaning — what
the party did, whether the muster judgment reads like
people deciding under risk, whether any line overclaims
(promises a kill, hides the ration cost, hides the risk).
Sense text NEVER enters any count. The evidence file quotes
the lines read and the judgment, not just counts.

## Balanced panel (§15) + metric review (§14)

scripts/balance-panel.js compare requires --before/--after
panel.json.gz files built from live roots; it has NO
corpus-ingest mode for a single-arm census corpus (standing
exception, confirmed in the partyfinish-a and 1415Z runs;
this run re-checks its usage output once and does not fake
an artifact). The paired control/armed census tables on
identical seeds/substrate/recorders, with policy the only
difference, are the §15 substitute and the judged record.
Every evidence file carries a "metric review" section; a
metric that proves wrong is written there and revised for
the NEXT run, never re-scored mid-run.

## Detgate (proof, not a judged leg)

scripts/test-partyfinish-sweep.js --detgate (SEED=75101):
plain tableseat-nowait vs recorder-stack-over-partyfinish
with ALL guards off must match on days/gameDays/ts, with no
diag surface, no pf surface, no wraps installed. Run BEFORE
the judged band; a FAIL stops the run for investigation,
it does not get folded into GO.

## Commit order (binding)

1. This prereg, committed BEFORE any judged sweep.
2. Corpus (8 rows + summary.json) + analyzer + sense script.
3. Evidence file sim-partyfinish-band-a.md.
No push, no bump, no live verification — report 'ready for
coordinator merge, pending ship' with branch + hashes.
Measurement only: no [needs-eyes] unless a feel/combat/UI
change lands, which this arm must not produce.
