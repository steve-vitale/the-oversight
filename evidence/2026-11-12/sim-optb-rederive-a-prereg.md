# Option-B healthy-pole re-derivation — pre-registration (arm sim-optb-rederive-a)

Run fleshout-20261112T2006Z, Loop A, axis scale-onramp / winnability
chain (the survival-collapse bisect, OPTION B). Written and committed
BEFORE any judged sim. Base: the collapse window's far end
`203a32775` ("sim-wave5kill-a: blooded damage/survivability lever
for wave-5 kills", 2026-11-10) — the 393rd commit in the window
`d229b58f5..203a32775`. Healthy pole: pre-reconcile master
`5157782a4` (vetphantom fix leg). `203a32775` is an ANCESTOR of
`5157782a4` (their merge-base is `203a32775` itself, verified) — the
answer lives in the commits `203a32775..5157782a4` (205 first-parent
commits, verified by `git rev-list --count --first-parent`).

**Instrument-only arm — ZERO src/js changes committed.** This arm
re-runs the 8-seed matched band on the far end plus one candidate
change at a time, cherry-picked uncommitted. It changes no game code
and builds nothing.

## The question

The collapse bisect window `d229b58f5..203a32775` is fully localized
(collapse exit in commits 378–385, the melee-first slot rule;
remainder in 390–393) and its far end was never healthy
(firstparent `203a32775`: 4/8 survived, INCONCLUSIVE). The healthy
leg is pre-reconcile master `5157782a4` (vetphantom fix leg: 6/8
survived, 8/8 regional, median 150d). The healthy pole needs
re-derivation OUTSIDE the window: what does `5157782a4` carry that
the far end `203a32775` does not? Option b (this arm) answers it by
transplanting candidate changes onto the far end, one at a time, on
the matched band.

| Band | Base | Survived | Regional | Median |
|---|---|---|---|---|
| vetphantom fix leg (seeds 190391–190398) | pre-reconcile master `5157782a4` | **6/8** | **8/8** | **150d** |
| bisect-firstparent leg (seeds 190391–190398) | first parent `203a32775` | **4/8** | — | **150d** |
| bisect-r9-cut leg (seeds 190391–190398) | cut `ee30f22a2` | **4/8** | **7/8** | **150d** |
| bisect-r10-cut leg (seeds 190391–190398) | cut `c67a17564` | **4/8** | **7/8** | **150d** |
| bisect-r8-cut leg (seeds 190391–190398) | cut `a6ed956f5` | **2/8** | **8/8** | **144d** |
| bisect-merge leg (seeds 190391–190398) | merge `e4dbe581b` | **1/8** | — | **126d** |
| survivalcontrol (seeds 190391–190398) | current master `d33ca69f9` | **1/8** | — | **126d** |

Per-seed flips between the far end and the healthy pole (r9 §1
table, same four far-end survivors as r9/r10): the healthy pole
SAVES 190391 (lost d86 → survived), 190392 (lost d144 →
survived), 190394 (lost d43 → survived) and LOSES 190395
(survived → lost d109); 190393, 190397, 190398 survive on both
(190398 reaches wave 5 only on the healthy pole, standing 375 vs
199; 190397 stands 325 vs 275). Net +2. No seed flips on
tribute delivery (never delivered on either leg).

## The diff — exactly what 5157782a4 carries that 203a32775 does not

Measured by `git diff 203a32775 5157782a4` (verified before any
sim, not assumed). 20 commits touch `src/js`; 16 files,
**+992/−136**. **Zero `src/data` changes.**
`scripts/sim-harness.js` is byte-identical. `scripts/policies/
competent.js` differs ONLY by the COUNTER_ANSWER block (env-gated
OFF by default — inert; this run does not set it). The
vetfirst instrument (`scripts/vetfirst-instrument-20261111.js`,
+404) is new at `5157782a4` — instrument, not game code.

| File | Change | Behavioral? |
|---|---|---|
| `src/js/hierarchy.js` +177/−40 | tendexact exact-split `_removePantryKcal` (e6911eb80); ANSWERMAIL_DRIVE engine hook (43c6742e0, env-gated OFF); r130 trust-amount naming (text) | tendexact: YES (pantry); answermail: NO (gated off); r130: NO |
| `src/js/convo-wants.js` +148/−9 | r129 favour-line pools; r130 stateful cycle; r176 settled-debt deflect (F2); r180 Q3 voice-line stacking | r129+r130: RNG (see L2); rest: NO (dialogue) |
| `src/js/game.js` +132/−25 | r128 grant-rate dial (b6cf13684); r131 cook/mend grants (a16ce1cc8); vetcount reconcile (a80b2d789) | dial+grants: YES (food XP); vetcount: NO (telemetry) |
| `src/js/conversation.js` +129/−5 | r125 secret-answer pools (10fe7ee52); r169/r170/r172/r176/r180 dialogue guards | r125: RNG (see L1); rest: NO |
| `src/js/party-formal.js` +97/−3 | r176 party-role death release (F1) + already-held line (F3) | F1: NO ON THIS BAND (see excluded); F3: NO |
| `src/js/ladder.js` +68/−27 | scholarcount (3995d21d6) — scholar counts in the veteran bar | NO (tribute-read only; see excluded) |
| `src/js/convo-dialogue.js` +64/−4 | r129/r130 favour pools; r169 dlg:more fall-through | NO (dialogue) |
| `src/js/truth.js` +50/−5 | r172 one-confession-per-sitting guard; r179 face-line guard | guard: negligible (see excluded) |
| `src/js/convo-beats.js` +40/−2 | r124/r125 bridge pools; r176 resume-quote filter (F4) | NO (dialogue) |
| `src/js/villager-agency.js` +36/−1 | r125 teach-plant frames (10fe7ee52) | RNG (see L1) |
| `src/js/convo-mood.js` +28/−7 | r176 resume-quote silence/bridge filter (F4) | NO (dialogue) |
| `src/js/table.js` +11/−4 | scholarcount (3995d21d6) — readiness/delivery split | NO (tribute-read only) |
| `src/js/standing.js` +7/−0 | roster check (5d16916f4) | EQUALIZED by the swap on both legs |
| `src/js/favor-forage.js` +2/−2, `favor-water.js` +1/−1 | r129/r130 favour-line variety | NO (dialogue) |
| `src/js/safetynets.js` +2/−1 | r130 trust-amount naming | NO (text) |

## Divergence analysis (pre-sim, from the existing corpora)

Before choosing candidates, the two pole corpora
(`evidence/2026-11-11/perseed-vetphantom-b/` fix leg vs
`evidence/2026-11-11/perseed-bisect-firstparent-a/` fix leg) were
compared per-day (4-field signature + full daily deep-diff),
exactly the r9 §2 method. This analysis informed the ranking; it
is not a judged sim and it re-judges nothing.

- First BEHAVIORAL divergence (signature: vetsW3, vetsW4,
  waveKillLog length, roster length) per seed: 190391 d81
  (roster 3 vs 4), 190392 d37 (a wave-3 kill missing on the
  healthy pole; ready4 False vs True), 190393 NONE (signatures
  identical all 150d), 190394 d40, 190395 d79, 190396 d45,
  190397 d40, 190398 d74. Every first divergence is a fight
  outcome (a kill happening or not, a roster death moving) —
  never pantry, knowledge, or party first.
- The waveKills COUNTER diverges earlier (d17 on 190394/190395)
  with the LOG identical: that is the vetcount-reconcile
  footprint (a double-write counted once on the healthy pole),
  behaviorally inert — the counter is telemetry-only.
- `partyMembers` NEVER differs on any seed (190391 carries a
  1-member party d8+ identically on both legs; 190392/190397
  never have one). The r176 party-role death release leaves no
  trace on this band.
- The scholarcount footprint is exactly as predicted and moves
  no survival: `ladderVets4` healthy 1 vs far-end 0 on
  190392/190395/190398, tribute ready on healthy but not far-end
  on 190393 (2 vs 1) — while 190395 still DIES on the healthy
  pole. Tribute is never delivered on either leg.
- End pantry is mixed (healthy higher on 190391/190392/190394/
  190398, lower on 190397) and the death-cause profile is
  combat-dominated on both legs (r10 §3: 606/639 combat/
  expedition/wild; starvation 1). Villages die fighting with
  full pantries (190395 healthy dies d109 holding 14,195 kcal).
- RNG-consumption audit of the range diff: the ONLY new
  `Math.random` draw sites in `src/js` are r125's teach-plant
  frames (`villager-agency.js`: a draw per teach-plant line vs a
  fixed string before) and, via `convoPick` (which draws once
  per pick), r125's secret answers (fixed string → 4-variant
  pool) and r129/r130's favour display lines (fixed string →
  `convoPickCycle` → `convoPick`, one draw per live-sitting
  display). The pole gap's signature — early, directionless
  (log divergences split healthy-fewer 4 / healthy-more 1 /
  mixed 2), fight-first, on all 8 seeds, with no party/pantry/
  skill field preceding it in the instrument — matches an
  RNG-stream shift from dialogue-variety work, not a single
  design mechanism. The r9-vs-firstparent comparison is the
  control for this reading: the wave5kill lever (combat code)
  left 6/8 seeds deep-identical because it only fires in wave-5
  fights, and r123's dialogue change left 6/8 identical because
  it changes WHICH line a pick serves, not HOW MANY draws fire.
  Only draw-count changes shift the stream.

