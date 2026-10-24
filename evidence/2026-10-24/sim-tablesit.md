# sim-tablesit — table-first posture after national (scale-onramp axis)

Run: sim-tablesit, worktree `sim-tablesit`, branch `sim-tablesit`.
Axis: scale-onramp (standing directive: the scale wall is the blocking
axis until the tracker records it converged; tracker state at run start:
scale-onramp converging, NOT converged — national/table reach real on
current substrate, wins 0 everywhere structural pre-seat).
Sibling arms NOT touched: sim-rerunclock, sim-doorready (loop-A arms),
loop-B food-economy files (keepceil/pdvalue/pddrift). Zero src/js
changes in this arm — policy-side only.

## Canon read first

- docs/CANON.md (manifest; read first per brief).
- docs/TABLE.md (the table contract): the table PRICES the run, never
  gates on godhood; the full seat keeps the national bar, the lesser
  seat is priced without national (waves 4/4/3 distinct, 2+ contests
  survived, 2+ crises, stage ≥ 3). Table sanctity: when the table sits,
  ambient monster pressure suspends. The seat is taken from Haven
  (2026-10-14: "Table seat is a Haven option, not a morning prompt").
- No canon doc covers "waiting on the table" as a policy posture —
  this arm's seat/wait behavior is a policy choice, not canon, and is
  documented as such in scripts/policies/tablesit.js.

## PRE-REGISTRATION (binding, written before any sweep)

- Question: once a village reaches national, does prioritizing the
  table (take the seat when invited; wait at Haven while invited)
  over further expansion/wave pursuit/new links extend survival and
  hold table reach, versus the competent baseline?
- Baseline: scripts/policies/competent.js, unmodified, default env.
- Armed: scripts/policies/tablesit.js — competent wrapped with
  (1) seat drive gated on rank national+ (preview ready → take seat,
  then answer table choices first-option, bounded, stall-guarded) and
  (2) wait discipline gated on national+ + tableWaiting (end the day
  at Haven). Before national the wrapper is read-only.
- Horizon: 180 loop-days, death-aware — dead villages stop (runDays
  breaks on Game.over); no fixed 200d. Rationale: the scale wall
  plays out at 100–180d (recent wall corpora median 131–151d); 180d
  covers the door window without simulating dead villages.
- Seeds (pilot): 71101–71108 (8 seeds). Freshness verified before
  sweeping: grep for `71101` over scripts/ and evidence/2026-10-24/
  returned zero hits (bands in recent reviews: 655xx, 665xx, 690xx,
  701xx, 703xx, 708xx, 925xx, 928xx — 711xx unused).
- Policies: competent vs tablesit, identical seeds, one shared run of
  scripts/test-tablesit-sweep.js (own loop over sim-harness
  loadGame/setupGame/runDays; sweep-compare.js's registry is closed
  to new policies, so the instrument reuses its snapshot conventions
  — max rank/arc, ever-table, ever-entered, result.days median).
- Primary metric: median survival in result.days (sweep-compare
  convention; gameDays medians reported alongside).
- GO BAR (binding, from the brief): armed median survival >=
  baseline median survival + 15 days AND armed table reach (invited
  ever) not lower than baseline. A miss is NO-GO, never re-scored
  mid-run.
- Proof gates: G1 det-gate (TABLESIT=0 delegation byte-identical to
  competent, one seed, separate mode); G2 pre-national delegation
  (seeds where neither arm reached national must have identical
  days/gameDays — the wrapper is read-only before national);
  G3 corpus integrity (16/16 rows, days > 0, counters present).
- Landing rule: GO → policy file lands as its own commit. NO-GO →
  policy file deleted, only instruments + evidence land.
- Known vacuous leg (declared up front, not discovered mid-run):
  competent's daily proposes no links, so the "no new links" leg has
  nothing to suppress against this baseline; the operative legs are
  seat + wait. Competent's fight handler is inherited unchanged
  (a joined fight is survival, not expansion).

## Results — PILOT NO-GO (killed at pilot, no confirm spend)

