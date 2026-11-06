# journey-landing r108 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon to d28)

**Run id:** laneA-20261106T0019Z (scheduled 17:45 CST 2026-11-05, started ~00:21Z 2026-11-06).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start, verified by read-back
below. **Rotation-write discrepancy (5th sighting):** r107's note claimed 0→1 was
written and verified at closeout, but the file read 0 again at this run's start.
The write fails silently and intermittently (deepening r103/r104/r105, r106, r107
all documented it). This run's write is verified immediately below and will be
re-verified at closeout.
**Base:** master@4c7bf78cc at run start (`git pull` already up to date; main tree
clean; disk 24%). **Seed band 1013–1022 (fresh — see below).**
**Registration:** single attempt, succeeded in ~7.6 min (loaded box; `git worktree
add` slow, no EPERM). Heartbeat at registration + 10-min loop (PID 11902).
**Numbering note:** the Lane A counter is global across legs; r107 (landing) was
last, so this run is r108.
Driver: scripts/journey-landing-r108-20261105.js (committed by r107: r107 driver
verbatim except seeds 1013–1022, OUTDIR landing-r108, header, plus the R69
fail-regex fix; diff-verified at run start — only header/seeds/OUTDIR/regex
differ). Analyzer: scripts/analyze-landing-r104-20261105.js (unchanged).
Commit-offer: scripts/analyze-landing-r107-commit-offer.js (unchanged; thread-gate
cases read from saved transcripts by hand).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or gate
change in this run. **Perception law (2026-10-28) stands** — all instruments
read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** a code change lands ONLY if a defect is
proven in game code (not driver policy) with a before/after proof test; otherwise
document and move on. This run carries NO planned code change — the questions are
adjudications; a fix follows only if M-PR1-pooled / M-TG / M-R69 proves a
game-code defect.