## Candidate list (ranked — one leg each, sequential, stop at the first ≥5/8)

| Leg | Configuration (far end + cherry-pick, `-n`, uncommitted) | Why chosen |
|---|---|---|
| **L1 `r125`** | `10fe7ee52` (conversation.js + villager-agency.js: secret-answer variety + teach-plant frames) | Single most plausible carrier: the most concentrated new RNG draw sites in the range (secret answers 0→1 draw; teach-plant 0→1 draw). The ONLY candidate that explains the observed divergence signature. NOTE: r125's only sim-path effect is RNG consumption + line wording (the outcomes are chosen by the policy, not the lines). If L1 reproduces ≥5/8, the health is RNG-carried — the pole is re-derived mechanically, but the mechanism is dice, not design; the evidence will say so plainly. |
| **L2 `favor`** | `ed33b42b8` + `b09cf584e` (convo-wants.js + favor-*.js + convo-dialogue.js: favour-line pools + stateful cycle) | Second RNG delta: live-sitting favour displays go 0→1 draw. Joint because r130 builds on r129's pools (r129 alone is hash-only, 0 draws; r130 alone cannot apply without the pools). |
| **L3 `tendexact`** | `e6911eb80` (hierarchy.js: exact-split `_removePantryKcal`) | Strongest DESIGN mechanism: systematic pantry savings on every tribute/tend/demand payment (old code over-paid 1500→1500–1901 per call). Caveat: the death-cause/pantry evidence argues against it (villages die fighting with full pantries), so it ranks behind the RNG candidates. |
| **L4 `grants`** | `b6cf13684` + `a16ce1cc8` (game.js: grant-rate dial + cook/mend routine-work grants) | Second design mechanism: food-skill XP from day 1 (cook skill 1 by ~d5; butcher/preserver slowed above 5 XP). Net direction genuinely ambiguous (dial slows two tracks, grants add two). |

