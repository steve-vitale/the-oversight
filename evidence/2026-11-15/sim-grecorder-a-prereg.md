# sim-grecorder-a — PREREG (binding)

Loop A run `fleshout-20261115T2115Z`, axis scale-onramp, arm sim-grecorder-a.
Branch `sim-grecorder-a`. Base: current master tip at run start
(worktree branch tip `d073bd656`).

## The gap (from sim-vetattrition-a, evidence/2026-11-15/sim-vetattrition-a.md)

The vetattrition DIAG went NO-GO on its frozen bar (116/139 = 83.5% <
90%) for one reason only: the G-class recorder's `deaths` rows carry no
victim identity and no veteran flag, so 23/69 vet5 drops in the
gorgeprice2 confirm corpora were unresolvable (multiple villagers die
the same day; exact-set + uniform-cause sensitivity resolved 0/23).
T-class legs classified 70/70 (100%), G-class 46/69 (67%). The
mechanism named there (scholar wild-death bleed) stands; this arm
closes the recorder gap so the bar can be judged per corpus class.

## The fix (instrument-only, no game-behavior change)

In `scripts/cascade-driver-20261115.js` (the G-class recorder that
wrote the gorgeprice2 corpora), annotate each top-level `deaths` row
post-hoc from the run's final `Game.state.waveKillLog` (a pure read,
taken after `runDays` returns):

- `vid`: the victim's villager id (`who` for kind `villager`/`person`;
  `null` for kind `monster` — a monster death has no victim villager).
- `name`: the victim's display name via `Game.getPerson` (fallback:
  the vid). Pure read.
- `veteran`: `true` iff the victim had ≥1 wave-4+ kill in
  `waveKillLog` with kill-day ≤ death-day (kills are never removed
  from the log, and a dead villager makes no later kills, so the
  end-of-run log answers the at-death question exactly — including
  pyrrhic kills, whose entry day equals the death day).
- `w4kills`: count of wave-4+ kills by the victim with kill-day ≤
  death-day. `w5kills`: same for wave-5. `maxWave`: highest wave
  among the victim's kills with kill-day ≤ death-day (`null` if none).
- Monster-kind rows carry `vid: null, veteran: null, w4kills: null,
  w5kills: null, maxWave: null`.
- Also attach the final `waveKillLog` (plain copy) to the per-seed
  output as `waveKillLog`, so future analyzers can re-derive the
  flags without re-running.

No game code changes. No shared-harness (`sim-harness.js`) changes.
The existing `deaths` fields (`day, kind, who, cause, player`) keep
their exact values — the annotation only ADDS fields, so old
analyzers keep working. The driver is the live G recorder, so later
arms inherit the fields automatically.

## Proof (before any judged leg)

`scripts/test-grecorder-a.js` — green required before the judged legs
run. It spawns two child processes per smoke seed (one harness per
process, per the repo rule) and asserts:

1. Every villager/person death row in the new-recorder smoke corpus
   carries `vid` (a string), `veteran` (a boolean), `w4kills`/`w5kills`
   (integers ≥ 0) and `maxWave` (integer or null); monster rows carry
   nulls.
2. Victim ids match the vetfirst instrument's `regDeaths` row-for-row
   on the same seeds (same day, same villagerId, same cause class).
3. Veteran flags agree with the vetfirst `vetsW4` snapshots on the
   same seeds: `veteran=true` iff the vid appears in some snapshot's
   `vetsW4.killers` with `firstDay ≤ death-day`; `w4kills` equals
   that snapshot killer's `kills` where the snapshot day is the last
   snapshot day ≤ death-day (tolerance: kills made after the last
   snapshot but on/before the death day count via the log, so the
   comparison is against the log-derived count on the vetfirst side
   too — the check is that the two instruments' log-derived counts
   agree exactly).
4. Zero instrument errors on the smoke seeds, and the annotated rows'
   original fields are byte-identical to the raw `samples.deaths`
   rows (annotation adds, never rewrites).

## The analyzer (new, v4 logic for G corpora)

`scripts/vetattrition-analyze-grecorder-20261115.js` — same vet5-drop
definition as the v3 analyzer (drops between consecutive `series`
rows; closed window `[prev.d, cur.d]`, proven correct in the DIAG),
but attribution uses the new fields instead of candidate counting:

