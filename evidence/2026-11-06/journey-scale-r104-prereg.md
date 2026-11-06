# journey-scale r104 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-scale-2026-11-06T1217Z (scheduled 05:45 CST 2026-11-06).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a pilot-gate stop is not success; rotation stays 3).
**Base:** master@30fe8dc00 at worktree creation.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price,
nor gate change in this run.
**Perception law (2026-10-28) stands** — all instruments read-only
except the TEND_PEER arm, which presses only the offered Haven-panel
verb tendLink (a menu item a player can press); pickers press offered
menu items only.
**DELIVER OVER MEASURE (2026-11-01):** this run tests the lever r103
named, it does not re-prove r103's diagnostic. r103 (92701–92704,
TEND_PEER=0) named the national block: RUNG 296 gate-days, NO-SHAPE
35, ZERO seasoned peers on any seed — links form at trust 30 and
COOL, nothing tends them to the 40 bar (tended=0, tendPeer=0 on all
four seeds; TEND_PEER is opt-in and off). This run turns the arm ON.

## Standing context (read before scoring)
- r103's metric review proposed exactly this run: "TEND_PEER=1 on this
  band — does pressing tendLink on below-40 links season them and
  stage a national beat? If yes, the block is policy-side (the
  standing competent policy should tend); if no, it is engine-side
  (trust gains too weak / cooling too strong)." That is Q1 here.
- The TEND arm already exists in the r103 driver (line 46, 497–502):
  after courtship, press tendLink on each active PEER link
  (covenant/trade, primary null) below trust 40, pantry-gated at
  12,000 kcal, counting ctx.tendPeer. LEAD links are untouched by the
  arm (the base policy's fourthlink block tends primary==='haven'
  links weekly when pantry > 20,000; r103 reported tended=0, so that
  block never fired either — pantry-thin or no eligible week).
- r103 control (same base lineage, TEND_PEER=0): 0 seasoned peers,
  0 national staged, 0 courtNational answers, on 4/4 seeds. That
  panel is the comparator for this arm. It is a CROSS-BAND comparison
  (927xx control vs 957xx arm), not a matched panel — stated here so
  no matched-panel claim is made in the run note. The claimed effect
  (0 seasoned → seasoned + staged) is large; if the arm shows it,
  the cross-band read is honest. If the arm shows nothing, the
  verdict is mechanism-naming, not a panel verdict.
- Known risk, named in advance: the arm's pantry gate is 12,000 kcal
  and r103 seeds ended at pantry 0–2,303. If tendPeer stays 0 because
  the pantry never clears 12,000, the verdict is NO-GO with the
  mechanism named (the arm's gate, not the engine's trust gain,
  binds) — that is a finding, not a failed run.
- Scale leg verdicts carried: REACHABLE partly (regional 4/4,
  national 0/4), FUN yes, WINNABLE not yet (no national, no global,
  no full seat on any seed in either r102/r103 quad).
- Canon (read): docs/CANON.md, docs/SCALE.md. Seasoned = 30+ days
  old AND trust 40+ (conquered: the season, not the trust; MERCY
  grace counts while mercyUntil holds). National stages only when the
  rung is ready (networkLiveDay + 30) AND one shape qualifies AND it
  is not deferred past today; shape priority lead → belong →
  covenant → trade.

## Freshness (seed-band skill, full scope — all dated preregs + all
## dated .md + evidence filenames + forbidden-band lists)
Band **95701–95704** verified fresh BEFORE any seed runs, via
`git grep` over `*.md` + `scripts/*` + `docs/*` (tracked files;
the filesystem grep was abandoned as too slow under load 13–18).
Rejected bands, each with its source:
- 93101–93104: r88 deepening (2026-11-03, journey-deepening-r88).
- 93301–93304: r90–r92 deepening (2026-11-03/04 preregs).
- 93501–93504: r92/r93 deepening (2026-11-04).
- 93701–93704, 93901–93904, 94301–94304, 94501–94504: dated-.md
  hits throughout (2–19 per seed).
- 95101–95104: sim-cookbulk-confirm-b used 95101–95116
  (2026-10-19; its own note records 95101 value-match noise, but the
  band itself is named and used).
- 95301–95304: dated-.md hits (6–21 per seed).
- 95501–95504: 95504 appears in a 2026-11-02 prereg scan band
  (95497–95504, sim-sumconfirm-a-prereg.md:59); 95501–95503 clean
  but the band is not whole.
