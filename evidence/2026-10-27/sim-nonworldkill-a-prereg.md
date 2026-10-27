# sim-nonworldkill-a — PRE-REGISTRATION (run fleshout-20261027T0525Z, axis scale-onramp)

DIAG / MEASUREMENT ONLY: zero src/js changes, no default flips, no game
lever, no narration change. At most, the final evidence specifies what a
future fix would need to show (marked as specification, not a proposal).

## Canon read first

- docs/CANON.md, docs/MONSTER-WAVES.md: wave 4 = The Mirror Draft,
  gate village standing >= 100 (blood / bonds / bread, hybrid allowed);
  the Strike is a wave-4 Mirror Draft monster (house-sized inflatable
  rat; it shuts the grid down); wave-4 readiness gate (wave 5's demand
  is 4 armored @ P>=15 / 6 armed / 3 tricks / 2 living wave-4 killers —
  veterans read from state.waveKillLog, living-filtered).
- Context: evidence/2026-10-25/sim-w4funnel-a.md (the 2015Z run's named
  next blank) and its census control table (copied field-by-field
  below — read from that file, not from memory).

## Duplicate-run disclosure (written before sweeping)

This arm was already completed once: evidence/2026-10-25/
sim-nonworldkill-a.md, commit acbc0c933 ("TB initiation census
DIAG-GO — band's only wave-4 kill came through feast-draw (73678
d115 strike); zero src/js diff"), already merged into master.
The coordinator re-registered this same worktree/slug on
2026-10-27T05:20:07Z for run fleshout-20261027T0525Z, so this run
RE-MEASURES on the current base rather than assuming the October 25
answer still holds. The control gate below is therefore load-bearing:
if the base moved, the delta is reported field-by-field before any
verdict is judged, and a moved headline baseline is itself a
DIAG-NO-GO gap (see verdict rule). No numbers from the October 25
run are carried into this run's verdict; they are a comparison
point only.

## Band (fixed before sweeping)

- Seeds 73671–73678, tableseat-nowait policy with LEANLINKRESCUE=1
  and TABLESEATNOWAIT=1, 180d death-aware horizon (180 is the cap;
  runs stop on death/win).
- Sweep: scripts/test-nonworldkill-diag-sweep.js, run VERBATIM
  (never edited), with EVID pointed at this run's own corpus dir
  (below) — the script's own evidDirOf() reads process.env.EVID.
- Analyzer: scripts/test-nonworldkill-diag.js (existing).
- Proof test: scripts/test-nonworldkill-a.js (existing; run over
  this run's corpus and report the pass count).

## Control check (w4funnel census control, field-by-field)

The armed band must reproduce the published control band EXACTLY
on every headline, or the run stops judging and reports the
deviation. Headlines (from sim-w4funnel-a.md's control gate):

| field | control value |
|---|---|
| raids | 85 |
| raiders | 361 |
| deaths | 234 |
| national-ever | 7/8 |
| national-final | 6/8 |
| table invited | 4/8 |
| table entered | 4/8 |
| wins | 4/8 |
| median survival | 135d |
| wave-3 reached | 8/8 |
| wave-4 reached | 6/8 |
| wave-5 reached | 0/8 |
| starvation deaths | 5 |
| pool total | 1,494 |
| pool wave-3+ | 107 |

Per-seed trajectories (control, for field-by-field comparison):
73671 survived 180d 16/74; 73672 won lesser d97 7/28; 73673 won
lesser d124 7/30; 73674 survived 180d 14/65; 73675 won lesser
d135 13/56; 73676 village-lost d70 7/28 starv 4; 73677
village-lost d143 12/45; 73678 won lesser d116 9/35 starv 1.
Any delta is reported field-by-field in the final evidence
BEFORE the verdict section is judged.

## Instrument (record-only verification, done before sweeping)

- Reused VERBATIM (never edited): scripts/policies/raftdraft-diag.js,
  spawnsrc-diag.js, oldcore-diag.js, defwound-diag.js,
  w5births-diag.js — the exact w4funnel composition.
- One new instrument (already in-tree, reused verbatim, never
  edited): scripts/policies/nonworldkill-diag.js (NONWORLDKILL=1).
  It wraps startCombat ONLY (plus tbEnd for the waveKillLog
  delta join) and records, per TB fight: caller context (feast
  draw / tent intruder / door-flee re-engage / trap / world bump
  / contest / other, derived from the call stack plus the pending
  state that names it), world origin presence (world monster
  id/tile, or null), and fight outcome including kills with
  monster identity and birth/removal linkage where available.
- Record-only verification (read the code path before sweeping):
  the wrapper pre-records from pure reads only (Game.state /
  Game.worldMonsters() by tile — it NEVER calls playerMonster(),
  which could adopt a detached alias and mutate state); it
  delegates to the original startCombat/tbEnd, records AFTER
  delegating where it matters, writes only to its own store
  arrays, draws no RNG, never throws into the engine (recording
  errors are counted; an engine throw is recorded and rethrown
  unchanged), and returns the original value untouched. The
  wrapper is installed OUTERMOST (last in the composition), so
  its stack sees the true caller. Corpus goes to this run's own
  dir: evidence/2026-10-27/perseed-nonworldkill-a/ — never /tmp,
  never another run's live filenames.

## Question

The non-world TB kill funnel: which initiation path produced the
band's only wave-4 kill (seed 73678, day 115, a TB kill with null
world origin matching NO world arrival), and how many veterans
does that channel produce band-wide? W4funnel showed wave-4 kills
are a KILL shortage (11 arrivals, 9 never fought), so this channel
matters: if kills happen off-world, the funnel accounting is
incomplete.

## Verdict rule (binding; judged only against this header)

DIAG-GO iff ALL of:
  (a) the control gate above reproduces EXACTLY on every headline
      (any headline delta = DIAG-NO-GO with the delta named);
  (b) every wave-4 kill in the band is assigned an initiation
      channel (unclassified count 0 — `other` rows counted and
      investigated, never hidden; refused / thrown / table-trial
      calls counted separately and are NOT initiations);
  (c) the non-world channel is characterized: count + veteran yield
      by channel, including whether a 73678-day-115-type kill
      (null-origin wave-4 TB kill) recurs on this band.
Otherwise DIAG-NO-GO with the gap named. A miss is NO-GO, never
re-scored mid-run against a friendlier metric. The final evidence
carries a "metric review" section (docs/MEASUREMENT.md §14).
Balanced-panel note (standing, carried): scripts/balance-panel.js
cannot ingest per-seed recorder corpora — the sweep-compare table
+ analyzer output are the comparison of record, and
telemetry-check is NOT run on recorder rows.

## Sense plan

Read at least one TB-fight initiation context around a kill from
this run's corpus and judge in the final evidence whether it reads
sensibly in-fiction (SENSE-TESTING LAW: sensical, not just
functional). Non-measured narration replays, if any, never enter
any count.
