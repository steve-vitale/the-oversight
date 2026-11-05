# STANDACCUM3 — standing accumulation, part 3: the flat-20 mechanism (Loop B verdict, run fleshout-loop-b-20261105T0830Z, arm sim-standaccum3-b)

Axis: winnability chain. DIAGNOSTIC ONLY, zero src/js. No readyDemand
move, no VETSHAPE flip, no gate/price/deed change, no policy variant.
The 99141–99148 corpus is CONTEXT ONLY; the verdict below comes from
the anchor re-run + the fresh band 99191–99198.

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-05/sim-standaccum3-b-prereg.md`
(commit b50691dc7). In short: anchor seed 99145 re-run + fresh band
99191–99198, competent policy verbatim, default env, 150d death-aware
horizon, standaccum3 instrument (vetprod reused verbatim + standing
decomposition per snapshot: war/diplomacy/plenty, w3/w4/w5 ledger
points, wave-3 per-type map, link roll, feast quality histogram,
plenty-capped total, peak wave, defer4/defer5 holds). PRIMARY metric:
count of FLAT-20 seeds on the fresh band + the identified mechanism.
Verdict DIAG-GO iff (i) the anchor reproduces — the 99145 re-run
meets the 99145-mechanism decomposition (war 0, w3pts 0, diplomacy 0,
feasts <= 1, endRaw <= 25, >= 15 wave-2+ fights) — AND (ii) >= 1
fresh-band seed is FLAT-20 with the SAME decomposed shape. DIAG-NO
iff zero FLAT-20 seeds and >= 6 of 8 fresh seeds show standing
tracking activity. Balanced panel (§15): INAPPLICABLE for a pure
diagnostic on a fresh band with no before/after comparison — stated,
not fabricated.

## Verdict — DIAG-GO (judged strictly against the prereg)

- The anchor reproduces EXACTLY (see trajectory below): 68 days,
  village-lost, 75 fights, endRaw 20 = war 0 / diplomacy 0 / plenty
  20, w3pts 0, 1 feast, 0 links, 0 instrument errors. The
  decomposition matches the prereg's candidate mechanism point for
  point.
- One fresh-band seed is FLAT-20 with the SAME shape — 99196:
  endRaw 0, war 0, w3pts 0, diplomacy 0, feasts 0, 26 wave-2+ fights
  (12 of them wave 3), flat band 0 over its whole 41-day run. The
  mechanism is identified AND reproduced on a fresh seed.
- Standing tracks activity on the other 7 fresh seeds (7/8
  activity-tracking), so this is not a band-wide flatness artifact:
  the flat shape is what happens to a village that fights wave 3
  and kills none of it. The DIAG-NO leg (zero flat-20) does not
  apply.

## THE ANSWER (plain words)

A village that fights constantly can sit at standing 20 — or zero —
because standing is earned by kills, bonds, and feasts, and this
village earned almost none of the three. Its fighters met the third
wave eighteen times and killed none of it: they fled eleven times,
dodged four, died once. Fights score nothing — only kills score,
and only kills of wave-3 monsters or harder, one point per kill (two
for a counter-kill), capped at two points per monster kind. No
wave-3 kill means no war standing at all, however many fights the
village survives. Bonds score nothing either: the village formed no
links at all, so there was nothing to season into diplomacy. The
only standing it ever held came from a single feast — twenty points
for one good night, on day 38, and then nothing for the last thirty
days while the roster bled down and the village died. The fresh band
proves it is not a one-seed fluke: a second village fought twelve
wave-3 fights, killed none of them, held no feast, formed no link,
and died at standing zero. The gate is innocent here — nothing held
the number down; there was simply nothing to hold. Standing is flat
because the village's blood, bonds, and bread are all flat.

## The named mechanism (with code citations)

1. WAR IS KILLS-ONLY, WAVE-3+-ONLY. `villageStanding()`
   (src/js/standing.js) sums `waveLedgerPoints(3)+points(4)+points(5)`
   × 25. `scoreLedgerKill()` (src/js/waveLedger.js) scores ONLY via
   `recordWaveKill` — engagements, flees, and evasions score nothing —
   1 point per kill (2 for a counter-kill), per-type cap 2. A wave-3
   fight that ends in flight, evasion, or death scores 0. On 99145:
   18 wave-3 fights, 0 wave-3 kills → w3pts 0 → war 0. On 99196: 12
   wave-3 fights, 0 kills → war 0.
2. DIPLOMACY IS STRUCTURALLY ABSENT UNDER COMPETENT PLAY.
   `villageStanding()` counts only seasoned links that are regional+
   (`_linkRegionalPlus`, standing.js — a lone seasoned bond scores 0).
   `hierarchyState()` is EMPTY on all 9 seeds of this arm (0 links
   total, 0 seasoned, 0 regional+) → diplomacy 0 everywhere. Not
   "links unseasoned" — no link is ever formed, so the +34/link
   source never fires at all.
3. PLENTY IS THE ONLY MOVING SOURCE ON A FLAT VILLAGE. +20 per
   major feast (quality>=1, `state.feastLog`). 99145 hosted exactly
   one (quality 1, day 38) → raw 20. 99196 hosted none → raw 0.
4. NO GATE OR HOLD EXPLAINS THE FLATNESS. gated == raw on both flat
   seeds (defer4 needs raw >= 100; cap/defer5 need raw/capped >=
   200). The flatness is in the INPUTS, confirmed by the
   decomposition — not a hold, not a cap, not decay (there is no
   decay in the code), not a measurement artifact (the instrument
   reads the same functions the gate reads, 0 errors).

## The anchor trajectory — 99145 (quoted)

- Raw standing 0 on days 1–37 (35 snapshots), then exactly 20 from
  day 38 (the single feast, quality 1, day 38) to day 68 (33
  snapshots). One step, then flat for the last 31 days while the
  roster bled 12 → 4 living.
- Fights: 75 total — 41 wave-1 (25 kills), 16 wave-2 (10 kills),
  18 wave-3 (0 kills). Wave-3 outcomes: vFlee 11, evade 4, mFlee 1,
  None 1, vDie 1. Wave-2 ledger points 9 (the wave-3 rung was met;
  wave 3 was unlocked — unlockedWave 3 at end).
- Links: 0 total the whole run. Feasts: 1. Gated == raw on every
  snapshot (no hold ever bound). Killers: none. The village was
  lost on day 68.
- Cross-check vs the encounterprod corpus: the re-run reproduces
  the old corpus exactly on the judged fields (68d, village-lost,
  75 fights, 41/16/18 wave split, 35 kills, raw/gated 20).

## The fresh flat seed — 99196 (quoted)

- Raw standing 0 on ALL 40 snapshots, days 1–41. Flat band 0 over
  the whole run; 26 wave-2+ fights, all inside the flatness window.
- Fights: 74 total — wave-1 48 (24 kills), wave-2 14 (7 kills),
  wave-3 12 (0 kills). Wave-3 outcomes: vFlee 5, None 3, mFlee 3,
  vDie 1 — not one wave-3 kill. Wave-2 kills 7 (they fill the wave-3
  ledger rung, but wave-2 points pay ZERO war standing).
- Feasts: none. Links: 0. Gated == raw (0) throughout. The village
  was lost on day 41. Same mechanism as the anchor, purer: not even
  one feast to show for 41 days of fighting.

## Per-seed table (anchor + fresh band, all error-free)

days = run days; end = village-lost on all 9; un = unlockedWave at
finalize; w2+ = wave-2+ fights; w3f/w3k = wave-3 fights/kills;
kbw = kills by wave (w1/w2/w3/w4); eRaw/eGat = end raw/gated;
w/d/p = end war/diplomacy/plenty; w3p = end wave-3 ledger points;
fst = feasts (quality>=1); lnk = links total; flat = FLAT-20;
same = same-shape decomposition; trk = activity-tracking;
kev = killers ever; maxL = max living killers.

| seed | days | un | w2+ | w3f | w3k | rate | kbw | eRaw | eGat | w/d/p | w3p | fst | lnk | flat | same | trk | kev | maxL |
|------|------|----|-----|-----|-----|------|-----|------|------|-------|-----|-----|-----|------|------|-----|-----|------|
| 99145* | 68 | 3 | 34 | 18 | 0 | 0.00 | 25/10/0/0 | 20 | 20 | 0/0/20 | 0 | 1 | 0 | NO† | YES | NO | 0 | 0 |
| 99191 | 111 | 4 | 45 | 14 | 2 | 0.14 | 34/18/2/0 | 110 | 110 | 50/0/60 | 2 | 3 | 0 | NO | NO | YES | 0 | 0 |
| 99192 | 64 | 3 | 49 | 26 | 4 | 0.15 | 26/11/4/0 | 100 | 99 | 100/0/0 | 4 | 0 | 0 | NO | NO | YES | 0 | 0 |
| 99193 | 97 | 3 | 52 | 29 | 3 | 0.10 | 23/19/3/0 | 75 | 75 | 75/0/0 | 3 | 0 | 0 | NO | NO | YES | 0 | 0 |
| 99194 | 73 | 4 | 29 | 7 | 1 | 0.14 | 21/11/1/0 | 105 | 105 | 25/0/80 | 1 | 4 | 0 | NO | NO | YES | 0 | 0 |
| 99195 | 107 | 4 | 67 | 27 | 6 | 0.22 | 24/16/6/2 | 220 | 199 | 200/0/20 | 6 | 1 | 0 | NO | NO | YES | 2 | 1 |
| 99196 | 41 | 3 | 26 | 12 | 0 | 0.00 | 25/7/0/0 | 0 | 0 | 0/0/0 | 0 | 0 | 0 | YES | YES | NO | 0 | 0 |
| 99197 | 126 | 4 | 38 | 13 | 6 | 0.46 | 31/18/6/0 | 125 | 125 | 125/0/0 | 5 | 0 | 0 | NO | NO | YES | 0 | 0 |
| 99198 | 140 | 4 | 71 | 24 | 7 | 0.29 | 44/18/7/3 | 245 | 199 | 225/0/20 | 6 | 1 | 0 | NO | NO | YES | 2 | 1 |

(* anchor, not a band member. † 99145 is not FLAT-20 as implemented:
its single feast step 0 → 20 on day 38 falls inside the final-50-day
window, so its band reads 20, not ≤ 5 — see Metric review. Its
decomposition reproduces exactly, which is what the prereg's anchor
clause requires.)

Fresh-band totals: 149 wave-3 fights, 29 wave-3 kills (19% kill
rate); 45 wave-4 fights, 5 wave-4 kills. The two flat seeds are the
only ones with ZERO wave-3 kills — and zero is what makes war zero.
Every other seed killed at least one wave-3 monster and banked
25–225 war standing from it. Diplomacy is 0 on all 8 fresh seeds
(0 links anywhere). Plenty ranges 0–80 (0–4 feasts).

## Wall numbers (fresh band, baseline observations)

Wins 0/8. National 0/8, table 0/8 (scaleRank "village" on all 8; no
seed leaves village scale). Wave-4 unlocks 5/8, wave-4 faced 5/8
(same seeds), wave-4 kills 5, wave-5 unlocks 0/8, wave-5 faced 0/8,
wave-5 kills 0. Readiness-5-ready days 0/8. Median run-days 102
(sorted: 41 / 64 / 73 / 97 / 107 / 111 / 126 / 140; all 8 villages
lost, none censored). Village death-cause shares: not instrumented
by this arm — not reported, not guessed.

## Reachability verdict

Waves 1–4 are reached and faced (5/8 seeds face wave 4, 5 kills);
wave 5 is unlocked on no seed, faced on no seed, killed on no seed.
Regional → national, the table, and the win flag are unreached on
all 8 fresh seeds. The wall has not moved on this band — and this
arm tightens the diagnosis: on the two flat seeds the wall is not
the readiness gate or the standing cap, it is the war source
itself. A village that cannot kill wave 3 cannot earn the standing
that opens wave 4, and two of eight villages could not kill wave 3
at all.

## Village assessment (plain words)

Picture eight villages playing competently. Five of them open the
fourth wave; two of those blood fighters against it — and each
village's two killers arrive one after the other, never together
(see Premise below). Seven villages earn their standing the hard
way: a few wave-3 kills here, a feast there, climbing to 75, 100,
110, 125, and two of them all the way to 220 and 245 raw — held at
199 gated by the readiness deferral, waiting on armor, weapons, and
veterans. The eighth village earns nothing at all: forty-one days,
seventy-four fights, thirty-two kills of lesser beasts, and
standing zero — it never killed the wave that pays, never feasted,
never linked with anyone, and died without the System ever having
noticed it. The anchor village is the same story with one feast to
its name: famous for a single night, then flat for a month while it
died. What is missing is not a gate to open. It is the ability to
kill the third wave — and, behind that, any bond with another
village at all. No village in this band formed a single link.

## Premise (standaccum2 lesson — counted separately)

Seeds with two LIVING wave-4 killers on any snapshot day: 0/8
fresh (0/9 including the anchor). 99195 banked 2 killers ever
(gen_pkoc5dm d86→d89, 3 days; lucas_brown d90→d98, 8 days) and
99198 banked 2 (theo_lindqvist d57→d61, 4 days; visjoin_94
d111→d139, 28 days) — in both cases strictly sequential, maxLiving
1, exactly the standaccum2 shape: killers never coexist. The
release question stays unobservable on this band for the same
reason as on 99111–99126. This arm does not judge release; it
records the premise so the next arm inherits a clean separation.

## Sense-test (this arm's own corpus, judged for meaning)

- The village IS told the three sources, once, on day 25, on all 9
  seeds, verbatim: 📺 "But real talk? The next act needs a BIGGER
  STAGE. I can't stage it with ONE fire — there's not enough of you
  to REFLECT, you feel me? Get me STANDING — blood, bonds, or bread.
  Rack up the kills, season your alliances, or feast like legends.
  Make it worth escalating." The instruction is honest and complete.
  After that, silence: no standing line, no ledger beat, and no hold
  beat appears in any captured transcript on any seed — the villages
  at gated 199 (99195, 99198) and gated 99 (99192, raw 100 held 11
  days, d54–64) are never told why they are held, in anything the
  capture saw.
- The hold-beat silence was chased, not assumed. A re-run of 99192
  in the exact judged configuration (probe /tmp/probe-holdbeat3.js,
  not committed) reproduces the trajectory exactly (64d, raw 100
  from d54, gated 99) and still captures no hold line — while the
  beat's own day-stamp state ends at {"4":61}, consistent with a
  first fire on d54 plus a 7-day reminder on d61. The stamps move;
  the words never reach the transcript. Whether the lines were never
  said (sysSay gating) or said outside the captured channel is NOT
  established by this arm — recorded here as an open flag for a
  targeted probe (one that records `_standingDeferBeat` + all sysSay
  calls directly), not as a verdict input. The verdict rests on the
  state decomposition, not on the says.
- The veteran-word collision reproduces for the fifth time: wave-3
  kills are cheered on camera as "veteran kills" ("Dylan just put
  down The Terms of Service... on CAMERA. That's a veteran kill,
  folks. REMEMBER the name." — d32, 99192; same line for The
  Redactor, Spool), while the readiness bar wants villager veterans
  ("blood your fighters (0 of 2 veterans)"). A village told to blood
  veterans while hearing "veteran kill" for a Spool is being given a
  riddle, not an instruction. (Standaccum2's blank #3; still open.)

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- CLAUSE C FLAW (found by the anchor, not by re-scoring): the
  flat-20 rule's 50-day window catches the anchor's single feast
  step (0 → 20 on day 38), so the anchor's band reads 20 and the
  anchor fails its own flatness rule even though it is flat for its
  last 31 days. The prereg's anchor clause never required clause C
  (reproduction = decomposition), so the verdict is unaffected —
  but the FLAT-20 definition as implemented is stricter than its
  motivating example. Proposed revision for the NEXT run: measure
  flatness over the last 30 days, or over the longest flat run, or
  exclude a single step when the value is constant on both sides of
  it. Do not silently re-run this band under a revised rule.
- ANALYZER CORRECTION (disclosed, corpus untouched): the analyzer
  as first written computed DIAG-NO because its `anchorReproduces`
  required `anchor.flat20 && anchor.sameShape` — stricter than the
  prereg, which defines anchor reproduction as the decomposition
  (war 0, w3pts 0, diplomacy 0, feasts <= 1, endRaw <= 25, >= 15
  wave-2+ fights). Corrected to the prereg's letter → DIAG-GO.
  The judged numbers are identical under both computations (same
  corpus, same counts, same decompositions); only the verdict-rule
  application changed, to match the prereg. Proof extended with
  fixture 13 (the exact anchor-step shape → GO); proof is 23/23
  green on the final code. The first (wrong) computation is
  recorded here, not hidden: DIAG-NO under the stricter reading,
  DIAG-GO under the prereg's letter.
- MISMATCH DAYS (99198, 2 days, no verdict effect): d61 — derived
  living 0 vs engine veterans 1 (death-day boundary: the engine
  still counts the killer on his death day, the derivation excludes
  it); d111 — derived 1 vs engine 0 (banking-day lag: the engine
  catches up the next day, d112). Same ordering notes as
  standaccum2. maxLiving is 1 under either count; no L>=2 day is
  affected.
- PEAK RULE (encounterprod fix): peaks initialize to 0, not null —
  verified (99196 rawPeak/gatedPeak report 0, not null).
- DETERMINISM: the anchor re-run reproduces the encounterprod
  corpus exactly on the judged fields (68d, village-lost, 75
  fights, 41/16/18 wave split, 35 kills, raw/gated 20) and the
  proof's live determinism + off/on neutrality legs pass (same seed
  twice identical; instrument-off trajectory unchanged at 30d).
- HORIZON RULE: the post-run snapshot lands past the horizon
  (d69 on the anchor; d65 on 99192) and is included in snapshot
  counts and peak reads, as preregistered.

## Telemetry deviation check (loop-body step 10)

ATTEMPTED, refused by design: `node scripts/telemetry-check.js
--baseline .../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-05/perseed-standaccum3-b/*.json' --metrics
national,table,wins,exiled` exits 2 — "refusing recorder-corpus
input: all 9 --current rows carry top-level anchorCommit, so they
are sweep recorder rows, not runs." Same refusal postblood-b and
killerdeath-b hit. No LOUD line exists to investigate; wall numbers
are reported directly above instead of via a forced flag.

## Balanced panel (§15)

INAPPLICABLE, stated not fabricated: single-arm diagnostic run, no
Game-root change and no policy variant to compare. No
balance-panel compare exists for it, and none is attached.

## Infrastructure notes (loud, as required)

- EPERM flap: NONE this run. All 9 corpus files wrote first-try
  via the file driver (no write-retry lines, no stdout-mode
  fallback needed). Judged runtime ~3.5 minutes for 9 seeds
  (anchor ~10s, fresh band ~3.2 min). The in-process run-analyzer
  was not needed and was not used for judged numbers.
- Safe-commit index clobber hit all three commits so far (prereg,
  instrument) and was repaired the same way each time (HEAD-blob
  cacheinfo, verified `git status` empty + `git diff HEAD` empty +
  hash-object matches); commits always correct.
- Probes /tmp/probe-holdbeat*.js (3 files) are diagnostics, not
  committed; the hold-beat question they chased is recorded in the
  sense-test above, not in the repo.
- No push, no bump, no live verification (ship loop owns deploys).
  Coordinator evidence committed on a branch and ff-merged per repo
  push discipline — never directly on master. (Coordinator merges;
  this worker reports its branch tip below.)

## Next blanks, in order (proposals only — this arm builds nothing)

1. Wave-3 kill conversion as the standing hinge: the flat seeds
   convert 0% of wave-3 fights into kills (band-wide 19%); the
   competent fight-assess declines most wave-3 fights and the
   field fights it takes end in flight. The trigger/finishhold arms
   already circle this — a standing-specific read would ask whether
   making wave-3 kills achievable moves standing, gates untouched.
2. Diplomacy absence: 0 links on 9 competent runs — the +34/link
   source never fires because no link is ever formed. A
   link-formation diagnostic (does competent ever propose/accept
   links, and what blocks it?) is the named next blank for the
   diplomacy leg.
3. Hold-beat silence: deferral beats' day-stamps advance but no
   spoken hold line reaches any captured transcript — needs a
   targeted probe (record `_standingDeferBeat` + all sysSay calls
   directly) before anyone claims the village is told why it is
   held.
4. Premise still unmet: L>=2 on 0/8 fresh — killer simultaneity
   remains the binding gap upstream of standing (standaccum2's
   blank #1 stands). Do NOT move readyDemand or flip VETSHAPE on
   this evidence.

## Proof and landing

- Proof: `scripts/test-standaccum3-20261105.js` — 23/23 PASS on the
  final code (flat-20 rule fixtures for every clause, decomposition
  sums, gated==raw below 100, capped formula, verdict rules incl.
  GO / NO / UNDERPOWERED / INSUFFICIENT-DATA and the anchor-step
  shape, premise counting, peak-zero rule; live smoke, live
  determinism double-run identical, live off/on neutrality).
- Commits (this worktree branch sim-standaccum3-b; coordinator
  merges via --ff-only; merged locally, pending ship — no push, no
  bump, no live verification by this worker): b50691dc7 prereg,
  50dfdaa3 instruments + proof 21/21 (pre-correction), plus the
  pilot + evidence commit below (analyzer correction to the prereg's
  letter + fixture 13, proof now 23/23; anchor + 8-seed corpus;
  this evidence).
- Files: prereg + evidence in `evidence/2026-11-05/
  sim-standaccum3-b*.md`; per-seed JSON in
  `evidence/2026-11-05/perseed-standaccum3-b/` (9 files, anchor +
  8 fresh; instrument errors 0 on all 9); scripts
  `standaccum3-instrument-20261105.js`,
  `standaccum3-driver-20261105.js`,
  `standaccum3-analyze-20261105.js`,
  `standaccum3-run-analyze-20261105.js` (flap fallback, unused
  this run), `test-standaccum3-20261105.js` (zero src/js anywhere
  in this arm).
- Worktree state at handoff: only committed work; no uncommitted
  leftovers beyond the pilot + evidence commit below (verified
  before reporting).