Cherry-pick applicability was verified before any sim by
hunk-overlap analysis (candidate hunks vs later range commits'
hunks in the same files — no overlaps: r125's hunks sit at
conversation.js ~5995/6291 vs later hunks at 1268–6611
elsewhere; tendexact @988 vs later @1278+; grants @6686–7520
vs vetcount @34456+; favour @13–1956 vs r176 @1089 / r180
@2716 elsewhere). If a cherry-pick conflicts at apply time,
record the conflict, abandon that leg, and move to the next —
never hand-resolve a behavioral hunk.

## Excluded (with reason — not tested)

- **scholarcount `3995d21d6`** (ladder.js + table.js): tribute-
  readiness read only. Tribute is never delivered on either
  leg, so the bar cannot move survival; the corpus shows the
  read changing exactly where predicted with no survival
  following it. The tribute-ready delta (vetphantom 2/8 vs
  far-end 1/8) is explained, not a carrier.
- **vetcount-reconcile `a80b2d789`** (game.js): counter/
  telemetry only. The only game reader of `wave4Slain` is the
  legacy `readiness()` score's `>0` threshold, which the dedupe
  cannot flip (a duplicate write implies a real kill, counted
  once); `waveKills` is read only by records.js telemetry
  (first-blood / apex-slain notes). Its footprint (d17
  counter-only divergences) is visible and inert.
- **party-formal F1 `82450a883`** (party-formal.js + convo
  files): the release never fires differentially on this band
  — `partyMembers` is identical on both poles on all 8 seeds.
  (F2/F3/F4 in the same commit are dialogue-only.)
- **ANSWERMAIL_DRIVE `43c6742e0`** (hierarchy.js) and the
  **COUNTER_ANSWER policy block**: both env-gated OFF by
  default; this run sets neither flag. Same standing as the r9
  prereg's policy-confound notes.
