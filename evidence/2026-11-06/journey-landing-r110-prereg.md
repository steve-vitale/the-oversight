# journey-landing r110 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon to d28)

**Run id:** laneA-20261106T1245Z (scheduled 06:45 CST 2026-11-06, started ~13:39Z).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start, verified by read-back.
**Rotation-write discrepancy (7th sighting):** r109's note verified the file read
`1` at its closeout, but the file read `0` again at this run's start — and its
mtime was 13:36:32Z, ~3 min BEFORE this run started (13:39:08Z). Something
rewrote it to `0` shortly before this run; no lock existed, no other Lane A run
note exists between r109's closeout and this start. The write itself is verified
immediately above and will be re-verified at closeout. The discrepancy remains
unexplained; it does not change this run's leg (file read 0 → landing, and r109
prepared the r110 landing driver for exactly this run).
**Base:** master@079b7ede2 at run start (`git pull` already up to date; main tree
clean; disk 22%). **Seed band 1033–1042 (fresh — see below).**
**Registration:** single attempt, succeeded in ~83s. Heartbeat at registration +
10-min loop (PID 40690, log /tmp/hbloop-r110.log).
**Numbering note:** the Lane A counter is global across legs; r109 (landing) was
last, so this run is r110.
Driver: scripts/journey-landing-r110-20261106.js (committed by r109: r109 driver
verbatim except seeds 1033–1042, OUTDIR landing-r110, header; diff-verified at
run start — only header/seeds/OUTDIR differ, modulo a sed artifact on `200 * 1024`
where the checker's own `102[0-9]` pattern rewrote `1024`). Analyzer:
scripts/analyze-landing-r104-20261105.js (unchanged). Commit-offer:
scripts/analyze-landing-r107-commit-offer.js (unchanged; thread-gate cases read
from saved transcripts by hand). Fights: scripts/analyze-fights89-20261102.js.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or gate
change in this run. **Perception law (2026-10-28) stands** — all instruments
read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** a code change lands ONLY if a defect is
proven in game code (not driver policy) with a before/after proof test; otherwise
document and move on. This run carries NO planned code change — the questions are
adjudications and watches; a fix follows only if Q2 proves a game-code defect.

## Seed-band freshness (skill: local_seed_band_freshness)
- **Chosen band 1033–1042**, verified fresh across ALL dated preregs (not just
  today's): word-boundary grep for 1033–1042 over `evidence/*/sim-*-prereg.md`
  and `evidence/*/journey-*-prereg.md` returns only incidental numbers
  ("fromStart ~1033" in sim-allycap-a-prereg.md; a kcal figure "1040" in
  sim-packcomp-b-prereg.md) and zero prereg names any of 1033–1042 as panel
  seeds. No corpus files for these seeds exist. (r109 independently verified
  the same band when preparing the driver.)
- Forbidden/contaminated-band files checked explicitly (no hits for 1033–1042):
  evidence/2026-11-06/sim-spandraw-census-a-prereg.md,
  evidence/2026-11-06/sim-finishprobe-a-prereg.md,
  evidence/2026-11-05/sim-gearoff-confirm-b-prereg.md,
  evidence/2026-11-05/sim-trickoff-confirm-b-prereg.md,
  evidence/2026-11-05/journey-social-life-r144.md.
- Contaminated bands NOT reused: 897–906, 1301–1304, 917–926, 1001–1010,
  1101–1110, 1201–1210, 2001–2010, 3001–3010 (all named in r107/r108 preregs as
  used).

## Q1 (WATCH) — THE THREAD-GATE OPEN QUESTION (r107 seed 1010 d12, n=1)
**Basis:** one r107 sitting (1010 d12) had engagement PICKED but the want stayed
stage 1. Code-read hypothesis from r107: convo-dialogue.js engages only when
the thread is null/'want'/'small' — a non-null thread (gossip, personal) may
block engagement even when the option is picked. r108 returned 0 cases; r109
returned 0 cases (option offered twice, picked 0×).
**Pre-registered metric (binding):**
- M-TG: count r110 sittings where engagement was PICKED but the want stayed
  stage 1. For each, read the saved transcript and name the thread at pick
  time. If ≥2 such cases share a non-null/non-'want'/non-'small' thread, the
  thread gate is a REAL mechanism — name it and its frequency. If 0–1 cases,
  the question stays open (n≤2), not a verdict. Pooled with r107+r108+r109:
  a second instance anywhere in the four panels (n=2) also counts as a
  mechanism candidate, to be named with its thread.
- A miss is NO-GO, never re-scored.

## Q2 (PRIMARY) — FLESH CHANNEL POST-FIX: DID THE POISON-RETET FIX HOLD?
**Basis:** r109 proved a game-code defect (seed 1027: belltoad flesh re-tested
6× after the Codex knew it poison) and landed the fix in master (7db5b4115:
`monsterFoodPoisoned(mid)` guard on all three experiment scans). This panel
runs ON the fix. The question is whether the fix holds in the wild and what
the channel's stuck seeds look like now.
**Pre-registered metric (binding):**
- M-FLESH: per-seed arrival/test/exit/stuck-cause. Poison re-test count must
  be 0 — any re-test of known-poison flesh on this panel is a FIX REGRESSION
  (read the seed's meat ledger end to end before calling it). If ≥3 r110
  seeds share one stuck cause (rot / poison / no-arrival-with-kills), that
  cause is a named channel defect to dig into. If stuck seeds are ≤2 with
  mixed causes, the friction stays documented noise. Pooled r107+r108+r109
  exit rate 7/10 each run; r110 exit rate reported for the record, no bar on
  the pooled rate (the question is the cause, not the rate).
- A miss is NO-GO, never re-scored.

## Q3 (CARRIED, REVISED) — ENGAGEMENT REGRESSION LINES (M-PR1 / M-PR2)
r109's metric review proposed retiring the per-panel M-PR1 bar and revising
M-PR2 to exclude away-guard refusals; this run ADOPTS both revisions (they
were proposed for the next run, and this is the next run):
- M-PR1 per-panel <25% bar: RETIRED. Judge engagement on the per-seed bar
  (never-offered ≤1 sitting on ≥8/10 seeds) PLUS transcript adjudication of
  every never-offered sitting. The pooled never-offered rate stays reported
  for the record.
- M-PR2 revised: of sittings where dlg:commit was PICKED, fraction resolving
  'promised' / (picked − away-guard refusals) ≥80% = line holds. The
  away-guard share is reported separately, and all 'stated' refusals are
  explained case by case (the R72 away-guard is by design).

## Q4 (CARRIED) — R104-GOAROUND AT PANEL SCALE (M7)
r108: GOAROUND-HOLDS (3/3 kcal skips); r109: UNTESTED (0 cases). Carried as a
regression check.
**Pre-registered metric (binding):** M7-r110 kcal: arrived / kcal-skips ≥80% =
GOAROUND-HOLDS; <80% = GOAROUND-WEAK (name the failing seeds/days and the rung
that stopped). Rung fires reported as counts with seed/day.

## Q5 (CARRIED) — DOORSTEP-OUTINGLIVE REGRESSION (M6)
r109: DOORSTEP-GO (282 checks, 4 triggered, ate 4). Carried as a regression
check: M6 clauses hold (complete eatRecs on triggered steps; 0 class-E scholar
starvation deaths; 0 triggered steps ending enterResult===false). Includes the
R105-DOORSTEP-DRINK-ENTRY fix.

## Q6 (CARRIED) — WATER CLAUSE, STILL UNTESTED
0 wild water skips since r87 (now twenty-one runs deep). Record wild outing
iterations + min hydration; if 0 wild water skips again, stays UNTESTED. Not a
re-proof — a standing blind spot, reported, not chased by changing the panel.

## Carried bindings (r109 verdicts, re-judged fresh)
- **M1 ALIVE-D14: 10/10** (no village lost by day 14).
- **M2 SYSTEM CONTACT: 10/10** (first contact ~day 8).
- **M3 FIGHT-LOG:** all hunt fights complete, 0 unknown/mixed trigger.
- **M5 PEOPLE:** wind-down picks, WD probe gates, betrayal held-offers 0, party
  invites spoken/dry; two full transcripts read for sense (SENSE-TESTING LAW).
- **M-R70 (closed r107):** consistency check only — live-promise dawn opps
  with waiting=false should stay explained (has-run / kept / dead promiser),
  0 genuine defects expected.

## Watch items (not verdicts)
- **R73 NARROW-PATTERN:** r109 promised=8, all NARROW, keptInsideNarrow=2
  (r108: 13/13 NARROW). Design input, carried.
- **R66 HUNGRY horizon pantry:** r109 4/10 seeds end hungry (r108: 7/10,
  r107: 9/10). Starvation deaths 0 on r109. The landing pantry is a slow leak
  everywhere, a collapse on one seed in ten.
- **Mantle latency (owed item, r107 seed 1009):** a 2-day gap between scholar
  death and mantle pass. r109 saw latency 1 only. Watch whether any r110
  mantle pass exceeds 1 day.
- **Kill-mean trend (telemetry watch):** per-seed monster-kill mean climbed
  three panels running (r107: 20.5 → r108: 24.4 → r109: 28.5) with overlapping
  ranges; no kill-affecting change is in this run (branch touches nothing in
  game code unless Q2 forces a fix; driver is r109-verbatim), so the trend is
  reported, not chased.
- **Scholar-eats-first (held design question for Steve, not changed):** the
  scholar's villageMeal is drawn BEFORE villagers eat in endDay, so in a famine
  the player eats while villagers starve. Document only.
- **M-A2 design question (for Steve, not re-measured):** the win-plan arms'
  gear/bond/muster/standing stages are proved structurally unreachable before
  day 28 (r106 M-A2, re-confirmed r107/r108/r109). Re-proving the staging adds
  nothing (DELIVER OVER MEASURE).

## Seeds, pilot, shape
- Panel: fresh seeds 1033–1042, DAYS=28, OUTDIR landing-r110 (goal hidden_files
  evidence/2026-11-06/).
- PILOT FIRST: 3 seeds (1033–1035) before expanding. The pilot validates (a)
  the seed band (driver runs seeds 1033+), (b) the commit-offer transcript
  method reproduces on the pilot transcripts, (c) Q1/Q2 show a live signal
  (ask_favor sittings exist; flesh arrivals populate). If the pilot shows 0
  ask_favor sittings AND 0 flesh arrivals, document and still run the panel
  only if the carried bindings need the panel — the pilot decides; do not burn
  a full run on a dead question.
- Shape: pilot validates the R108 commit-offer analyzer populates (no nulls on
  live fields) and the waitDiag live/ledger split reports.

## Metric review (filled at closeout, never mid-run)
- (to be filled)
