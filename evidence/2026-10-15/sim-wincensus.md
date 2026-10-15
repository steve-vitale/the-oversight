# sim-wincensus — the win-side census (flesh-out loop ARM 1, 2026-10-15)

Run: fleshout-a-2026-10-15T174600Z, ARM 1 of 2 (sim-wincensus).
Axis: scale-onramp (standing scale directive; the WIN side of the wall).
Canon: docs/CANON.md + docs/TABLE.md + docs/ENDGAME-BUILDS.md (read first;
no canon doc covers census attribution — the taxonomy is this arm's
instrument, not canon).
Zero src/js changes — policy/instrument only.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep seed runs)

**Question:** the landed win-side layers (winpursuit: 7/16 wins; windefer:
discipline proven, never engaged on the courtship-road substrate) were never
measured TOGETHER on the census substrate (the tribcollapse stack:
FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1). This arm is
the win-side census: an instrument that attributes EVERY non-winning run
to a named bucket, and a sweep that measures the two layers together on
identical seeds against an own control.

**Instrument:** scripts/wincensus-20261015.js — a PURE classifier over
persisted run records (no live hooks; it cannot change game behavior).
Buckets: WIN | invited-sequence-stalled | invited-deferred-died |
invited-finale-died | never-invited (binding bar: wave-3-bar | wave-4-lock
| deeds | standing — definitions pinned in the instrument header) |
died-pre-invite (named death cause). Anything else → 'unknown'.

**PRIMARY (binding):** ≥90% of NON-WINNING runs attributed to a named
bucket. "unknown" counts against. A miss is NO-GO: instrument repaired,
evidence only.

**Substrate:** 8 seeds (11/22/33/44/55/66/77/88) × {leadfeast, belongfeast}
× {control, armed}, 180d death-aware, identical seeds both sides, OWN
control in the SAME sweep (#247 — never inherit a baseline).
- control = feast stack: FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 +
  RAIDDENSITY=1, all asserted up front in the sweep script (#312 lesson).
  Policy: tribfloor.js's leadfeast/belongfeast (leadcourt/belongseek +
  feastscale r13 + tribfloor), traced (WINTRAZE=1) for attribution.
- armed = control + WINPURSUIT=1 + WINDEFER=1. Policy: windefer's
  withWinDefer over the SAME tribfloor base ('leadfeast-windefer' /
  'belongfeast-windefer' ids), traced. The windefer wrapper reproduces
  winpursuit's tableRoad drain internally (proven by windefer's 19/19
  proof), so WINPURSUIT=1 env is the drain's live marker and WINDEFER=1
  the hold discipline's.

**Horizon + why:** 180d death-aware. The win-day floor is day 90 and the
deferred re-offer needs the days after; a shorter horizon cuts the chain.

**Proof:** scripts/test-wincensus-20261015.js — REAL-RED on constructed
fixtures for EVERY bucket (a naive 1:1-verdict stub REDs on the bar/cause
fixtures); gate-off purity: det-gate 16/16 identical trajectories on
identical seeds (traced-vs-untraced on the tribfloor composition);
SMOKE green BEFORE the sweep.

**Secondaries (pre-registered):** wall numbers both sides
(national/table/wins/wave4/wave5/median survival/exiled); per-seed JSONs
in evidence/2026-10-15/perseed-wincensus/<policy>-<side>-s<seed>.json each
carrying numeric fields national, table, wins, exiled (the coordinator
runs telemetry-check against them).

**SENSE-TESTING LAW:** sense-read at least one win transcript and one
non-win transcript; judge meaning and coherence, not just counts.

## Metric review

(per §14 — pre-registered metrics bind; doubts go here, revisions apply
to the NEXT run)

1. **The primary metric fired cleanly: 32/32 non-winning runs attributed
   to a named bucket (100% ≥ 90% GO).** No revision needed. Zero
   'unknown' rows — the bar evaluator and the terminal-state split both
   exercised in the wild (the leadfeast-s44 never-invited/wave-3-bar
   case fired the bar path; the invitation-no-fire rows fired the
   died-pre-invite path).
2. **The armed side is a second, unintended control.** All 16
   armed-control pairs are byte-identical (day-hash sequences equal;
   verdicts, death days, death causes identical; holds=0, answers=0
   everywhere). This is not a measurement failure — it is the census's
   central finding (see Results): on current master the win-side layers
   cannot engage on the courtship road, so "armed vs control" measures
   nothing. The GO is about attribution, not about an armed effect, and
   the attribution is complete.