## Seed-band freshness (skill: local_seed_band_freshness)
- **Chosen band 1013–1022**, verified fresh across ALL dated preregs (not just
  today's): word-boundary grep for 1013–1022 over `evidence/*/sim-*-prereg.md`
  and `evidence/*/journey-*-prereg.md` returns only round-number filenames
  (sim-scale-onramp-round-1015/1016.md), a 1015Z timestamp, and line-count
  mentions ("-2558 lines") — zero prereg names any of 1013–1022 as panel seeds.
  No corpus files for these seeds exist. r107's own check reached the same
  verdict; this run re-ran the full-scope grep rather than trusting it.
- Contaminated bands NOT reused: 897–906 (r107), 1301–1304 (r107 prereg note),
  917–926, 1001–1010, 1101–1110, 1201–1210, 2001–2010, 3001–3010 (all named in
  r107's prereg as used).

## CORRECTION carried into this run (r107 tele-cap caveat RETIRED)
r107's run note said the R69 tele/line disagreement might be partly caused by
the 300-event telemetry cap and proposed a future run with TELEMETRY_FULL=1.
That caveat is WRONG for this driver: `scripts/journey-landing-r108-20261105.js:1665`
calls `loadGame({ seed, fullTelemetry: true })`, and sim-harness.js sets
TELEMETRY_FULL=1 by default in sims — the tele stream was already uncapped in
r106/r107. The cap cannot explain the disagreement. What CAN explain it, and
r107 already named it, is the SILENT-ARMOR-CRAFT rule: crafts while the player
is away emit a tele event but no narration line, so tele and lines count
different things by design. Q2 below adjudicates that directly instead of
re-running a cap experiment that was already (unknowingly) run.

## Q1 (PRIMARY) — M-PR1 POOLED: IS ENGAGEMENT THE PROMISE BOTTLENECK?
**Why this run, why now:** r107 missed its own M-PR1 bar by one sitting
(7/33 never-offered = 21% vs 25% bar) and its metric review proposed exactly
this: a pooled two-panel bar (r107+r108 sittings, n≈66) or a per-seed bar.
r107's adjudication said the bottleneck is a driver-probe interaction (the
option IS offered; the topic probe prefers gossip), not the game hiding
engagement. This run tests that adjudication at pooled scale.
**Pre-registered metrics (binding):**
- M-PR1-pooled: (r107 never-offered + r108 never-offered) / (33 + r108 sittings).
  If pooled never-offered <25%, the engagement bottleneck is NOT confirmed at
  pooled scale and r107's driver-probe adjudication stands. If ≥25%, the
  bottleneck is confirmed and the next run digs into WHY the option never
  surfaces (not the driver).
- M-PR1-per-seed (secondary, pre-registered now so it is not a mid-run
  re-score): never-offered ≤1 sitting on ≥8/10 r108 seeds = engagement
  surfaces reliably per village; fewer = per-village fragility, name the seeds.
- M-PR2 (carried): of sittings where dlg:commit was PICKED, fraction resolving
  'promised'. ≥80% with all 'stated' refusals explained by the away guard (or
  another honest-by-design guard) = commit path working as designed.
- A miss on any M-PR metric is NO-GO, never re-scored mid-run (metric review
  below if the metric proves wrong).

## Q1b (PRIMARY) — THE THREAD-GATE OPEN QUESTION (r107 seed 1010 d12, n=1)
**Basis:** one r107 sitting (1010 d12) had engagement PICKED but the want stayed
stage 1. Code-read hypothesis from r107: convo-dialogue.js:293 engages only
when the thread is null/'want'/'small' — a non-null thread (gossip, personal)
may block engagement even when the option is picked.
**Pre-registered metric (binding):**
- M-TG: count r108 sittings where engagement was PICKED but the want stayed
  stage 1. For each, read the saved transcript and name the thread at pick
  time. If ≥2 such cases share a non-null/non-'want'/non-'small' thread, the
  thread gate is a REAL mechanism — name it and its frequency. If 0–1 cases,
  the question stays open (n≤2), not a verdict.
- A miss is NO-GO, never re-scored.

## Q2 (PRIMARY) — R69 ARMOR tele/line: BY DESIGN OR REAL?
**Basis:** r107 teleLineDisagree=9/10 seeds with the OLD (contaminated) regex;
the r108 driver narrows the fail regex to the armor-only line. The tele-cap
explanation is retired above (fullTelemetry already on).
**Pre-registered metric (binding):**
- M-R69: with the fixed regex, per-seed tele armor_craft count vs narration
  line count (ok+fail). If tele > lines on disagreeing seeds AND the excess is
  explained by away-crafts (SILENT-ARMOR-CRAFT rule — crafts while the player
  is away emit tele but no line), then R69 CLOSES as by-design: the two counts
  measure different things and the disagreement is expected. If lines > tele
  on any seed, or tele > lines with no away-craft explanation, that is a REAL
  counting defect — name the seed and dig in.
- A miss is NO-GO, never re-scored.

## Q3 (CARRIED) — R104-GOAROUND AT PANEL SCALE (M7)
r107: GOAROUND-HOLDS (6/6 kcal skips). Carried as a regression check.
**Pre-registered metric (binding):** M7-r108 kcal: arrived / kcal-skips ≥80% =
GOAROUND-HOLDS; <80% = GOAROUND-WEAK (name the failing seeds/days and the rung
that stopped). Rung fires reported as counts with seed/day.

## Q4 (CARRIED) — DOORSTEP-OUTINGLIVE REGRESSION (M6)
r107: DOORSTEP-GO (274 checks, 2 triggered, ate 2). Carried as a regression
check: M6 clauses hold (complete eatRecs on triggered steps; 0 class-E scholar
starvation deaths; 0 triggered steps ending enterResult===false). Includes the
R105-DOORSTEP-DRINK-ENTRY fix.

## Q5 (CARRIED) — WATER CLAUSE, STILL UNTESTED
0 wild water skips since r87 (now nineteen runs deep). Record wild outing
iterations + min hydration; if 0 wild water skips again, stays UNTESTED. Not a
re-proof — a standing blind spot, reported, not chased by changing the panel.

## Carried bindings (r107 verdicts, re-judged fresh)
- **M1 ALIVE-D14: 10/10** (no village lost by day 14).
- **M2 SYSTEM CONTACT: 10/10** (first contact ~day 8).
- **M3 FIGHT-LOG:** all hunt fights complete, 0 unknown/mixed trigger.
- **M5 PEOPLE:** wind-down picks, WD probe gates, betrayal held-offers 0, party
  invites spoken/dry; two full transcripts read for sense (SENSE-TESTING LAW).
- **M-R70 (closed r107):** consistency check only — live-promise dawn opps
  with waiting=false should stay explained (has-run / kept / dead promiser),
  0 genuine defects expected.

## Watch items (not verdicts)
- **R73 NARROW-PATTERN:** r107 promised=15, all NARROW, keptInsideNarrow=3
  (r106: 13/13 NARROW). Design input, carried.
- **R66 HUNGRY horizon pantry:** r107 9/10 seeds end hungry (r106: 7/10). The
  landing pantry is a slow leak everywhere, a collapse on one seed in ten.
- **Mantle latency (owed item, r107 seed 1009):** a 2-day gap between scholar
  death and mantle pass (Wanjiru d24 → Felicia d26). Watch whether any r108
  mantle pass exceeds 1 day.
- **Scholar-eats-first (held design question for Steve, not changed):** the
  scholar's villageMeal is drawn BEFORE villagers eat in endDay, so in a famine
  the player eats while villagers starve. Document only.
- **M-A2 design question (for Steve, not re-measured):** the win-plan arms'
  gear/bond/muster/standing stages are proved structurally unreachable before
  day 28 (r106 M-A2, re-confirmed r107). Re-proving the staging adds nothing
  (DELIVER OVER MEASURE).

## Seeds, pilot, shape
- Panel: fresh seeds 1013–1022, DAYS=28, OUTDIR landing-r108 (goal hidden_files
  evidence/2026-11-05/landing-r108).
- PILOT FIRST: 3 seeds (1013–1015) before expanding. The pilot validates (a)
  the seed band (driver runs seeds 1013+), (b) the commit-offer transcript
  method reproduces on the pilot transcripts, (c) Q1/Q1b/Q2 show a live signal
  (ask_favor sittings exist; armor craft lines + tele both populate). If the
  pilot shows 0 ask_favor sittings AND 0 armor crafts, document and still run
  the panel only if the carried bindings need the panel — the pilot decides; do
  not burn a full run on a dead question.
- Shape: pilot validates the R108 commit-offer analyzer populates (no nulls on
  live fields) and the waitDiag live/ledger split reports.

## Metric review (filled at closeout, never mid-run)
- (to be filled)