- **roster check `5d16916f4`** (standing.js): equalized by the
  swap on both legs — it is not a difference between the poles
  as run.
- **Remaining dialogue/text** (r124/r129/r130 bridge pools —
  r129/r130 favour lines are L2; r169/r170/r172/r179/r180
  guards, r130 trust naming, cistern pluralization): no
  draw-count change and no state effect, except the r172
  one-confession guard (a −3 trust deflect on a second
  confession in one sitting — too rare and too indirect to
  carry a 2-seed swing) and r180's `voiceLine` skip on
  reframed lines (a draw-REMOVAL, residual untested item — see
  NO-GO follow-up). The `convoWouldBlock` pre-checks skip
  `sayLine` calls on blocked lines only.

## Primary metric + decision rule (a miss is a verdict, never re-scored)

**Primary metric: survived count on seeds 190391–190398 on the
far end `203a32775` plus the candidate configuration (with the
fix swapped in)**, vs the vetphantom fix leg's 6/8 and the
firstparent leg's 4/8. Each leg is judged on its own:

| Outcome | Verdict for that leg |
|---|---|
| **≥5/8 survive** | **HEALTHY-POLE RE-DERIVED** — the candidate change(s) carry the health (name them; state the mechanism, including RNG-carried if that is what it is) |
| **≤4/8 survive** | **NO-GO for that leg** — the candidate does not carry the health; move to the next leg |

**Rank read (pre-registered alongside survival):** regional
reach on the same band, vs the vetphantom fix leg's 8/8
regional and the origin leg's 0/8 regional (RANK_STALL):

| Outcome | Rank verdict |
|---|---|
| **≥5/8 regional** | **REGIONAL_INTACT** |
| **≤2/8 regional** | **RANK_STALL** |
| **3–4/8 regional** | **RANK_INCONCLUSIVE** |

The run verdict: the FIRST leg to reach ≥5/8 ends the search
(the healthy pole is re-derived by that candidate). If all four
legs miss, the run verdict is **NO-GO — the healthy pole is NOT
re-derived**: report the narrowed candidate list as the next
run's work (residual: r180 draw-removal, r172 confession-guard
trust effect, a joint r125+r129/r130 combined-RNG leg, and a
same-code RNG-reseed control to measure the band's RNG
sensitivity directly). Do NOT re-judge any prior verdict.

The analyzer (`scripts/optb-rederive-analyze-20261112.js`)
judges each leg and exits 0 only when it can classify the
outcome under both rules (any survival verdict + any rank
verdict is a classified outcome; exit 1 only on instrument
failure, corpus incompleteness, or an unclassifiable read).

**Secondary (reported, not judged):** median survival vs 150d
(vetphantom / firstparent); death-cause shares vs the
combat-heavy profile; wave-5 unlocks; national / table / wins;
standing range; tribute-ready (ladder read); phantom days (0
expected — the roster-check fix is swapped in); blooded count
(report field only — the BLOODED block HAS callers on this
base, the wave5kill lever in 390–393, unlike the r9 base).
**Wave-5 choke:** report peak living wave-4+ veterans per
seed vs the bar of 2. **ARC IV firing per seed is a REPORTED
field only** — it is not judged and no threshold is set on it
(the instrument does not capture ARC IV; same standing as r9/
r10 §7).

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to
  all prior bands, so the survival counts are comparable.
- **Seeds: 190391–190398 (8 seeds) — deliberately the SAME band
  as vetphantom, the firstparent, r5–r10 cuts, and every other
  bisect leg.** A control/bisect re-derivation re-runs the same
  seeds on old code plus a transplant; that is the point, not a
  freshness violation. Grep scope `evidence/*/sim-*-prereg.md`
  on master names seed 190391 in 23+ prior preregs (same
  justification as every one of those preregs).
- **Policy: competent verbatim, SINGLE leg per candidate on the
  far-end base, mode `fix` only** (with the swap — see below).
  The driver enforces the leg guards (swap-aware standing
  guard + own-policy guard + candidate guard, all exact-match)
  and refuses to run otherwise. Policy confound notes (all
  verified by diff before any sim, not assumed):
  - `scripts/policies/competent.js` on `203a32775` vs
    `5157782a4` differs ONLY by the counter-answer block
    (env-gated OFF by default — inert unless
    `COUNTER_ANSWER=1`, which this run does not set). The
    driver runs the far end's OWN policy (sha256
    `a7ff5c516440626621a2382e378e37704c2f5c56a69c4eab30f89461503a864a`)
    and refuses any other sha.
  - `scripts/sim-harness.js` is byte-identical between the two
    poles — the comparison differs only in game code (plus the
    controlled standing.js swap, identical on both legs, plus
    the candidate cherry-pick under test).
