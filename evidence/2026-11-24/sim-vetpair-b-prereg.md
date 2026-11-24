# Veterans alive TOGETHER — Loop B, run fleshout-loop-b-20261124T0840Z, arm sim-vetpair-b (DIAG)

Axis: winnability chain (re-point 2026-11-03). DIAG-ONLY arm: zero
src/js changes. This arm answers standingconfirm
(evidence/2026-11-24/sim-standingconfirm-b.md) §Next blanks #1: the
binding bar for the full seat is TWO LIVING wave-4+ killers at the
same time, and the confirm's 703 standing-ok-but-not-ready days
(veterans short on every single one) say villages hold at most 1
living veteran for months — killers die within days of blooding,
pairs never overlap. This census PROVES that shape (or refutes it)
on a replayed band; it does not assume it.

Anchor: HEAD `a77a5a749` (branch sim-vetpair-b) at prereg time.
Instrument: the standing-gearready instrument
(`scripts/standing-gearready-b-instrument-20261124.js`, reused
VERBATIM — it already records daily living-veteran lists from
`state.waveKillLog`, wave-4+ kill events, and engine death teles)
under a NEW thin driver (`scripts/vetpair-b-driver-20261124.js`,
run `vetpair-b`, per-seed JSONs under
`evidence/2026-11-24/perseed-vetpair-b/`) and a NEW analyzer
(`scripts/vetpair-b-analyze-20261124.js`). No src/js change, no
instrument change: the census is a new READING of the same
telemetry, not a new recorder. Proof:
`scripts/test-vetpair-b-20261124.js` (analyzer fixtures + live
harness smoke + determinism replay leg), green BEFORE the judged
leg.

Policy: `scripts/policies/competent.js` `{competent}` VERBATIM,
default env. Horizon: 150 days, death-aware (dead villages stop
simulating; never a fixed 200d — §10: reachability lever,
150–200d band). Seeds: 109310–109325 (16) — a DELIBERATE REPLAY
of the standingconfirm band for comparability (same seeds, same
policy, same horizon). Band freshness in the "unused band" sense
does NOT apply: this is a replay measurement, not a fresh confirm.
The standingconfirm corpus is NOT pooled with this arm's numbers
and NOT re-judged; new per-seed files carry `-vetpair-b` in the
RUN slot, so no confirm file is overwritten — the driver refuses
to overwrite. Balanced panel (§15): INAPPLICABLE — a census with
no before/after change; no comparison is fabricated. Roster rule
(§14c): satisfied by construction — the co-primary IS villager
(non-scholar) killer deaths; scholar kills are recorded under the
same census and flagged `player:true` where the death tele says so.

## Substrate check (§14b — before the pilot leg)

Contact, pool, and horizon are verified WITHOUT spending the leg:
the standingconfirm corpus (16 seeds, same band/policy/horizon)
already contains wave-4+ kills on 15/16 seeds, 4 door openings,
and the 109314 pair case in full (omar_farouk blooded day 88 on a
wave-4 eater kill, died day 138 "the wild"; visjoin_136 blooded
day 137 on a wave-4 audit kill, died day 149 "monster"). The
phenomenon (wave-4+ killers, their deaths, and one transient pair)
IS staged on this substrate. Pool: the confirm counted 4 door
openings and 85 ready days on 3 seeds — the pair question is
addressable. Horizon: pairs, when they occur, form and die inside
150 days (the 109314 pair lived ~1 day). Staging: pilot = first 8
seeds (109310–109317) as the smoke leg (instrument fires, killers
recorded, deaths attributed); confirm = remaining 8 seeds
(109318–109325). Both legs judged against the SAME frozen bars
below; the verdict is on the full 16.

## Definitions (frozen — no mid-run taxonomy drift)

- **Veteran (wave-4+ killer):** a living roster member with a
  recorded kill of a wave-4+ monster in `state.waveKillLog`
  (the readiness gate's own definition, MONSTER-WAVES.md:
  veterans = living roster members with a wave-(w-1)+ kill;
  for wave 5, w-1 = 4). **Blooding day** = day of the killer's
  FIRST wave-4+ kill (from killEvents / waveKillLog, wave >= 4).
- **Alive window (event-level):** a killer is alive on days
  [blooding day, death day] inclusive when a death record exists
  (the killer was alive during part of the death day — the
  109314 release check ran day 138 BEFORE omar_farouk's death
  that day, proving it), and [blooding day, end day] when alive
  at the horizon. **Overlap day (event-level):** a day on which
  ≥ 2 killers' alive windows cover that day. **Overlap window:**
  a maximal run of consecutive overlap days. This is the PRIMARY
  overlap measure — it sees sub-day pairs daily snapshots miss.
