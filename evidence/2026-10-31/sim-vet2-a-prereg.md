# sim-vet2-a — PRE-REGISTRATION (written BEFORE any judged sims, 2026-10-31)

Run: Loop A worker, axis scale-onramp, run fleshout-20261031T1535Z.
Arm type: DIAG ONLY — measurement, zero src/js changes, zero
policy-default flips, zero edits to existing policy files, no gate
threshold or demand number moved. The deliverable is the instrument
+ census + verdict; no lever fix is built in this arm.
Backlog item: "WAVE-5 WALL, MEASURED" (sim-wavegate-a,
evidence/2026-10-31/sim-wavegate-a.md, backlog item 3 there).

## Question

Wavegate found 0/19 wave-5 unlocks on its base. On its 10 national
wave-4 seeds the end blockers were DEFER5 6/10 (veterans 0–1 vs
demand 2) and W4-FACED 3/10 (wins within days of wave-4 unlock);
max veterans observed 3 on 87115, 2 nowhere else at end. The
tracker's next question, judged here: is veterans-2 reachable at
all on this stack, or does w4-faced + defer5 make wave 5 a
post-win curiosity? This arm answers with trajectories, not
endpoints: when (if ever) a village holds 2 living wave-4+
killers, how long that state lasts, what kills it (veteran
deaths), and whether a replacement ever reaches veteran status —
before the win/table day that censors the road.

## Gate model (code canon, read before sims — not invented)

- docs/CANON.md + docs/MONSTER-WAVES.md (Wave 4: Standing >= 100;
  Wave 5: Standing >= 200 AND wave-4 faced) + src/js/standing.js
  waveCombatReadiness() + src/js/game.js recordWaveKill() /
  unlockedWave().
- Wave-4 demand (standingCfg readyDemand[4]): armored 3 @ P>=10,
  armed 5, tricks 3, veterans 1 (living roster member with a
  wave-3+ kill in state.waveKillLog). Wave-5 demand
  (readyDemand[5]): armored 4 @ P>=15, armed 6, tricks 3,
  veterans 2 (wave-4+ kills). Peak ratchet: once a wave
  releases, the gated total never drops below its threshold.
- Veteran (gate definition, standing.js): a LIVING roster member
  with a wave-(w-1)+ kill in state.waveKillLog. Vet4 = wave-3+
  kill; vet5 = wave-4+ kill. A dead killer is NOT a veteran for
  the gate (VETSHAPE off = pristine behavior; this arm does not
  set VETSHAPE).
- Kill choke point: recordWaveKill(monsterId, killerVid, via,
  detail) writes one waveKillLog entry {d, mid, w, by, via,
  trick} per kill (exact-duplicate dedupe, 1000-entry cap).
  Every real kill path flows through it (player TB, villager
  field fights, contests, aid-crisis, sorties).

## Attribution rule (sim-compchan correction, 2026-10-18 — binding)

Key kills by KILL-TIME scholar/villager identity, NOT by
end-of-run keying. End-keying inflated companion kills (2/3
sampled were old-scholar kills pre-succession). This arm
implements kill-time keying TWO ways and cross-checks them:

1. EXACT CAPTURE (authoritative): the sweep wraps
   Game.recordWaveKill AND Game.recordPyrrhicKill after loadGame
   (both waveKillLog writers — see Amendment) and records, per call,
   {day, mid, wave, by, via, scholarVidAtCall} into an external
   store (no game-state writes, no RNG draws, call-through
   with identical arguments inside try/catch). ScholarVidAtCall
   = Game.villagerId at the call (cross-checked against
   state.scholar.villagerId; a mismatch is flagged, never
   smoothed).
2. DAILY CENSUS JOIN (killtime method, 2026-10-21): the vet2
   policy layer records the scholar vid on every daily row;
   the analyzer joins each waveKillLog entry (d, by) against
   the scholar vid of the latest daily row with day <= d
   (initial scholar vid captured after setupGame covers days
   before the first daily row).