- 95701–95704: **0 hits each** (word-boundary, all of *.md +
  scripts/* + docs/*). Filename hits for 9570*: none.
  Smoke seed 95700: 0 hits. Absent from the tendbelow forbidden
  list (99001–99008, 99009–99024 contaminated, 99041–99052, 99101,
  99201–99216, 99217–99232, 99401–99412, 99601–99612, 99701–99708,
  99801–99808, 98701–98716, 89701–89707, 83601–83800,
  16101–16116, 99901–99912). The only "957" strings found anywhere
  are a commit-hash fragment (5aa816b4…b957cb2405efb7) and 0.957
  decimals — not seed uses (same class as r103's hash-fragment
  exemption).

## Tooling (driver + analyzer clones; zero src/js)
- **Driver:** scripts/journey-scale-r104-20261106.js = r103 driver,
  labels/seeds/EVIDIR only (95701–95704, DAYCAP 180, CONVO_DAYS
  [90, 120], policy scalecourt-nogate-morntrace3 UNCHANGED,
  natGateWatch instrument UNCHANGED), run with **TEND_PEER=1**
  (the r103 driver's own env-gated arm; no code change to the arm).
  The arm presses the offered tendLink verb on active peer links
  below trust 40 when pantry > 12,000 kcal, counting ctx.tendPeer.
- **Analyzer:** scripts/analyze-journey-scale-r104-20261106.js =
  r103 analyzer, labels only (PREFIX default journey-scale-r104,
  seeds 95701–95704), nat-gate section UNCHANGED.
- **Proof test:** scripts/test-journey-scale-r104-natgate-20261106.js
  = r103 proof test, labels only (31 checks on classifyNatGate /
  summarizeNatGate). Must be green before any scored seed runs. Not
  on the green list (same precedent as the r102/r103 proof tests —
  do not add it). Driver emission of tendPeer counts is proved by
  the smoke run (counter present in output, arm path exercised),
  reported in the run note.

## Q1 — TEND_PEER ARM (primary, binding)
**Question:** with TEND_PEER=1, do peer links season (trust → 40+ at
30+ days) and does a national beat stage on fresh seeds?
**Verdict:**
- **PASS** — at least one seed stages a national beat
  (pendingNational set or nationalLive) OR reaches 3 seasoned peers
  in one shape. The block is policy-side: the standing competent
  policy should tend. The follow-up (make tending default) is a
  next-run / Steve-call question, NOT a change in this run.
- **PARTIAL** — tendPeer fires and link trust rises vs the r103
  control (trustSetLog shows tend-driven gains), but no shape
  reaches 3 seasoned / no beat stages. The mechanism moves; the bar
  is unmet. The note names how far trust got and what else binds.
- **NO-GO** — tendPeer never fires (pantry never clears 12,000, or
  no peer links form) OR trust does not move on tended links. The
  block is engine-side (trust gains too weak / cooling too strong)
  or gate-side (the arm's pantry gate binds). The note names which,
  from the trustSetLog + pantry trace.
**What would count as interesting:** (a) a covenant/trade shape
seasons to 3 and stages — the r103 block falls on the first lever;
(b) tendPeer fires often yet trust still cools — tendLink's gain is
weaker than the cooling rate, an engine number to name; (c) the arm
never fires for pantry reasons while lead links also go untended —
the pantry economy, not trust, is the binding constraint on the
whole ladder; (d) STAGE-EXPECTED persisting — a staging defect,
named as such (r103 found stageExpectedMaxRun=0; any persistence
here is new).
**Pilot gate:** smoke seed 95700 × DAYCAP=45 runs first (proves the
driver + TEND arm executes: tendPeer counter in output, no crash);
then seed 95701; if either crashes or pilgrimages == 0, STOP.

## Q1b — DRAIN SEPARATOR (report-only; r103 metric-review item)
The per-night burn formula is RETIRED (r103 metric review): the
formula is the engine's formula fed stale inputs. This run carries
only the separator check (drain separates on pack water / tile
water) from the night rows. No threshold, no verdict. If a
multi-day dry stranding reproduces (r103's 92701 watch item: 10 days
at 0 hydration one tile from Haven), name its day/seed — it would
elevate the watch item toward a design question.

## Q2 — CENSUS CONTINUITY (report-only; r93–r103 metric unchanged)
Seasoned-peer count AND scatter-day gap per seed; national count
reported alongside, not the judge. Rank transitions, courtNational
answers, seat/arc/tableWaiting as before. tendPeer/tended counts
reported per seed. No threshold, no verdict.

## Q3 — PEOPLE CHECK (sense law; corpus rule as r96–r103)
One full sitting read in full from a surviving seed at day 90 if one
exists, else day 120; no day substitution if none survives to either.
Corpus size is reported, not padded. Verdict: real vs
filler/faked-history, with quoted lines.

## Q4 — WATER CONTROL (report-only; phenomenon-absence check)
Walk-out dry/partial/wet counts as r99/r100/r102/r103, on the fresh
band. Expectation: dry 0 (phenomenon absent on this base). Any dry
walk-out is named with its day and the refusal lines — it would
reopen the fill-placement question the r102 deferral holds. Not a
verdict.

## Fix gate (clause (a) discipline, as r96–r103)
A src/ change lands only if this run's trace identifies a concrete
mechanism AND the fix is a policy-instrument-proven or shipped-study
mechanic change — a trace alone does not meet the gate. This run's
only behavior change is the TEND_PEER env flag on the existing arm
(a policy choice, not a src change): if Q1 PASSES, the standing
policy is NOT changed here — the default-tend question goes to the
next run with its own prereg (and, if it touches the standing
policy, to Steve's call). No src/js change is expected from this run.

## What this run does NOT do
- Does not test a fill placement or re-judge the water verdicts
  (r100/r102/r103 stand: phenomenon absent on this base).
- Does not build the NPC bond-proposer system (V-INIT-BOND — a
  builder brief, not a tweak; build-bond-initiate owns it in another
  worktree).
- Does not test the BELONG road (belong=- on all r103 rows; a
  belong-seeking policy arm is a separate question, not this run).
- Does not change succession release, seed priority, the
  question-first-openings design question, win prices, deed gates, or
  any balance number.
- Does not re-judge villager goals, standing trace, betrayal sittings,
  beast-trick teaching, or the standing/scale two-rulers finding.
  Those are carried as context only.

## Metric review (required section in the run note)
No pre-registered metric is re-scored mid-run. If a metric proves
wrong, it is written here and the revision proposed for the NEXT run.