Sweep: scripts/test-tablesit-sweep.js, seeds 71101–71108, 180d
death-aware, 16 configs. Corpus:
evidence/2026-10-24/sim-tablesit-pilot.json (final write, not
partial — the sweep ran to completion; the earlier first attempt
died silently mid-run with its session, no corpus written, and was
re-run from scratch with per-config incremental writes).

| policy | n | won | median days | median gameDays | max days | national | table invited | entered | wave 4 | wave 5 |
|---|---|---|---|---|---|---|---|---|---|---|
| competent | 8 | 0 | 120 | 120 | 180 | 0/8 | 0/8 | 0/8 | 3/8 | 0/8 |
| tablesit | 8 | 0 | 120 | 120 | 180 | 0/8 | 0/8 | 0/8 | 3/8 | 0/8 |

GO bar: armed median 120 >= baseline median 120 + 15 = 135? NO.
Second leg (armed table 0 >= baseline table 0) passes, but the bar
is conjunctive — VERDICT: NO-GO.

Per-seed (days, identical both arms on all 8 seeds): 71101: 26
(village-lost, wave 1); 71102: 149 (village-lost, wave 4); 71103: 53
(village-lost, wave 2); 71104: 117 (village-lost, wave 4); 71105: 180
(survived to cap, wave 3); 71106: 180 (survived to cap, wave 3);
71107: 120 (village-lost, wave 4); 71108: 82 (village-lost, wave 3).

Proof gates: G1 det-gate PASS (TABLESIT=0: competent 26d =
tablesit 26d, seed 71101; re-run PASS after the inline refactor).
G2 pre-national delegation PASS — all 8 seeds comparable (neither
arm ever reached national) and all 8 pairs byte-identical, not just
on days/gameDays but on deaths, final population, final pantry, and
final known-plants (see corpus rows). The wrapper is provably
read-only before national. G3 corpus integrity PASS (16/16 rows).
Armed counters across the pilot: seat attempts 0, seats taken 0,
wait days 0, wait returns 0 — the trigger never fired on any seed.

## Wall numbers (this pilot)

national 0/16, table invited 0/16, entered 0/16, wins 0/16,
wave-4 unlocks 6/16 configs (3/8 seeds), wave-5 unlocks 0/16,
median survival 120d (both arms), max 180d (cap survivors 2/8
seeds). Arc reach: max arc 3 on all 16 configs.

## Reachability verdict

Against the competent baseline on this band, the scale wall sits
BEFORE national, not after it: no village reached regional, let
alone national, so a posture that activates at national cannot
move anything. Waves 1–4 are reachable (wave 4 on 3/8 seeds); wave
5, Arc IV's table invitation, regional, national, and the win flag
are all unreachable here — not because tablesit failed to drive
them, but because competent never opens the door they sit behind.
This is a trigger-placement finding, not a mechanism finding: the
seat/wait mechanism itself was never exercised (0 attempts), so
this run says nothing about whether seating-after-national would
help a village that actually gets there. The recent postunlock2
corpus (national 18/32 on the lead/belong + full substrate) shows
national IS reachable on other substrates — the gap is the
baseline, not the game.

## Village assessment (plain words)

Eight villages, all stuck at village rank, all living or dying by
combat. The long-lived ones (71105, 71106 — both survived to the
180d cap with pantries of 24k and 17k kcal and 69–76 known plants)
look like real going concerns: gardens, fishing, mastery, feasts.
The short ones die fast and violently: 71101 gone by day 26 with
starvation in the mix; 71108 by day 82 with sickness, thirst, and
starvation alongside combat. Combat dominates the death ledger
everywhere (villager combat + player combat + ambush + expedition
deaths dwarf starvation on 7/8 seeds). Nobody thrived by scaling —
the villages that lasted did so by holding the home ground, not by
climbing: 0 links, 0 regional steps on any seed. The blank this run
fills is precise: for a competent player, "after national" is a
place that never arrives, so any post-national lever is dead on
arrival against this baseline. The next question belongs before
national, not after it.