3. **The pre-registered substrate is not the substrate the layers were
   proven on.** winpursuit (7/16 wins) and windefer (7/16 wins,
   discipline proven) were measured on the winseek-era base where the
   table sat via the morning prompt. This census ran on current master
   where Steve 2026-10-14 ("Table seat is a Haven option, not a morning
   prompt", commit 116a8b9d) moved the sit to an active Haven-panel
   action — and no courtship-road policy takes it. The layer-engagement
   precondition changed under the layers. Future pre-registrations for
   win-side arms must assert a seat-taking driver in the policy chain,
   or measure on a seat-capable policy (capable.js is the only one that
   takes the seat today).

## Results — the win-side census (GO: 32/32 = 100% attributed)

Substrate: 8 seeds × {leadfeast, belongfeast} × {control, armed}, 180d
death-aware, FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1
(all four asserted up front), identical seeds both sides, own control in
the same sweep. Proof scripts/test-wincensus-20261015.js 47/47 GREEN
(REAL-RED: the naive 1:1-verdict stub fails all 7 bar/cause fixtures).
Det-gate 16/16 identical on both lines at 20d (traced-vs-untraced on the
tribfloor composition; full armed stack gate-off); 60d re-run in
evidence/2026-10-15/detgate-wincensus-60d.log. SMOKE green before the
sweep (layer-live markers honest on both sides; the classifier produces
a bucket on the smoke records).

**The census names the buckets — and the buckets name a broken road.**

| bucket | n/32 | shape |
|---|---|---|
| died-pre-invite (combat) | 30 | invitation fired d46–114; the scene never came; the village died of combat d60–176 |
| never-invited / wave-3-bar | 2 | leadfeast s44, both sides (byte-identical): national, survived to d182, w1=15/w2=7/w3=0 — the wave-3 distinct bar binds |
| WIN | 0 | the win-side layers never engaged |

**Why the layers never engaged (the finding):** on current master the
table sits only via `tableTakeSeat()` — an active Haven-panel action
(Steve 2026-10-14: "Table seat is a Haven option, not a morning prompt",
commit 116a8b9d; "No spoilers", 410818dc). The ONLY sim policy that
takes the seat is capable.js (tableRoad, ~line 697). The courtship-road
chain in this census (leadcourt/belongseek → scalecourt/competent →
feastscale → tribfloor) contains ZERO seat-taking verbs: grep finds no
tableTakeSeat/tableScene call in any of them, and the harness drives no
Haven panel. So the invitation fires (tableWaiting=true, announced at
d90: "THE TABLE IS SET... take your seat from Haven when you are
ready"), the winpursuit drain has no modal to answer (answers=0 on all
32 runs), the windefer hold logic has no offer to hold (holds=0 on all
32 runs), and the village dies with the table waiting. The two landed
layers are provably inert here: 16/16 armed-control day-hash sequences
byte-identical. This is not a policy gap like sim-wintrace's (the drain
exists but is wired to nobody) — it is a DRIVER gap: the seat-taking
verb itself is wired to nobody on the roads that arrive.

**The invitation-no-fire rows are real invitations, not noise.** The
seatDetail persisted at end shows lesser seats priced on the dying runs
(e.g. belongfeast-armed s22: seat=lesser, w1=19/w2=8/w3=3, 11 contests,
3 crises, regional, stage 3, foodDeeds=true; full deed gate w4=5 — wave 4
faced, w5=0). The table priced them; nobody sat down.

**Top non-win bucket: died-pre-invite (combat), 30/32.** The villages
that get invited die of combat before the scene — the same combat
pressure that dominates every window in the hold-loss census series
(succession-chain's funeral beats are the political face; the killing
is combat+monster). The 2 never-invited rows are the s44 national that
lived: w3=0, so the wave-3 bar binds — a village can hold national for
105+ days and still never face 3 distinct wave-3 monsters.

**Secondaries:** per-seed JSONs in evidence/2026-10-15/perseed-wincensus/
(each carrying numeric national, table, wins, exiled for
telemetry-check). Transcripts: evidence/2026-10-15/wincensus-beats/
(thin by construction — the say-capture keys on tableActive(), which is
never true when the scene never fires; the capture limitation is the
finding, not a bug).

## Village assessment (plain words)

