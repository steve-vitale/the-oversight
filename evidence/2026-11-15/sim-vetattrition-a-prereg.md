# sim-vetattrition-a — PREREG (binding)

Run: fleshout-20261115T2015Z (Loop A), axis scale-onramp.
Arm branch: `sim-vetattrition-a` (worktree `~/workspace/worktrees/sim-vetattrition-a`).
Base: `605d72bd4` (recovered transplant2b-fresh-a evidence commit; master tip at arm start).
Binding prereg: THIS file — frozen before any judged analysis. No game-code
change in this arm; measurement only. No sims are run under this prereg
unless §Targeted fresh sims fires.

## The question (from the 1615Z scale-onramp review)

Why do living veterans bleed to zero after wave 5 unlocks? Facts to
explain, all from landed corpora:

- Every unlocked seed opens at vet5 = 2, then vet5 ends at 0 in 5/10 armed
  unlocked villages (wave5kill-b).
- 6/8 seeds short on living veterans (7redef-match).
- 0 living wave-4 veterans at end on all 16 fresh-band seeds (2b-fresh).
- Tribute veterans-short on every seed (2b-fresh, guardablate).
- The wave-5 door opens exactly at vet5 = 2 and then veteran deaths
  re-short the bar — the gate measures a moment, not a durable state.

This arm names the MECHANISM with per-seed counts. It does not build a lever.

## Corpora (frozen — 7 dirs, 72 per-seed files, read-only)

| # | Dir (relative to repo root) | Leg | Seeds | Provenance |
|---|---|---|---|---|
| T1 | evidence/2026-11-13/perseed-culpritbisect-a-ep-tip-7redef-match/ | 7redef-match baseline (tip b4343ac9d) | 190391–190398 (8) | competent verbatim, 150d, fix standing f8fda4295a99; survived 8/8 |
| T2 | evidence/2026-11-13/perseed-culpritbisect-a-ep-tip-guardablate/ | guardablate baseline (tip 53e7b6a1e) | 190391–190398 (8) | competent verbatim, 150d, fix standing; survived 4/8 |
| T3 | evidence/2026-11-13/perseed-culpritbisect-a-tguardablate/ | guardablate subject (guard removed, 056cfb809340) | 190391–190398 (8) | competent verbatim, 150d, fix standing; survived 1/8 |
| T4 | evidence/2026-11-15/perseed-transplant2b-fresh-t2b-fresh-203a32775/ | 2b-fresh baseline (far end 203a32775) | 190621–190628 (8) | competent verbatim, 150d, fix standing; survived 0/8 |
| T5 | evidence/2026-11-15/perseed-transplant2b-fresh-t2b-fresh-385a9f7b6/ | 2b-fresh subject (family 2b 385a9f7b6) | 190621–190628 (8) | competent verbatim, 150d, fix standing; survived 0/8 |
| G1 | evidence/2026-11-15/perseed-gorgeprice2-b-confirm-control/ | gorgeprice2 confirm control | 100521–100536 (16) | policy competent-answercourt-b, 150d, anchor 583a462ce97f; wave-5 unlocked 4/16 |
| G2 | evidence/2026-11-15/perseed-gorgeprice2-b-confirm-on/ | gorgeprice2 confirm armed | 100521–100536 (16) | same policy/horizon; wave-5 unlocked 10/16 |