- **Instrument:** `scripts/vetfirst-instrument-20261111.js`
  copied from master as UNTRACKED scratch (never committed —
  it already exists on master and committing a duplicate would
  break the later rebase; byte-identical to master, sha256
  `311f105bc15f55544143354eceb74b81d03b95d542a5c1f87e824a2260c40d23`;
  deleted before finishing) + the driver's live shadow old-rule
  count per snapshot, exactly as vetphantom-driver and the
  bisect drivers. Driver:
  `scripts/optb-rederive-driver-20261112.js` — a clone of the
  r10-cut driver with the corpus dir parameterized by leg
  (`evidence/2026-11-12/perseed-optb-rederive-a-<leg>/`), RUN =
  `optb-rederive-pilot`, arm = `optb-rederive`, mode fixed to
  `fix` only, plus the swap-aware leg guard (exported
  `legGuard`, exact-sha), the own-policy guard (exported
  `legGuardPolicy`, exact-sha), and a per-leg candidate guard
  (exported `candidateGuard`, marker strings verified present
  at `5157782a4` and absent at `203a32775` before any sim).
  **`\belder\b` filter:** the driver carries the tightened
  veteran-say regex `\\belder\\b` (vetsays fix, landed
  `9a32925b3`), same as r9/r10.
- **Corpora:** `evidence/2026-11-12/perseed-optb-rederive-a-<leg>/`
  — 8 per-seed JSONs per leg; one summary JSON per leg
  (`evidence/2026-11-12/optb-rederive-a-<leg>-summary.json`).
- **Deep-identity comparison (pre-registered method):** the
  per-day signature is the 4-field tuple (vetsW3, vetsW4,
  waveKillLog length, roster length) — NOT deaths-so-far.
  Compare each leg's corpus against the firstparent corpus
  (`evidence/2026-11-11/perseed-bisect-firstparent-a/`) and the
  vetphantom fix corpus, plus a full daily-snapshot deep-diff.
  Veteran killers in the instrument are keyed `by`, not `vid`
  — a phantom check reading `k.vid` silently checks nothing.

## The fix-swap (read carefully — this base predates the roster-check fix)

At `203a32775`, `src/js/standing.js` is the PRE-FIX version
(sha256
`75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c`,
hashed by this arm from `git show 203a32775:src/js/standing.js`
— NOTE: this differs from the r9 base's pre-fix sha
`98c8bfad70d7…`, because the wave5kill lever (commit
`203a32775` itself, 390–393) added the BLOODED block to this
file; the r131 roster-check fix (`5d16916f4`) is NOT an ancestor
of this base). Following the vetphantom-b swap pattern
(evidence/2026-11-11/sim-vetphantom-b.md §9–§10) and the
firstparent / r5–r10 preregs: the FIX `standing.js` is extracted
with `git show 5157782a4:src/js/standing.js`, its sha256 verified
to be exactly
`f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`,
swapped in UNCOMMITTED, run, then the far end's original
`standing.js` restored byte-identical afterwards and verified by
sha256 (`75762cb2259d…`) plus `cmp` clean plus `git status`
showing no `src/js` modification. The `standingSha` in use is
recorded per seed in the corpus. The swap keeps the comparison
apples-to-apples: every leg in this bisect runs WITH the roster
check. **The swapped file itself is never committed.** The
driver refuses to run unless the on-disk `standing.js` carries
the "ROSTER CHECK" marker AND its sha256 is exactly the fix sha
— an unswapped run is refused loudly, never mislabeled.

Two whole-file-swap notes, both verified before any sim (not
assumed):

- **BLOODED rider, LIVE on this base (unlike r9).** The fix
  file differs from the far-end base's `standing.js` in exactly
  one hunk: the ROSTER CHECK (`if (roster.indexOf(vid) < 0)
  return false;`) — the BLOODED block (`bloodedCfg` /
  `bloodedLine` / `villageBlooded`) is present in BOTH, because
  the wave5kill lever landed in `203a32775` itself. On this
  base the block HAS callers (the wave5kill hookup in
  `fieldFights.js` / `game.js`), so the swap introduces NO
  blooded delta at all: the only live behavioral delta the swap
  introduces is the roster check. The driver's end-of-run
  `blooded` read is a report field.