Thirty villages were invited to the table and died waiting for someone
to sit down. They are not stupid villages — the s22 belongfeast village
that died d101 had a lesser seat priced (19/8/3 waves faced, 11
contests survived, regional standing, stage 3, the food-thesis deeds
done) and had faced 5 distinct wave-4 monsters. It died of combat, the
way villages die: 'combat' ×24, 'monster' ×4 in the tally. The
invitation beat is the cruelest line in the game right now: "THE TABLE
IS SET... take your seat from Haven when you are ready. Nothing is
final until you sit." — and the policy has no hands to sit with.

The lead road's villages live longer and die the same way (combat
pluralities everywhere: 15–25 'combat' deaths per run, monsters 2–13,
ambushes, expeditions, the occasional Big Beast). One lead village
(s44) did everything right — national, 19 contests, stage 3, survived
to the horizon — and was never invited at all, because it never faced 3
distinct wave-3 monsters. The wave-3 bar is doing its job as a bar; the
question it raises is whether a national that never meets wave-3
monsters is a content-routing gap (wave-3 unlocks not reaching the
courtship road's fights) rather than a capability gap.

The belong road never reaches national (0/8 both sides, as in the
tribcollapse census) — its villages die at d60–163, killed by combat
before any tribute or table mechanics matter. The belong road's bind is
survival-to-national, unchanged.

## Wall numbers

This run's substrate (16 runs per side — armed and control byte-identical,
so one row):

- national: 6/16 (leadfeast 6/8, belongfeast 0/8)
- table: 15/16 (invitations; 0 sittings)
- wins: 0/16
- wave-4 unlocks: 14/16; wave-5 unlocks: 5/16
- median survival: 120.5d (max 182d)
- exiled: 0/16

The scale wall stands on both its faces: the on-ramp (belong 0/8
national, villages dead by combat at d60–163) and now the win face —
the win-side layers, landed and proven on the old base, cannot engage
on current master because the seat-taking driver is missing from the
courtship-road policy chain. The next arm is not a tuning lever; it is
a driver: wire the seat-taking verb (capable.js's tableRoad pattern)
into the win-side stack, or measure the layers on a seat-capable
policy. Filed as a finding.

## Sense-testing

Two reads (SENSE-TESTING LAW — meaning and coherence, not counts):

1. **Win transcript (the last measured win on this road — windefer run,
   leadfeast-armed s22, walk-now → defer → re-offer → WIN d90).** The
   d47 sitting ("a ring of pale light... trillions of eyes"), the audit,
   the feared-path walk ("Show mercy." → "the audience weeps, and the
   galaxy learns that the feared one chose gentleness"), the deferral
   ("Ninety dawns. We do not price a life half-lived."), the d90
   re-offer and win. Read and judged in sim-wintrace.md: a named
   protagonist, an earned light branch, a complete dramatic arc — it
   reads as people in a televised endgame, not mechanics. The finale
   prose passes the sense bar. Nothing robotic.
2. **Non-win transcript (this sweep, belongfeast-armed s22).** The beats
   are sparse — one line: d90 "◈ THE TABLE IS SET. A ring of pale light
   waits — take your seat from Haven when you are ready. Nothing is
   final until you sit." Then the village dies d101 of combat. The
   sparseness is the finding, not a capture bug: with the scene never
   firing, tableActive() is never true and there is no finale to
   narrate. The line itself is well-written and honest — the failure is
   structural (no hands to sit with), not prose. Nothing robotic; the
   death is the ordinary combat attrition these villages live under.

## Findings filed

- New (steve-call-adjacent, no — policy-side, next arm's work): the
  win-side stack needs a seat-taking driver on the courtship road.
  capable.js's tableRoad (take the seat when tablePreview().ready, then
  drain the modal) is the proven pattern; the win-side layers
  (winpursuit + windefer) assume the modal exists. Options: (a) a
  seat-driver policy wrapper (WINSEAT=1, default OFF) composed under
  windefer on the courtship road; (b) measure the landed layers on
  capable.js instead. Either is a new arm, not this census.
- The census instrument itself (scripts/wincensus-20261015.js) is
  proven (47/47, REAL-RED) and fired every bucket path it was designed
  for except invited-finale-died, invited-deferred-died, and
  invited-sequence-stalled — those buckets are fixture-proven but
  unobserved in the wild on this substrate (the scene never fired).
  The instrument stands ready for the seat-driver arm's sweep.