Kill-time scholar kill: by === 'player' (the game's own scholar
TB tag) OR by === scholarVidAtCall. Kill-time villager /
companion kill: every other by. Scholar vs companion kill
share is reported separately for wave-3+ and wave-4+ kills.
A capture-vs-log mismatch (deduped capture ledger vs final
waveKillLog multiset) or a capture-vs-census disagreement on
any kill is reported as a finding, not smoothed; the exact
capture wins on disagreement (it is taken at the kill moment).

## Base pin

- Worktree HEAD at prereg time:
  9f22a0838928e68340f42325d9e4951e219d94bc (sim-scale-onramp
  round-1415-a coordinator evidence). This base is NEWER than
  the wavegate sweep anchor (4c92bbb04); the interval includes
  src/js changes (lootabilities Arm 6 villager self-craft).
  Trajectories on the same seeds may therefore differ from the
  wavegate census. This arm judges ONLY its own corpus on THIS
  base; wavegate numbers are quoted as prior-base context,
  never as current data. Wavegate's DEFER5 / W4-FACED labels
  below are SEED-SELECTION labels from its base, not assumed
  outcomes on this base — each seed's own-base end blocker is
  re-measured from this arm's wavegate rows.
- This arm REUSES the wavegate stack and recorder (policies/
  wavegate-diag.js, WAVEGATE=1) so its own-base end blockers
  are computed by the same derivation, plus the NEW vet2
  recorder (policies/vet2-diag.js, VET2=1) outside wavegate.

## Seed plan (fixed now; no band-shopping)

- Band: the wavegate judged band, exactly (19 seeds) — reused
  for seed comparability, re-measured for a NEW quantity
  (veteran trajectories, never measured on these seeds).
- Pilot (8): DEFER5 seeds 87115, 87123, 87132, 87134 +
  W4-FACED seeds 87120, 87121, 87126 + one road seed 87127.
  The road seed is fixed here as 87127 because it is the only
  BELOW seed on the wavegate base and a cap survivor — the
  most informative road case. This choice is made BEFORE any
  sims in this arm and is not revisited.
- Confirm (11, = all remaining wavegate band seeds): 87103,
  87104, 87107, 87109, 87119, 87124, 87128, 87135, 87137, 87138,
  87140. Confirm runs only if the pilot fires cleanly (pilot
  gate below). Confirm includes the two remaining DEFER5
  seeds (87135, 87137), so the full 9-seed key table (6 DEFER5
  + 3 W4-FACED) requires the confirm leg.
- If the pilot gate fails on instrument grounds, the run
  stops at pilot as DIAG-NO-GO. If it fails only because the
  pilot has no veteran trajectory to measure (e.g. zero
  wave-3+ kills on all pilot seeds), the verdict is
  INSUFFICIENT-DATA and no confirm is run — but the pilot's
  kill counts are reported, not hidden.

## Policy stack (identical to wavegate, plus vet2)

- withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))),
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
  SEATDRIVE=1 FULLSEAT=1 WAVEGATE=1 VET2=1, 200 loop-days
  death-aware cap (harness Game.over stop; dead villages stop
  simulating). The 200d cap matches wavegate exactly: wave-4
  doors opened as late as day ~165 on prior bands, so a
  shorter cap would censor the veteran tail.
- VET2=1 is the only on-switch for the new layer. Unset, the
  layer delegates to the wrapped policy byte-identically
  (proof-test guard). The layer is pure reads: every daily,
  AFTER delegating inward, it snapshots (a) scholar vid
  (Game.villagerId + state.scholar.villagerId), (b) the living
  vet4 set (distinct by with a wave-3+ kill in waveKillLog so
  far AND living at this daily: scholar always living, others
  vpOf(vid) && !dead — the standing.js isLiving rule, not a
  roster-membership rule), (c) the living vet5 set (wave-4+
  kills, same living rule), (d) a vid->name map for current
  vets + scholar (getPerson reads in try/catch; vid slice on
  failure). It writes nothing to game state and draws no RNG.
- The kill capture (sweep-side wrap of recordWaveKill) is
  installed after loadGame and removed after the run. It
  records raw call args only (no getPerson at kill time, so
  the capture cannot perturb the kill path through a read);
  names resolve post-run / from daily name maps in the
  analyzer.

## Det-gate (before judged sims are trusted)