EXCLUDED, with reason (not read, not counted): the 7redef-match 4-seed
sniff dir (`perseed-culpritbisect-a-ep-tip-7redef-match-sniff/`, subset of
T1's seeds, same trajectories — would double-count); the 1615Z-base
check leg (`perseed-culpritbisect-a-ep-1615-guardablate-check/`,
bit-identical to T1 except step/anchor metadata — would double-count);
the 1215Z 7redef baseline dir (`perseed-culpritbisect-a-ep-tip-7redef/`,
superseded substrate, pre-guard).

## Two corpus classes (what each can answer)

**Class T (transplant / vetfirst instrument, T1–T5, 40 files) — EXACT.**
Daily snapshots carry `vetsW4.killers` (living wave-4+ killers: vid, name,
firstDay, lastDay, maxWave, kills, scholarAtKill, pyrrhicKills),
`waveKillLog` (every kill: day, mid, wave, by, via, trick, pyrrhic),
`veteranRows` (per veteran: inParty, armorP, weapon, assignment, hp),
`partyMembers` (scholar's party vids), `ready4`/`ready5` per day,
`regDeaths` (every registerDeath: day, kind, villagerId, name, cause,
killerId), `spawns`/`fights`/`killCalls` with day + wave. A veteran exit
is identified by vid + name, and the victim's death row is identified by
`villagerId`. Instrument semantics verified in code before freezing:
`scripts/vetfirst-instrument-20261111.js` (`livingVeterans`: living =
current scholar, or on roster with vp not dead; pyrrhic log entries count
toward identity when the killer lives), `scripts/culpritbisect-driver-20261113.js`
(daily snapshot construction), `src/js/ladder.js` `countLivingVeterans`
(same living rule; scholar counts; pyrrhic kills count when killer lives).

**Class G (gorgeprice2 / balance-panel recorder, G1–G2, 32 files) — INFERRED.**
Daily `series` rows carry `vet5` (living wave-4+ killers, count only, no
names), `vet4`, `wk` (cumulative wave kills), `rd5ready`/`rd5short`,
`w5` (distinct wave-5 types faced); `events` carry exact `unlockedWave`
days; `deaths` carry {day, kind, who, cause, player}. NO waveKillLog, NO
victim names, NO party records, NO spawn/fight records. Veteran deaths
are attributed only by day-matching a vet5 drop to deaths rows (see
scheme). Wave-of-killer attribution here is ERA-based only (before/after
first-faced day), never per-fight.

## Classification scheme (frozen)

### Universe

- Class T: every vetsW4 EXIT — a vid present in the vetsW4 killers set of
  daily snapshot i, absent in snapshot i+1, never returning — PLUS every
  BORN-DEAD veteran: a wave-4+ waveKillLog entry with pyrrhic:true whose
  `by` never appears in any vetsW4 snapshot (killer died in the fight
  that made them a veteran). vet4 (wave-3+ killers) exits are counted as
  a secondary pipeline table only (exits + end counts), not classified.
- Class G: every vet5 DROP — a fall in series `vet5` between consecutive
  series rows, with day = the later row's day and magnitude k. vet5 RISES
  (new veterans entering) are counted per seed, not classified.

### Cause classes (one per exit/drop; every exit gets exactly one)

- `W5-FIGHT` — death on a day a wave-5 fight is recorded (T: wave-5 spawn,
  fight, or killCall on the death day or the day before; G: never assigned
  — G has no fight records).
- `W4-FIGHT` — death on a day a wave-4 fight is recorded and no wave-5
  fight is (T only; same day/day-before window).
- `W3-LOWER-FIGHT` — death on a day with only wave ≤3 fights recorded
  (T only).
- `MONSTER-UNKNOWN-WAVE` — cause "monster" with no wave fight recorded on
  the death day or the day before (T), or cause "monster" in the
  era window (G).
- `W5-ERA` (G only) — attributed death (see below) with cause "monster"
  falling on/after the seed's first-faced day.
- `PRE-W5-ERA` (G only) — attributed death with cause "monster" falling
  before the seed's first-faced day (or on a seed that never faced wave 5).
- `ARENA` / `CONTEST` / `AMBUSH` / `WILD` / `OTHER` — death cause as
  recorded (cause "the wild" = scholar death in the wild, the lingerer
  path; "ambush" includes villager-on-villager ambush per regDeaths
  killerId).
- `NON-DEATH-EXIT` — exit with NO matching death row (T: no regDeaths row
  with villagerId == vid between the last-present and first-absent
  snapshots; G: a vet5 drop with ZERO villager deaths in the window).
  Each such exit is investigated individually (tribute delivery?
  roster departure? instrument gap?) and the investigation outcome is
  recorded per exit; unexplained ones stay in the unclassified residue.
- `AMBIGUOUS` (G only) — a vet5 drop whose window holds ≥2 villager
  deaths, or a drop of magnitude k>1 with fewer than k candidate deaths.
  Lists the candidate deaths (day, cause, player). Counts as
  UNCLASSIFIED for the GO bar.

### Class-T attribution rules

- Exit day = first daily snapshot day where the vid is absent. Death
  window = (previous snapshot day, exit day]. The death row is the
  regDeaths row with villagerId == vid in that window; if none, the exit
  is NON-DEATH-EXIT (never silently matched to another vid's row).
- Death day, cause, killerId come from that row. Scholar-at-death =
  (vid == scholarId on the death day's snapshot) or the matching sweep
  `deaths` row's player flag.
- The veteran's own record comes from the final vetsW4 entry before exit
  (firstDay, lastDay, maxWave, kills, scholarAtKill, pyrrhicKills) and
  their waveKillLog entries (via values: wild / player / companion /
  other — answers whether they earned kills solo, as the scholar, or as
  a companion).
- Party at death: `veteranRows[].inParty` for that vid at the last
  snapshot before the exit, plus `partyMembers` that day (empty vs
  non-empty, and whether the vid is in it). If partyMembers is empty on
  every snapshot of every T seed, that is reported as a finding (the
  scholar never has a party in these corpora), not assumed.
- Wave-fight window: spawns/fights/killCalls are day-granular; a death
  is attributed to the highest wave with a fight record on the death day,
  else the day before, else MONSTER-UNKNOWN-WAVE. The window choice is
  recorded; no wider window is used.

### Class-G attribution rules

- Drop window = (previous series row day, drop day]. Candidate deaths =
  sweep `deaths` rows in the window with kind villager/person.
- UNIQUE: drop magnitude 1 AND exactly 1 candidate death → attributed to
  that row (day, cause, player flag; era class by first-faced day).
- MULTI (≥2 candidates) or magnitude > candidates → AMBIGUOUS
  (unclassified).
- NONE (0 candidates) → NON-DEATH-EXIT (investigate per drop: check
  seatTakes/tableChoices/tableState for a tribute delivery; record the
  outcome).
- Series rows are ~daily but can skip days; the window is the gap between
  consecutive rows as recorded, never widened.

### Unlock day (for "days relative to unlock")

- Class G: exact — the `unlockedWave` event day for wave 5 (from
  `analyze-wave5kill-b.js` conventions).
- Class T: DERIVED — first daily snapshot day where ALL hold:
  ready5.ready == true AND samples.standing at that day >= 200 AND a
  wave-4 spawn or wave-4 killCall has occurred on/before that day.
  Validation: derived unlock day must be <= first wave-5 spawn day;
  any seed violating that is an instrument error and is reported, not
  silently re-derived. Seeds that never unlock get unlockDay null and
  are reported in the never-unlocked table (their veteran exits are still
  classified — the bleed question covers the whole run, not only
  post-unlock).

### The wave5kill-b correction check (frozen)

The classifier recomputes, per G leg, BOTH counts: (a) the wave5kill-b
formula — deaths rows with `who` in the frozen wave-5 id set (no kind
filter); (b) the kind-filtered count — same rows with kind == "monster"
(dead Producers) vs kind villager/person (villager deaths, `who` a
villager vid, never a monster id). The proof test asserts (b)'s
villager-death count is 0 in both G legs (pre-prereg exploratory probe:
armed 12/12 kind monster, 0 villager, 0 player; control 16/16 kind
monster, 0 villager, 0 player; per-seed w5rows tracks waveKills['5']
11 vs 12 and 14 vs 16). The evidence file states plainly whether the
wave5kill-b "kill:death 0.92 / 12 villagers died to wave-5" reading
survives the kind filter. This check does not enter the GO bar; it is a
correction record.

## DIAG GO criterion (frozen — the judge)

GO iff ALL hold:

1. Per-seed veteran tables are complete for all 72 files (0 instrument
   errors: every file parses; every T file has a daily array; every G
   file has a series array; unlock derivation validates on every T seed
   that unlocks).
2. Every veteran exit/drop is classified into exactly one cause class
   (above), and ≥90% of ALL exits/drops across the 7 corpora are
   CLASSIFIED — where AMBIGUOUS (G only) and unexplained NON-DEATH-EXIT
   count as UNCLASSIFIED, and the unclassified residue is named with
   counts per corpus. (Named-but-unexplained exits are residue, not
   classified.)
3. The mechanism is named in plain words with the pooled cause shares,
   the wave split, the fight/road/wound split as far as the corpora
   support it, the timing relative to unlock, and the party/solo/
   off-screen split as far as the corpora support it — with an explicit
   "the corpora cannot answer X" wherever the record runs out.
4. A next-lever spec is written prereg-ready: exact change, exact GO
   threshold, band, horizon. (Specified only — never built here.)

NO-GO otherwise. A miss on the 90% bar is a NO-GO even if a mechanism
looks plausible; the bar is the judge.

## Questions the arm answers (frozen)

(a) What kills veterans — cause shares, wave split, fight/road/wound
    split (road = expedition cause; wound = wound-fever/disease causes
    as recorded; where the cause taxonomy cannot separate these, the
    evidence says so and does not invent a split).
(b) When — days relative to unlock (per exit, pooled median/IQR).
(c) Whether the bleed is wave-5 fights specifically or background
    attrition (W5-FIGHT/W5-ERA share vs the rest).
(d) Whether veterans die as the scholar's party, as solo villagers, or
    off-screen (inParty flags + partyMembers + kill `via` for T;
    explicitly unanswerable for G — no party records).
(e) The cheapest next lever, prereg-ready (see GO #4).

## Targeted fresh sims (rule — frozen)

Fresh sims run ONLY if the frozen classifier leaves a named sub-question
that a fresh sim with an EXISTING instrument can answer. If fired, the
sims get their own mini-prereg BEFORE running: fresh band verified
unused across all `evidence/*/sim-*-prereg.md` per the seed-band
freshness skill (never 100521–100536, 190391–190398, 190621–190628);
8 seeds minimum; 150d death-aware; competent verbatim; fix standing
`f8fda4295a99` swapped in (own-policy rule). A per-encounter recorder
does not exist in the current instruments, so "fight lines for wave-5
deaths" does NOT fire this rule — it is a recorder gap to be filed, not
a sim to run. No fresh sims are planned at prereg time.

## Method notes (frozen)

- Analyzer: `scripts/vetattrition-analyze-20261115.js` (new; reads the 7
  dirs, emits per-seed veteran-death tables + pooled shares; read-only
  over the corpora). It reuses `scripts/analyze-wave5kill-b.js`
  conventions for the G class (series vet5, unlock events, frozen
  wave-5 id set re-read from `src/data/monsters.json`).
- Proof: `scripts/test-vetattrition-a.js` (new). Proves the classifier's
  counts against hand-checked seeds: at least 1 T seed and 1 G seed
  recomputed by hand from the raw per-seed JSONs, asserted equal; plus
  the kind-filter correction check, the unlock-derivation validation,
  and the ≥90% classification bar computed from the classifier's own
  output (the bar is asserted in the evidence, not smuggled into the
  proof as a pass/fail on the mechanism).
- Sense-testing: read vetSays (T) / linkLines (G) around veteran deaths
  (±2 days); judge meaning, coherence, relevance, consequences. Known
  recorder gaps, stated here so the evidence does not pretend otherwise:
  wave-5 deaths are silent (no fight lines); death rows carry no victim
  name / party / flee (G); villager deaths never name the killer monster
  (cause is the generic "monster" — verified in `src/js/ledger.js`
  playerDeath and the regDeaths rows, where killerId is null for
  monster-caused villager deaths).
- Pre-prereg exploration (disclosure, not judged output): read-only
  schema probes of one file per corpus, the vetfirst instrument, the
  culpritbisect driver, the harness death sampler (`scripts/sim-harness.js`
  `_liveDeaths` = tele 'death' events), `recordPyrrhicKill`
  (`src/js/game.js:35077`), `countLivingVeterans` (`src/js/ladder.js:65`),
  and the w5rows kind probe above. No classifier output has been
  produced; no numbers beyond the w5rows kind probe are frozen here.
- Convergence: scale-onramp stays the axis; this arm reports its state
  at the end (converging / converged / parked / killed-at-pilot are
  loop-body words — this DIAG reports GO/NO-GO against the criterion
  above and names the mechanism or the residue).

## What this arm does NOT do

- No game-code change, no lever build, no policy change, no merge, no
  push, no version bump, no live verification.
- No re-run of any leg, no re-scoring of any prior verdict (wave5kill-b's
  numbers are recomputed with the kind filter as a correction record;
  its verdict is not re-judged here).
- No new seed band is consumed unless §Targeted fresh sims fires.