- **Ladder scholar rule — LEG 3, same as round 5–10.** This
  base's `ladder.js _ladderLivingVeterans` is the old inline rule
  (`vp && !vp.dead`, no roster check) with the LEG 3 tribute
  scholar-readiness fix layered on: the scholar is NEVER counted
  (`if (!vid || vid === this.villagerId) return false;`) —
  verified by reading the function at `203a32775`. There is no
  `countLivingVeterans` on this base. `5157782a4` / master use
  the shared `countLivingVeterans` (roster check + scholar
  counts, commit `3995d21d6`). The proof test detects which
  scholar rule the LOADED game carries from
  `_ladderLivingVeterans` source and asserts the matching count
  (a scholar wave-3 kill reads 1 in the swapped-in readiness
  gate and the instrument, 0 in this base's ladder); the
  survival read comes from the harness end state, not the
  ladder. (The L1–L4 cherry-picks do not touch `ladder.js`,
  so this rule is the same on every leg.)

## Balanced panel (§15) — N/A

Instrument-only legs, no code change, no before/after pair to
compare on one base. The before/after comparison IS the
vetphantom fix leg vs each candidate leg on identical seeds,
judged by the analyzer's decision rule. Same standing as
survivalcontrol-b §7, anchor-a §7, merge-a §7, origin-a §7,
mergebase-a §7, r5-cut1-a §7, r5-cut2-a §7, r6-cut-a §7,
r7-cut-a §7, r8-cut-a §7, r9-cut-a §7, and r10-cut-a §7.

## Guards (reported, never verdict-flipping post-hoc)

- If any per-seed file is missing or fails to parse, the leg is
  INCOMPLETE, not a verdict — re-run the missing seed(s) only.
- If instrument errors > 0 on any seed, record them; the verdict
  stands only if the errors cannot touch the survival read (the
  survival read comes from the harness end state, not the
  instrument).
- The swap + the cherry-pick are the ONLY permitted uncommitted
  changes during a leg (plus the untracked instrument scratch).
  After each leg, the original `standing.js` is restored
  byte-identical (sha256 `75762cb2259d…`) AND the cherry-picked
  files are restored byte-identical (`git checkout -- <files>`
  + `git status` clean of `src/js` modification) before the
  next leg or any evidence commit. If a restore fails, FAIL
  LOUDLY and do not commit evidence.
- This arm does NOT re-judge any prior verdict (vetphantom GO,
  firstparent INCONCLUSIVE, r9-cut INCONCLUSIVE, r10-cut
  INCONCLUSIVE, and all earlier bisect verdicts) — it transplants
  candidates onto the far end only.
- Do NOT cut at commits 390–393 (the r10 remainder): a cut there
  can only localize the 190393/190397 remainder, it cannot
  return CUT_HEALTHY — that is a separate question, not this
  arm's. Do not touch the stall window (commits 58–65) — the
  stallcut61 arm owns it.
- The sibling Loop B arms run in their own worktrees; this arm
  does not touch them, and their verdicts do not change this
  leg's decision rules.
- No game-code change is made by this arm, so no `[needs-eyes]`
  applies.
- Telemetry deviation check (Loop A body step 10): attempted;
  prior bisect arms were REFUSED by the tool (recorder-corpus
  class). If refused again, recorded, not waived, baseline NOT
  rolled.
- Ancestry note: `203a32775` is an ANCESTOR of `5157782a4`
  (their merge-base is `203a32775` itself), not the reverse —
  do not assume a linear order between the healthy base and the
  local merge-tip. `ee30f22a2` (385th) is an ancestor of
  `203a32775`; `c67a17564` (389th) is an ancestor of
  `203a32775`; all verified.
- Flap note: a host write flap (EPERM on git ref writes and
  some file writes) was ACTIVE at run start (20:35Z) and solid
  through 21:52Z (watcher log: episode from 20:29:51Z; 480/480
  rapid probes failed at 21:31Z). The prereg + tooling were
  written and committed only after a probe succeeded (21:57Z)
  and the tree was heartbeated (21:58:02Z). If the flap
  returns mid-run, wait for it to clear rather than bypassing
  safe-commit; never route around a denial.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the legs: did the metric set hold, or does a
  metric need revision for the NEXT run?)