- scripts/vet2-det-20261031.sh (shell + node compare): runs 2
  pilot seeds (87115, 87126) twice each — recorder ON
  (WAVEGATE=1 VET2=1) vs recorder OFF for vet2 (WAVEGATE=1
  VET2 unset; the wavegate leg is already det-proven on its
  own base lineage and is NOT re-proven here) — to worktree
  scratch dirs (scratch-vet2-det/, deleted before commit;
  NEVER the judged corpus, NEVER /tmp per the sibling-cleanup
  lesson), and compares dayHash arrays + end fields
  (gameDays, won, national, table, maxWave, endScaleRank).
  Requirement: byte-identical hashes and identical end fields
  on both seeds. A mismatch stops the run (DIAG-NO-GO on
  instrument grounds) until explained.
- Corpus determinism leg: one judged pilot seed re-run to a
  scratch dir is byte-identical to its judged JSON.

## Trajectory definitions (binding)

- LIVING VET COUNT (daily): |living vet4 set| and |living
  vet5 set| on that daily row (from the vet2 snapshot).
- MAX LIVING VETERANS (per seed): max over daily rows of the
  living vet5 set size (the veterans-2 question), and max
  living vet4 set size (reported alongside).
- VETERANS AT END: living vet5 / vet4 set sizes on the last
  daily row, with member vids + names.
- FIRST VET2 DAY: first daily row with living vet5 size >= 2;
  null if never. DAYS AT VET2: count of daily rows with living
  vet5 size >= 2. VET2 vs WIN/TABLE: first vet2 day compared
  with winDay and tableDay from the wavegate rows (first day
  won true / tableWaiting|tableDone true); a vet2 day AFTER
  the win day is post-win by construction and labeled so.
- VETERAN DEATH: a vid in the living vet set on daily row d
  that is absent on the next daily row AND not living at that
  next row (vpOf dead or unresolvable). Each death records
  vid, name, day lost, tier (vet4/vet5), its kill-time
  scholar/companion status, and its wave-3+/wave-4+ kill
  counts at death.
- REPLACEMENT: the first later daily row on which a NEW vid
  (never in the set before) enters the living vet set after a
  death; recovery to the pre-death set size and recovery to
  >= 2 (vet5) are reported as days-after-death or never.
- WAVE-4+ KILLS PER VILLAGER (kill-time-keyed): per distinct
  by, count of wave-4+ kills with scholar/companion status at
  kill time, first/last kill day, and whether that villager is
  a living veteran at run end. Same table for wave-3+ kills
  (the vet4 feeder pool).
- CROSS-CHECKS (every seed): (i) daily living-vet counts ==
  wavegate row rd4.veterans / rd5.veterans on every daily row
  (same living rule, two independent reads); (ii) deduped
  capture ledger == final waveKillLog multiset (day/mid/by/
  via/wave); (iii) capture-vs-census scholar/companion
  agreement on every wave-3+ kill; (iv) derived final
  unlockedWave == post-run engine unlockedWave() (inherited
  from the wavegate rows). A cross-check failure is an
  instrument error unless a read-only explanation is verified
  (e.g. same-day succession between daily rows for (iii) —
  stated per kill, never bulk-waived).

## Primary metric

Veterans-trajectory completeness over the 9 key seeds (6
DEFER5 + 3 W4-FACED): every key seed has (a) a per-seed
trajectory table (max living veterans, veterans at end,
wave-4+ kills per villager kill-time-keyed with scholar vs
companion share, veteran deaths + replacement outcomes,
first day with veterans>=2 vs win/table day), (b) zero
recorder errors, (c) cross-checks (i)–(iv) passing or
read-only explained. Completeness = key seeds fully tabled /
9 key seeds.

## Band verdict (stated now, judged later, never re-scored)

- DIAG-GO: completeness 9/9, det-gate byte-identity on 2
  seeds, determinism leg byte-identical on 1 seed, recorder
  errors 0 on all judged seeds, cross-checks (i)–(iv) pass or
  read-only explained on all judged seeds, >= 9 usable judged
  seeds (pilot + confirm), AND the evidence states plainly
  (a) veterans-2 reachable or not, with the seed/day evidence,
  and (b) whether wave 5 on this stack is a post-win
  curiosity, with the w4-faced / defer5 / win-day timing that
  forces that answer.