- For each drop of magnitude `m`, collect the veteran death rows
  (`veteran === true`, kind villager/person) in the window.
- `k === m` (and `m ≥ 1`): CLASSIFIED — each veteran death
  attributed to its own row (vid, day, cause class per the v3 cause
  table: WILD / W5-ERA / PRE-W5-ERA / ARENA / CONTEST / AMBUSH /
  ROAD-EXPEDITION / OTHER:<cause>).
- `k === 0`: NON-DEATH-EXIT (unclassified; investigated as in v3).
- `k !== m` and `k > 0`: AMBIGUOUS (unclassified; partial
  attribution listed, never guessed).
- A drop is never classified from a non-veteran death row. The
  frozen gorgeprice2 corpora are NOT re-scored (they lack the
  fields); the v3 numbers stand as that arm's judgment.

## Fresh legs (judged)

Re-run the gorgeprice2-confirm setup on a FRESH band with the new
recorder — one leg only:

- **Setup:** `scripts/cascade-driver-20261115.js`, 16 seeds,
  150d, policy `competent-answercourt-b`, `RUN=grecorder-a`,
  `OUTDIR=perseed-grecorder-a`.
- **Band:** 100541–100556 (freshness check below).
- **Game behavior:** current master. The lingerer guard
  (`if (m.lingering) return;` in `monsterTurn()`) is ON in this
  master, so this leg reproduces the gorgeprice2-confirm ARMED leg's
  game behavior. The control leg (guard reverted) is NOT re-run:
  this arm judges the recorder, not the lever, and reverting game
  code for a control would answer a question nobody asked. The
  gorgeprice2 CONFIRM GO stands as its own judgment; nothing here
  re-judges it.
- **No T-class legs:** the cascade driver writes G-class corpora
  only. The prereg's T-class clause is therefore vacuous for this
  arm; T stays at its frozen 70/70 (100%) from the DIAG and is
  reported separately, never pooled into the G bar.

## Frozen bar (per the vetattrition metric review's proposed revision)

Judge the bar PER CORPUS CLASS — this is the revision the DIAG's
§12 proposed for the NEXT run, adopted here, frozen before any
judged leg:

- **GO iff the fresh G corpus classifies ≥90% of its vet5 drops**
  (classified / total drops, per the v4 analyzer above), with 0
  instrument errors and complete per-seed tables.
- T-class is reported separately (frozen 70/70 from the DIAG); the
  two classes are NEVER pooled into one bar.
- A miss is NO-GO even if the mechanism looks confirmed. A
  NO-GO here means the recorder still cannot close the residue, and
  the next step is a recorder revision, not a re-argument.

## Seed-band freshness (per local_seed_band_freshness)

- **Chosen band: 100541–100556** (16 seeds).
- **Search scope:** every `*.md` under `evidence/` (all dated
  preregs, evidence notes, screens and extension bands — 504 distinct
  seed numbers of the form 100xxx/190xxx collected), plus the goal
  `hidden_files/` band mentions.
- **Result:** 100541–100556 appears NOWHERE (nearest named bands:
  100521–100536 gorgeprice2 confirm, 100501–100508 gorgeprice2
  pilot, 100601–100608, 100621, 100636, 100641–100648). The band is
  FRESH. Never reuse 100521–100536, 190391–190398, 190621–190628,
  190631–190638.
- If a later search finds this band named earlier, this prereg is
  corrected by a correction commit naming the missed source.

## Wall numbers (reported every run, not judged)

national / table / wins, wave 4–5 unlocks, median survival — read off
the fresh G corpus and reported in the evidence file.

## Telemetry note

Recorder corpora are compared with sweep-compare tables, never
against a run baseline. If `scripts/telemetry-check.js` REFUSES the
corpus, record the refusal; never roll the baseline.

## Metric review (placeholder — filled in the evidence file)

- Whether the ≥90% per-class bar was the right bar.
- Whether any drop stayed AMBIGUOUS under the new fields, and why.
- Whether the post-hoc (end-of-run log) annotation ever disagreed
  with a live reading.