- **Overlap day (snapshot-level):** a daily snapshot whose
  `veteranVids` (the instrument's independent recount from the
  live log) has length ≥ 2. Reported separately; the two
  measures are EXPECTED to differ (109314: event-level overlap
  2 days, snapshot-level 0 — the pair formed after the day-137
  snapshot and died before the day-138 snapshot). The
  discrepancy is a finding, not an error.
- **Days alive after blooding:** death day − blooding day (0 =
  died the day they blooded); censored (alive at end) reported
  separately, never averaged in as a death.
- **Terminal status (one per killer, exactly one):**
  `dead` (a death-tele record names the killer vid, with its
  cause string), `alive-at-end` (in the final daily snapshot's
  living veteran list), or `departed` (not in the final roster
  and no death record — exile/fled removals via
  `removeVillager`, which removes from the roster without a
  death; the final roster + `v.exiles` evidence is quoted).
  A killer with NONE of the three is UNCLASSIFIED.
- **Death-cause groups (frozen map; raw cause string always
  kept):** combat = "villager combat", "combat", "monster",
  "ambush", "the arena", "contest", "Gavel", "Highbeam Deer",
  "The Focus Group", "The Redactor", "Buffering", "experiment",
  "Ad Break"; expedition = "expedition", "the expedition";
  wild = "the wild"; disease = "sickness", "a wound that
  wouldn't close", "lockjaw"; starvation = "starvation",
  "thirst"; stranger = "a stranger"; other = any other RECORDED
  cause string (still classified — the cause is recorded, the
  group is a bucket). Monster death teles (kind "monster") are
  NEVER matched to killers; only kind person/villager records
  count, matched by `who` == killer vid (or `player:true` for
  the scholar vid 'player' if the log ever stamps it).

## Pre-registration (binding, §11/§14) — FROZEN BARS

Judge ONLY against these bars. The overlap COUNT is measured,
not judged: a 0-overlap result with complete classification is
the census succeeding, not failing. DIAG-GO requires ALL of:

1. **Classification completeness** — every wave-4+ killer on
   every seed carries exactly one terminal status (dead with a
   recorded cause / alive-at-end / departed with roster
   evidence). 0 killers UNCLASSIFIED; 0 unclassified
   killer-deaths (a dead killer with no cause string).
2. **Overlap measured on all 16 seeds** — event-level AND
   snapshot-level overlap windows counted on every seed; 0
   seeds unmeasurable; 0 instrument errors.
3. **Determinism (replay leg)** — seed 109314 run twice on this
   anchor yields byte-identical killer censuses (same blooding
   days, death days, causes, overlap windows). The cross-corpus
   comparison with the standingconfirm 109314 pair case (omar
   d88→d138 "the wild"; visjoin_136 d137→d149 "monster") is
   DESCRIPTIVE only — the anchor has moved since that corpus,
   so exact-day reproduction is not a bar.
4. **Instrument health** — 0 instrument errors; 0
   veteran-recount mismatches (daily snapshot veteranRecount vs
   `readiness5.veterans`); every wave-4+ waveKillLog row linked
   to a killEvent with `entryAdded` (or explained); 0 orphan
   kill rows.

Secondary rates (recorded, NOT judged — a move here is a
metric-review note, not a bar failure): blooding→death
distribution (median, max, same-day deaths); death-cause split
by frozen group; wave-4+ kills per seed; wave-4 faced /
wave-5 unlocks / wave-5 faced; wins / national / table counts;
median survival (censored, reported as such).

## Sense-testing law

Transcripts are read: one seed's killer timeline (the richest
overlap seed, or 109314 if it replays richest) is told in plain
words — who blooded, who died, of what, how long they lasted,
whether the pair ever stood together. Kill beats and death
lines for that seed are quoted, judged for meaning and
coherence, never just counts.

## Deliverables

- This prereg, committed BEFORE any judged sim.
- Per-seed JSONs under `evidence/2026-11-24/perseed-vetpair-b/`
  (16 files, `-vetpair-b` in the RUN slot).
- Evidence `evidence/2026-11-24/sim-vetpair-b.md`: census table
  (per killer: blooding day, death day + cause + group, days
  alive after blooding, terminal status), overlap windows
  (event-level + snapshot-level, expect ~0 — prove it), the
  109314 pair-death case quoted, death-cause split, sense-test
  of one seed's killer timeline in plain words, scale-wall
  numbers (national / table / wins, wave 4–5 unlocks, median
  survival), a "metric review" section (§14), next blanks.
- New gap found outside this arm → append to
  `hidden_files/sim-findings.md` in its format; do not chase it.
- Zero src/js changes. No push, no bump, no live verification
  (coordinator merges --ff-only; ship loop owns deploys).
- No second band / no confirm-of-confirm without coordinator
  say-so.