- DIAG-NO-GO: completeness < 9/9 with no read-only
  explanation, or any cross-check failing unexplained, or
  recorder errors > 0 with no read-only explanation, or the
  pilot fails on instrument grounds, or a required verdict
  section (a)/(b) missing.
- INSUFFICIENT-DATA: fewer than 9 usable judged seeds
  covering the key table, or the pilot gate fails (below).
  The veterans-2 question is then unanswerable on this band;
  trajectory tables are still reported as far as measurable.

## Pilot gate (8 seeds before any confirm spend, §9)

Pilot GO requires: vet2 recorder fires on all 8 pilot seeds
with zero recorder errors; per-seed JSONs valid (days > 0,
daily rows sorted, no gaps beyond the engine day-clock
pattern documented by wavegate — rows == harness daily calls);
trajectory tables computable for the pilot's 7 key seeds
(4 DEFER5 + 3 W4-FACED); AND the det-gate passed before the
pilot. If the pilot fails on instrument grounds, the verdict
is DIAG-NO-GO. If it fails only because the pilot shows no
veteran trajectory at all (zero wave-3+ kills), the verdict
is INSUFFICIENT-DATA and no confirm is run.

## Horizon + why (death-aware, never a fixed 200d)

Cap 200 loop-days; stop rule is the harness's Game.over
(village lost or won). Identical to wavegate: wave-4 doors
opened as late as day ~165 on prior bands, so a shorter cap
would censor the unlock tail; the death-aware stop keeps cost
at the survival distribution.

## Panel (§15)

NOT APPLICABLE — single-base DIAG census, no before/after
lever comparison exists in this arm; none fabricated (same
declaration as wavegate-a). The det leg compares recorder-on
vs recorder-off trajectories of the SAME stack; it is a
neutrality proof, not a panel comparison, and its numbers
never enter the census tables.

## Sense-testing (SENSE-TESTING LAW)

The evidence judges at least one veteran-making (or
veteran-losing) moment from the corpus: the kill ledger +
daily rows + hold/release beats around that day. Does the
village notice the kill that makes a veteran (companion kill
beat, hold-beat count change), does a veteran's death read as
a loss the village registers, and does the hold beat's veteran
count track the living set honestly when a veteran dies?
Counts alone do not pass this section.

## Amendment (2026-10-31, BEFORE the pilot gate is declared — the first
pilot run is discarded, not judged)

The first pilot run (8 seeds) failed cross-check (ii) on exactly one
seed, 87134: the final waveKillLog held one entry the capture missed
(day 61, belltoad, wave 1, by gen_71idymo, via player, trick
"shout,shout,shout"), while the capture held one exact-duplicate
call the log correctly deduped (day 61, mirrormoth, caleb_jones,
contest — dedupe already handled by the analyzer). Root cause, read
from code: src/js/game.js has TWO waveKillLog writers, not one —
recordWaveKill AND recordPyrrhicKill (the pyrrhic path writes the
log directly for a monster killed on a dying tick in a lost fight,
deliberately scoring nothing toward wave bars). The capture wrapped
only recordWaveKill, so it missed pyrrhic kills. The missed kill is
wave 1, so no wave-3+/wave-4+ table in the first pilot moves on it —
but the instrument was incomplete in principle: a pyrrhic wave-3+
kill WOULD enter the log the gate reads, so the capture must cover
both writers. Fix: the sweep now wraps both methods (same
call-through, tagged src). Consequence: the first pilot corpus is
DISCARDED (files deleted, not retained as judged data), the det-gate
is re-run with the fixed sweep (trajectory neutrality re-proven,
same 2 seeds), and the pilot is re-run fresh. No judged corpus from
the old capture survives. The pilot gate is judged on the re-run
only. This amendment is written before the re-run's judged sims.

## Metric review (carried, filled at evidence time)

- (To be filled from the run: did the snapshot counts match
  the rd counts daily, did capture-vs-census agree, did any
  trajectory definition misfire, did the pilot gate behave.)