## Sense-testing transcript read (NON-MEASURED replay, seed 71102)

Replay: evidence/2026-10-24/sim-tablesit-sense.txt (narration
shifts trajectories — census death d149, replay death d135 — so
this read judges meaning only, never numbers). VERDICT: PASS with
two notes.

What reads as people: the mantle chain. Brian Otieno dies to the
Eulogy, and the village stops — "Somebody screams. Somebody else
starts digging." — then Tashi Sherpa (arborist, Bloodhound, Lucky
Rock), then Oliver Ebbesen (nurse, Green Whisper), then Lena Ruiz
(ER nurse), each with the heavier line: "You knew Brian — not the
office, the person. The fire keeps expecting him, and so do you."
Keepsake channeling lands ("You hold Notebook. Breathe. The
shaking eases. (−6 trauma)"). Funerals are communal ("they bring
Victor home... the grave is dug by the fire"). At d135 dawn, with
the pantry empty, the village voices a real choice out loud —
half rations, a hard hungry hunt, or a second-shift rally — and
the relief moment is open for ~3 days. That is a village
deliberating, not a meter ticking.

Note 1 (repeated, robotic): the Eulogy's five verses repeat
verbatim across three successive scholars in a single day ("and
then they stood their ground, poor brave fools" → ran → bled →
knelt, identical wording each time). The fight mechanics differ
(Crowbar vs Hatchet damage), but the monster does not adapt its
story to the new bearer. Same class as the chair-eats-bearers
pattern the vetautopsy arm named: the chair, not the monster, is
the casualty — three scholars in one day, then extinction.

Note 2 (blank documented, not chased): the d135 relief beat
(ration/hunt/rally) is never answered by the policy — competent
has no relief-answering leg. The village asks, the player walks
past. That is a candidate arm for a future run, not this one.

## Metric review (for the NEXT run, not re-scored here)

1. The GO bar's +15d median leg is unmeasurable when the trigger
   never fires — but that is the finding, not a flaw to patch
   mid-run: a post-national lever against a never-national
   baseline is inert by construction. The bar correctly killed it
   at pilot instead of burning a 12–16-seed confirm on identical
   trajectories.
2. The national gate is stricter than the engine: docs/TABLE.md
   prices a LESSER seat without national (waves 4/4/3, 2+
   contests, 2+ crises, stage 3). A follow-up arm could gate the
   seat drive on tableWaiting itself (any rank) instead of
   national+ — that tests seating where invitations actually
   occur. It would need its own pre-registration; it is NOT what
   this arm tested.
3. Median-days on result.days vs gameDays agreed exactly (120/120)
   on this band; either is fine as the primary next time.
4. No panel (§15) built: a panel compares before/after on a
   change, and there was no change — both arms identical. A panel
   of identical corpora would be theater, not measurement.

## Blanks filled or documented

- FILLED (by killing): post-national table-first posture against
  the competent baseline — inert, trigger never fires, killed at
  pilot with proof (16/16 identical configs).
- DOCUMENTED (not chased, per the findings-backlog rule): (a)
  seat drive gated on tableWaiting-any-rank as a follow-up arm;
  (b) Eulogy verse repetition across successive bearers;
  (c) competent never answers the village relief beat
  (ration/hunt/rally) when the pantry empties.
- POLICY FILE DELETED per the kill rule:
  scripts/policies/tablesit.js removed from the worktree; the
  tested logic survives inline in scripts/test-tablesit-sweep.js
  so the NO-GO stays reproducible. Landed here: instrument +
  evidence only, zero src/js, zero sibling-arm files touched.

## Infrastructure notes (loud, for the coordinator)

- First pilot attempt died silently mid-run: its background
  session vanished with no corpus and no completion notice.
  Recovery: re-ran from scratch with per-config incremental corpus
  writes (now in the instrument) — the completed corpus is the
  second run's, complete and final (partial flag absent).
- safe-commit index-clobber watch: verify `git status` +
  `git show --stat` after the commit (see coordinator landing
  checklist); no clobber observed in this worktree yet.
