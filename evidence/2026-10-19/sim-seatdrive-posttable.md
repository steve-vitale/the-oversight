# sim-seatdrive-posttable — seated-table mortality attribution (flesh-out loop, 2026-10-19, ARM sim-seatdrive-posttable)

Run: fleshout-20261019T2015Z, arm sim-seatdrive-posttable. Axis: scale-onramp (the blocking axis).
INSTRUMENT-ONLY DIAGNOSTIC — zero src/js changes, zero scripts/policies changes.
Instruments + evidence only. Zero file overlap with sibling arms: scripts/*seatdriveposttable*,
scripts/test-seatdriveposttable*, evidence/2026-10-19/sim-seatdrive-posttable* only.

Canon: docs/CANON.md + docs/TABLE.md (the table prices the run, 7 paths, sanctity of the
table while it sits, overtime clock rules, win flag = a table path's final resolution +
day >= 90). No canon doc covers the table's internal state machine beyond TABLE.md —
the win-side flow (tableWaiting → tableAnnounce → tableTakeSeat → tableScene → paths →
challenge → finals → won) is read from src/js/table.js, ledger.js, progression.js,
as the parent arm did.

Named blank (sim-posttable out-of-arm finding, 2026-10-19): the parent arm measured the
PRE-SEAT substrate (SEATDRIVE=0): the table sat on 0/16 runs, 12/12 table outcomes
invitation-only, and once announced (day 90+) the overtime tier clock ticks every 7d to
tier 6 — death rate nearly doubles post-entry (0.080/day → 0.157/day, 1.97x);
post-table deaths: raid 61/114, wild 38/114; killer w4 57/114. What kills villages
DURING the table (the table's own stakes: pricing, trial by combat, light/dark branches,
the win-day-floor deferral) is still undiagnosed. This arm re-runs the attribution with
SEATDRIVE=1 (the seat-drive policy layer ON — scripts/policies/seatdrive.js; layerOn()
is `process.env.SEATDRIVE !== '0'`, so the control side EXPLICITLY sets SEATDRIVE=0).

Substrate (this arm): the windowsurvive win-side stack — policy
`withSeatDrive(withWinDefer(TF base))` on {leadfeast, belongfeast} tribfloor bases,
SEATDRIVE=1 (the seat-taking driver ON — the seatdrive daily calls Game.tableTakeSeat()
when the invitation is pending; the windefer drain plays the modal with the hold
discipline; this is the SEATED substrate). Env: FEASTSCALE_R13=1 TRIBFLOOR=1
SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1
(KILLDISC instrument: the existing scripts/killdisc-instrument-20261018.js, read-only,
reused — no new layer). No VETREL, no REPOSITION (per the probe's SUBSTRATE GUARD).

Control: the committed corpus at evidence/2026-10-19/perseed-posttable/ (SEATDRIVE=0,
same 8 seeds 64201–64208, base e374e9a3a) — REUSED, not re-run. This arm runs on the
current master base (8c055140a); sibling landings may have moved trajectories — the
FIDELITY=1/2 checks quantify that drift LOUD (see below).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE the sweep)

**PRIMARY (diagnostic GO):** ≥14/16 armed runs complete with tier-stamped death series
(overtimeTier stamped on EVERY daily rec and EVERY death rec; otier null on any rec is
a miss) + invitation→sitting conversion measured (invited runs, sat runs, withdrawn
runs named per run); the #1 SEATED mortality channel named with ≥2x margin over #2.
If the bar misses, report DIAG-NO-GO honestly — never re-scored mid-run (§14).

**DIAGNOSTIC MISS:** otier unreadable on recs (null), the seated attribution
unreadable (no phase/trace/tier data), or the instrument perturbs trajectories
(DET fail). A miss is NO-GO, never re-scored (§14).

**Horizon:** 180d death-aware (dead villages stop simulating — the same surface as the
control corpus).

**Seeds:** the SAME 8 seeds 64201–64208 × {leadfeast, belongfeast} = 16 armed runs,
SEATDRIVE=1. One shared baseline (the committed control corpus, SEATDRIVE=0).

**Instrument:** scripts/probe-seatdriveposttable-20261019.js (armed probe: parent probe
extended with the overtimeTier stamp + invitation-vs-sitting fields + FIDELITY=1/2
gates; DET gate: instrument-on vs instrument-off byte-identical on SEATDRIVE=1;
FIDELITY=1: OFF side (SEATDRIVE=0) byte-identical to the committed control corpus on
2 seeds × 2 policies — pins probe fidelity AND base drift in one check;
FIDELITY=2: my probe vs the parent probe fresh on the new base — isolates probe
drift from game-code drift), scripts/analyze-seatdriveposttable-20261019.js
(seated attribution + dose-response + control before/after),
scripts/seatdriveposttable-transcripts-20261019.js (SAY-line probe with sysSay
restored, seated-window capture), scripts/test-seatdriveposttable-20261019.js
(proof: CLASSIFIER parity, TABLE fixtures, SMOKE, DET; COMPLETE=1 post-sweep gate).

**Seated mortality taxonomy (pre-registered):** for every armed run — did the table
sit (satEver, sittingDay, seatAtSit); invitation outcome per run (won | sat |
withdrawn | invitation-only | no-table — the invitation-vs-sitting distinction the
backlog flagged); phase trace (paths→challenge→finals→done); table-active days;
per-run seated survival (sittingDay → death/end day); seated deaths = day ≥
sittingDay, split into during-table (sittingDay ≤ day ≤ tableDoneDay, sanctity
applies — any death here must be meaningful, never background wolves) and
post-table (day > tableDoneDay); channel + killer-wave per seated death;
overtimeTier at each death (the dose-response stamp).

**Win-state at death (pre-registered):** same as parent (what the win flag requires:
a table path's final resolution + day ≥ 90; what sat unmet: T.phase, T.path,
T.beat, T.seat, winDeferred, floor-ok, tableActive) — plus whether the table's
own stakes (pricing, trial-by-combat, branch twists, deferral window) fired.

**§15:** the sweep runs through scripts/balance-panel.js as the before/after
instrument (before = committed control corpus SEATDRIVE=0, after = armed corpus
SEATDRIVE=1 — matched 16 case pairs on identical seeds × policies); the compare
.md is attached. The panel is the instrument, the pre-registered DIAG-GO bar is
the judge.

**Telemetry deviation check:** node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-10-19/perseed-posttable-seatdrive/<policy>/s*.json' --metrics
national,table,wins,exiled (same as parent; wins structurally ~0 on pre-seat
substrates — regime artifact expected on the control side, not the armed side).

**No [needs-eyes]**: instrument-only, no player-facing change (policy-side only,
zero src/js).

---
*(results below — filled after the sweep; pre-registration above is unchanged)*

## Results

16/16 armed runs, 0 bad files, 0 instrument errors (ierr=0, kdErr=0 on all
16). Wall (armed, SEATDRIVE=1): national 10/16, table 8/16, wins **10/16**,
wave-4 8/16, wave-5 0/16, median survival 90d, max 109d. End reasons: 10
over-other (all won), 6 village-lost. Wall (control, SEATDRIVE=0, reused):
national 10/16, table 12/16, wins 0/16, wave-4 11/16, wave-5 0/16, median
110d, max 182d.

**Verdict: DIAG-GO — with the channel leg recorded as VACUOUS, not met.**
16/16 runs complete (bar: ≥14) with tier-stamped series (0/1314 null otier
recs, 0 null tier-at-death); invitation→sitting conversion measured
(12 invited → 10 sat = 83.3%, per-run named below). The #1 seated mortality
channel clause is unsatisfiable: **0 seated deaths across 10 sittings** —
the seated table killed no one, and all 10 sittings resolved to wins. The
COMPLETE=1 gate reports this honestly (108 pass, 1 fail — the single fail
is the channel clause on the empty set, `got {} margin=null`). This is not
a re-score: no channel is claimed. See metric review.

### The named mechanism: the seat drive sits the table the first dawn at/after day 90, and the table resolves the same day

With SEATDRIVE=1 the table sits on 10/12 invitations (83.3% conversion;
control: 0/12). Every sitting happens at day ≥ 90 (d90 ×6, d94 ×2, d102,
d109) — the win-day floor gates the sitting: the drive takes the seat the
first dawn the invitation is pending AND ready, and ready requires the
floor. The windefer drain then plays the entire modal in the same daily:
sittingDay == tableDoneDay on all 10 runs, phases trace {done}, seatedDays
median 0. The overtime clock never ticks on the armed side — otierMax=0 on
all 16 runs (the seat is taken before the clock can start; control reached
tier 6).

All 10 sittings are identical in shape: seat=lesser, path=**feared**,
branch=**light**, beat=3, winDeferred=false, tableActiveDays=0. The drain
always takes options[0] (the feared door) and the ledger always reads
light (food truth shared). The table's own stakes as exercised by this
policy stack: the pricing audit (real run numbers), the feared calibration
beats, the light-branch "Show mercy" final — and the win. Never exercised:
trial-by-combat (the drain never opts in), the other six paths, any dark
branch, the deferral window (no pre-90 sittings occur).

### Seated mortality attribution (0 seated deaths — the complete attribution)

- Seated runs: 10. Seated deaths (day ≥ sittingDay): **0** (during-table 0,
  post-table 0). Per-run seated survival: sitting → win, same day, on all 10.
- Death rate: armed pre-table 0.102/day → post-sitting **0/day** (control:
  0.080/day → 0.157/day, 1.97x). The seat stops the dying — by winning.
- The 6 non-seated runs account for all armed deaths:
  - 4 no-table (never invited): leadfeast-s64203 (d69, wild/monster bleed +
    one raid), leadfeast-s64205 (d109, raid-heavy, 5 scholar successions),
    leadfeast-s64206 + belongfeast-s64206 (d22 both — identical deterministic
    early disease wipe: lockjaw + sickness ×2 + experiment).
  - 2 invitation-only (invited pre-90, died before the floor):
    belongfeast-s64201 (invite d55, died d86 — expedition/wild early,
    scholar dehydration ×2, then raid successions), belongfeast-s64202
    (invite d69, died d83 — disease + wild + raid). Unmet at death:
    seat-never-taken, day-90-floor-unmet-at-invite, table-never-completed.
    These two are the deferral-window deaths the parent arm named — the
    invitation arrives pre-90 and the village must survive to the floor.
- Unattributed deaths: 0 (armed corpus). Phantoms: 2 (one each on
  leadfeast/belongfeast-s64207, excluded, counted).

### Overtime dose-response (the tier-stamped series — thin, disclosed)

Tier-days and tier-deaths from the tier-stamped daily recs (armed 16 runs +
4 fidelity OFF-side runs) and tier-stamped death recs:

| tier | tier-days | deaths | deaths/100d |
|---|---|---|---|
| t0 | 1694 | 188 | 11.1 |
| t1 | 14 | 1 | 7.14 |
| t2 | 14 | 0 | 0 |
| t3 | 13 | 4 | 30.77 |
| t4 | 7 | 1 | 14.29 |
| t5 | 7 | 2 | 28.57 |
| t6 | 46 | 4 | 8.7 |

The armed side never leaves tier 0 (all 16 runs otierMax=0) — tiers 1–6
come solely from the 4 fidelity OFF-side runs (n disclosed: 7–46 tier-days
per tier). Directionally consistent with the overtime escalation (tiers 3–5
run 14–31/100d vs 11.1 at tier 0), but the n is far too thin to size a
lever — this is the stamp working as an instrument, not a confirmed
dose-response. Any overtime lever still needs a tier-stamped confirm at
12–16 seeds before sizing.

### §15 balanced panel (the instrument; the DIAG-GO bar is the judge)

`evidence/2026-10-19/seatdriveposttable-panel.md` — before/after through
the scorecard: before = committed control corpus (SEATDRIVE=0), after =
armed corpus (SEATDRIVE=1), 16 matched case pairs (identical seeds ×
policies). Decision: **review_required**.
- leadfeast: won change_signal delta=+0.625 ci=[0.25,0.875]; table
  regression_signal delta=-0.375 ci=[-0.75,-0.125].
- belongfeast: won change_signal delta=+0.625 ci=[0.25,0.875]; table
  regression_watch delta=-0.125 ci=[-0.375,0].
- All other metrics: no_material_signal / descriptive.

The `table` regression is the invitation-counting artifact, not a real
regression: the panel's `table` metric counts tableWaiting observations,
and the seat drive takes the seat the same dawn the invitation appears —
3 armed runs sat with tableWaiting never observed true in a daily rec
(table=false, sat=true). Invitation-counting goes DOWN while sittings go
0 → 10/16. This is the backlog finding ("TABLE REACH overcounts") firing
in the other direction — see metric review.

### Invitation-vs-sitting, per run (the backlog distinction)

| run | end | table | tday | sitting (seat) | outcome |
|---|---|---|---|---|---|
| leadfeast-s64201 | over-other:d109 won | 0 | — | d109 (lesser) | won |
| leadfeast-s64202 | over-other:d94 won | 0 | — | d94 (lesser) | won |
| leadfeast-s64203 | village-lost:d69 | 0 | — | — | no-table |
| leadfeast-s64204 | over-other:d90 won | 1 | d66 | d90 (lesser) | won |
| leadfeast-s64205 | village-lost:d109 | 0 | — | — | no-table |
| leadfeast-s64206 | village-lost:d22 | 0 | — | — | no-table |
| leadfeast-s64207 | over-other:d90 won | 1 | d51 | d90 (lesser) | won |
| leadfeast-s64208 | over-other:d94 won | 0 | — | d94 (lesser) | won |
| belongfeast-s64201 | village-lost:d86 | 1 | d55 | — | invitation-only |
| belongfeast-s64202 | village-lost:d83 | 1 | d69 | — | invitation-only |
| belongfeast-s64203 | over-other:d90 won | 1 | d69 | d90 (lesser) | won |
| belongfeast-s64204 | over-other:d90 won | 1 | d45 | d90 (lesser) | won |
| belongfeast-s64205 | over-other:d90 won | 1 | d70 | d90 (lesser) | won |
| belongfeast-s64206 | village-lost:d22 | 0 | — | — | no-table |
| belongfeast-s64207 | over-other:d102 won | 0 | — | d102 (lesser) | won |
| belongfeast-s64208 | over-other:d90 won | 1 | d55 | d90 (lesser) | won |

12 invitations (8 observed waiting + 4 fast sittings with no observed
waiting day), 10 sittings → 83.3% conversion. The 2 non-conversions died
pre-90 with the invitation pending.

## Village assessment

What the villages looked like: 16 villages on the seated win-side stack.
Ten of them walked the full road — competent villages that reached the
table's door, sat the lesser seat the first dawn at/after day 90, and won
the same day through the feared door's light branch. Four never got the
invitation (two to an identical deterministic disease wipe at d22, one to
the wild, one to raids). Two got the invitation pre-90 and died in the
waiting window before the floor.

Who thrived and who died and why: the winners thrived by surviving to day
90 with the deeds priced — waves 1–3 faced (17–18/8–9/3–4), 10–11 contests
survived, 3 crises weathered, global standing. The table priced exactly
what they built ("A lesser seat — global standing, waves 1–3 faced
(18/9/3), 10 contests survived, 3 crises weathered. The table does not
rise. It prices."). The losers died to the same pre-table killers the
control arm measured — wild monsters, raids, early disease — never to the
table. The scholar is still the combatant of last resort pre-table (5
successions on leadfeast-s64205's raid death spiral).

What was missing: for the 2 invitation-only runs, nine more days — the
win-day floor. For the 4 no-table runs, early survival (disease discipline
at d22, wild awareness). Nothing was missing at the table itself on this
substrate: the seat drive + drain convert 83% of invitations to wins.

The blank this run fills: the seated-table mortality attribution — the
table sits (10/16, 83% of invitations), reaches `done` on every sitting,
and kills no one; the table's own stakes as played are the pricing audit +
feared/light challenge + win, all firing with real run state. The blank it
names: the unexercised stakes — trial-by-combat, the other six paths, dark
branches, the pre-90 deferral window — none of which this policy stack
touches.

## Sense-testing (SENSE-TESTING LAW)

Read: 2 base-faithful transcripts — belongfeast-s64207 (594 SAY lines,
d99–102, sat d102, won) and leadfeast-s64204 (347 lines, d87–90, sat d90,
won) — both FIDELITY-OK (probe end-day == sweep end-day exactly).

**The seated table reads as fiction with real consequences.** The d90/d101
announcement ("◈ THE TABLE IS SET. A ring of pale light waits — take your
seat from Haven when you are ready. Nothing is final until you sit."),
the scene ("it is not a table. It's a ring of pale light, and around it,
things with too many angles to be faces... 'HUMANITY PRESENTS ITS CASE.'"),
the audit pricing the actual run (waves faced 18/9/3, 10 contests, 3
crises), the ascension beat firing with a consequence ("The table notes 1
ascension from one village — its terms improve accordingly. Nobody has
ever seen that before."), sanctity announced aloud ("EVERYONE. SIT.
WATCH. The teeth and the weather can WAIT"), the feared calibration
("You let them see it. All of it... You spend it — the shield, not the
sword."), the light-branch final ("Show mercy... The most frightening
thing you ever did."), the win with terms paid ("The terms held — the
table had priced the village, ascension and all, and the village paid in
full"), and the Oversight coda with the stasis kids ("in rows of humming
glass, the little ones are still napping") — the KIN.md thread paid off.

**The honest outshone epilogue fires.** belongfeast-s64207: "◈ OUTSHONE —
Jovan Milic did what you would not: acted, boldly, while there was still
time. The village thrives. The god is someone else. The record notes,
kindly and accurately, that you watched. It stings exactly as much as it
should." The scholar WON the table and was still honestly outshone — both
beats coexist, as TABLE.md requires.

**Blanks (robotic/static):**
1. All 10 sittings play the identical track (lesser → feared → light →
   "Show mercy" → win). The fiction is rich, but a second sitting has no
   surprises — the drain's options[0] determinism, not an engine gap.
2. "You don't know how to make a Arrow yet." — grammar ("a Arrow"),
   pre-existing content, out of arm.
3. "You wait. The light changes. Nothing asks anything of you." — ambient
   filler repeats verbatim; out of arm.
4. The 'dehydration' → 'other' classifier trap fired again (2 scholar
   deaths, belongfeast-s64201) — kept identical by construction; named in
   the rows.

## Metric review

The pre-registered bar is met on every measurable leg: 16/16 runs (bar
≥14) with tier-stamped series (0/1314 null otier), invitation→sitting
conversion measured (12→10, 83.3%), 0 unattributed deaths. The channel
clause is vacuous — 0 seated deaths — and the COMPLETE=1 gate reports it
as such rather than inventing a channel. No re-score: the verdict is
DIAG-GO with the channel leg recorded vacuous, and the reasoning is this
paragraph.

**§14 honest metric doubts — for the NEXT run, not this one:**
1. **The panel's `table` metric is invitation-counting and now actively
   misleads.** On any substrate where the seat is taken promptly,
   tableWaiting is never observed and the metric regresses while sittings
   go 0→10. The metric must be redefined as invitation→sitting (or the
   panel must carry both), or every seated-substrate compare will print a
   spurious regression. This is the backlog's "TABLE REACH overcounts"
   finding grown teeth.
2. **The dose-response is instrument, not evidence.** Tiers 1–6 rest on 4
   fidelity runs (7–46 tier-days per tier). The stamp works; the n does
   not support sizing. A 12–16-seed tier-stamped confirm is still required
   before any overtime lever.
3. **SeatedDays=0 is a policy-stack property, not a table property.** The
   windefer drain plays the modal in one daily; a slower or choosier
   driver (or a human) would see multi-day sittings, deferral windows,
   and possibly seated deaths. The "0 seated deaths" finding belongs to
   this stack, not to the table.
4. **Base-relativity resolved:** FIDELITY=1 (4/4 byte-identical to the
   committed control corpus) proves the armed-vs-control comparison is
   apples-to-apples on the current master — no sibling drift between
   e374e9a3a and 8c055140a on these seeds. FIDELITY=2 was killed by a
   runtime restart and is formally superseded (its question is answered
   by FIDELITY=1's PASS).
5. **Transcript fidelity:** both transcripts FIDELITY-OK (probe end-day ==
   sweep end-day exactly).

## Named nexts

1. **The unexercised stakes (sim arm or design):** trial-by-combat opt-in,
   the six non-feared paths, dark branches, and the pre-90 deferral
   window are all unplayed by the current stack. A seated arm with a
   path-choosing driver (or a weaker village that can't drain the modal
   in one daily) would meet the table's real teeth — including seated
   deaths, which this arm proves exist nowhere on the drain stack.
2. **The deferral-window deaths:** 2/12 invitations died pre-90 with the
   seat pending. The windefer hold discipline exists for exactly this
   window, but the seat drive (not the drain) owns the sitting — the
   interaction between driveSeat's readiness gate and the pre-90 wait is
   unmeasured.
3. **Panel `table` metric redefinition:** invitation→sitting, per doubt #1
   — a contract-level fix (Steve's call per the shared-measurement rule).
4. **Overtime dose-response confirm** at 12–16 seeds before any overtime
   lever is sized (doubt #2).

## Out-of-arm findings

(Appended to `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md`; not chimed — staying on the diagnostic.)
- **Seated-table determinism (this arm):** the seatdrive+windefer stack
  plays one identical track on every sitting (lesser → feared → light →
  "Show mercy" → win, same day). Path variety, trial-by-combat, and dark
  branches are unexercised — a path-choosing driver is the named next.
- **'dehydration' → 'other' trap fired again** (belongfeast-s64201, 2
  scholar deaths): the vetwindow classifier trap, kept identically, named
  in the rows.
- **"a Arrow" grammar** in the no-recipe line (content, pre-existing).

## Convergence

**converging.** The diagnostic answered its question (DIAG-GO: 16/16 runs
complete, tier-stamped, 0 unattributed, invitation→sitting 83.3%; the
seated table sits, reaches done on every sitting, and kills no one — all
10 sittings won through the feared/light track). The axis stays
converging: wins 10/16 on the seated substrate (vs 0/16 pre-seat), wave-5
still 0/16, and the unexercised stakes (trial-by-combat, six paths, dark
branches) are the named next. Flag for coordinator/tracker: the STANDING
DIRECTIVE's lift condition ("a run demonstrates national reached in
sims") was already met on numbers (national 10/16 both substrates) — but
wins are now structurally nonzero only where the seat is taken; lift is a
coordinator/Steve call, not this arm's.

## Files

- scripts/probe-seatdriveposttable-20261019.js — armed probe (parent probe
  + overtimeTier stamp per daily rec + per death rec + invitation-vs-sitting
  fields; DET/SMOKE/FIDELITY=1/FIDELITY=2 modes; EPERM-flap write retry)
- scripts/analyze-seatdriveposttable-20261019.js — seated attribution +
  dose-response + armed-vs-control before/after (reuses parent attribute())
- scripts/seatdriveposttable-transcripts-20261019.js — SAY-line probe with
  sysSay restored; seated-window capture (sitting-3d → end); fidelity pin
- scripts/test-seatdriveposttable-20261019.js — proof: CLASSIFIER parity +
  TABLE fixtures (invitation/sitting distinction, during/post split,
  tier stamps) + DOSE fixtures + SMOKE + DET — 75/75 pass (RED-verified);
  +COMPLETE=1 gate 108/109 (the 1 fail is the vacuous channel clause)
- scripts/build-seatdriveposttable-panels.js — §15 panel builder
  (before=committed control, after=armed, 16 matched case pairs)
- evidence/2026-10-19/perseed-posttable-seatdrive/{leadfeast,belongfeast}/s64201–s64208.json — 16 armed per-seed JSONs (tier-stamped; top-level boolean won/national/table)
- evidence/2026-10-19/seatdriveposttable-fidelity/{leadfeast,belongfeast}/s64201–s64202.json — 4 tier-stamped OFF-side runs (FIDELITY=1 + FIDWRITE=1; byte-identical to the committed control corpus)
- evidence/2026-10-19/seatdriveposttable-corpus-summary.json — corpus summary (analyzer output)
- evidence/2026-10-19/seatdriveposttable-taxonomy.md — full taxonomy + per-run seated table + seated death rows
- evidence/2026-10-19/seatdriveposttable-transcripts/belongfeast-s64207.txt — 594 SAY lines, d99–102, sat d102, won [FIDELITY-OK]
- evidence/2026-10-19/seatdriveposttable-transcripts/leadfeast-s64204.txt — 347 SAY lines, d87–90, sat d90, won [FIDELITY-OK]
- evidence/2026-10-19/seatdriveposttable-panel.md + .json + -before/-after.json.gz — §15 compare (review_required: won change_signal +0.625 both policies; table regression_signal/watch — the invitation-counting artifact)
- evidence/2026-10-19/sim-seatdrive-posttable.md — this file

## Telemetry deviation check (Steve 2026-10-13)

Ran per-policy:
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current "evidence/2026-10-19/perseed-posttable-seatdrive/<policy>/s*.json" --metrics national,table,wins,exiled`.
LOUD lines: leadfeast — "table swung -87%: baseline 16 -> 2", "wins swung
-69%: baseline 16 -> 5"; belongfeast — "national swung -67%: 12 -> 4",
"table swung -62%: 16 -> 6", "wins swung -69%: 16 -> 5".
VERDICT: regime artifact, no same-run investigation needed. The scale-wall
baseline's `_regime` is the winseat regime (wins 16/16); this substrate is
the seatdrive-win-side regime (wins 10/16, table 8/16 by
invitation-counting) — neither the pre-seat nor the winseat regime. The
baseline was NOT rolled (rolling would destroy the winseat regime note);
the LOUDs are the expected artifact of comparing a different regime.
