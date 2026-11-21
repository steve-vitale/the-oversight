# sim-profilegate-confirm-b — PREREG (frozen before any judged sim; CONFIRM)

**Arm:** sim-profilegate-confirm-b (confirm of the landed PROFILEGATE4 lever) ·
**Loop B run:** fleshout-loop-b-20261121T1530Z · **Axis:** winnability chain
**Type:** LEVER CONFIRM, no src/ change. The lever is ALREADY on master
(commit `84e57fcc3`, [needs-eyes]): the findCompanion twins in
`src/js/villager-brain.js` + `src/js/win-plan.js` skip the
wanderer/explorer profile check only when `PROFILEGATE4=1` AND the
holder's plan has `needWave >= 4`. Default OFF; no default flipped here.
This arm judges the landed lever on a fresh 16-seed band before any
default flip. Legs differ ONLY by the `PROFILEGATE4` env flag.
**Branch:** `sim-profilegate-confirm-b` · **Worktree:**
`~/workspace/worktrees/sim-profilegate-confirm-b`
**Base at arm start:** master `df4867134` (full
`df4867134afaf556232c4a7c377a4595b644a55c`; branch base; do NOT rebase —
the coordinator rebases at landing).
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
(verified 2026-11-21 before freezing).
**Band:** seeds 106751–106766 (16 seeds, FRESH — see Band freshness below) ·
**Horizon:** 150d death-aware.

## The question (1430Z round record's next blank #4)

The pilot (`evidence/2026-11-21/sim-profilegate-b.md`, band 106741–106748,
8 seeds) went GO — B1 pool empty 0.9315 → 0.075, B2 launches 6 → 8, B3
passed but EXACTLY at both starvation bars (7 vs 5, bar 7; arm-only 3 vs
1, bar 3), B4 damage 0.0336 pooled. The pilot's metric review and the
1430Z round record both name the next step: a 12–16-seed confirm band
before any default flip, with B3 fragility the thing to watch. This arm
is that confirm. It re-runs the identical instrument on a fresh band
with the identical frozen bars (B5 file counts scaled 8 → 16). It is
not a re-roll: the bars, the substrate, the horizon, and the instrument
are inherited verbatim; only the band, the anchor, and the fixture seed
change.

## What was read first (do not re-measure what they answered)

- `evidence/2026-11-21/sim-profilegate-b-prereg.md` — the pilot prereg
  (frozen bars B1–B5, instrument design, substrate — inherited verbatim
  except band + anchor + fixture seed, all named here).
- `evidence/2026-11-21/sim-profilegate-b.md` — the pilot verdict GO, B3
  fragile (passed exactly at both starvation bars); B4 damage 0.0336
  pooled.
- `evidence/2026-11-21/sim-winnability-round-1430.md` — the round record
  (next blank #4: this confirm; B3 fragility the thing to watch).
- `evidence/2026-11-21/sim-poolfirstfail-b.md` (§2 P2/P3, §8) — the
  decomposition that names this lever; the pilot's B1 baseline
  derivation (needWave>=4 OFF: 94/99 empty, mean 0.051).
- `evidence/2026-11-20/sim-launcheng-b.md` — finding #2605's named
  lever shape.

## Canon read

- `docs/CANON.md`, `docs/PARTY.md` (party unlock day 7, cap 3→4→5, **no
  trust gate on invites** — trust affects acceptance, not System
  permission; it covers the SCHOLAR's party, not the villager pool).
- **Canon gap, recorded not invented:** no canon doc covers expedition
  companion eligibility (who may walk the road as a companion), the
  away-flag semantics, or the ranger-profile gate on `findCompanion`.
  The lever is grounded in the two `findCompanion` implementations and
  in poolfirstfail's priced counterfactual, not in canon.

## The lever — exact sites (already landed; pinned by reading the code)

Companion eligibility is gated in exactly TWO places, the `findCompanion`
twins, which apply the same checks in the same order:

1. **`src/js/villager-brain.js` `findCompanion`** — the DAWN BID gate.
2. **`src/js/win-plan.js` `findCompanion`** — the LEGACY depart gate
   (reached only when `vbrainOwnsDawn()` is false; changed identically
   so the twins stay in sync).

The change in each twin, and nowhere else: the profile check
`if (prof !== 'wanderer' && prof !== 'explorer') continue;` is skipped
when `PROFILEGATE4=1` AND the holder's plan has `needWave >= 4`.
No plan, or a wave-3 plan, keeps the old gate. Every other check is
unchanged: alive, away flag, trust ≥ 15, at Haven, engaged,
on-expedition. **This arm makes NO src/ change** — the lever is already
on master at the frozen base. The proof test asserts the src/ diff vs
the frozen base is EMPTY and asserts the lever's presence by content
reads (scoped gate line, env gate, scope helper, parent flag not
reused, depart bypass landed, `winPlanSecondCompanion` still
profile-open, seeding gate + `expeditionCand` NOT widened, PINQUAD
blocks untouched).

NOT changed (named so a reviewer can verify the diff is only the gate):
- `src/js/win-plan.js` `winPlanHavenTick` plan-SEEDING gate — holders
  stay as seeded; the VETREENGAGE seed call plants plans regardless
  of profile.
- `src/js/villager-brain.js` `expeditionCand` — not companion
  eligibility.
- `src/js/win-plan.js` `winPlanSecondCompanion` — already profile-open.
- `companionLaunchable` — unchanged. Homebodies have `npcMaxDist` 0,
  so a homebody can be *bid* at dawn but cannot *launch* (range-0).
- `src/js/villager-agency.js` depart bypass — already live in base,
  untouched.
- `companionRank` (`src/js/companion-score.js`) — profile-blind ranking,
  untouched.
- **OVERLAP GUARD:** do NOT touch the PINQUAD blocks
  (villager-brain.js ~1269, win-plan.js ~1152) held by
  sim-pinquaddoor-b; do NOT touch fieldFights.js pin lines. If a
  conflict touches those lines, STOP and report to the coordinator
  (do not resolve it yourself).

## Band freshness (verified 2026-11-21, before this prereg)

Fresh band 106751–106766. Search scope: (1) `grep "10675[1-9]|10676[0-6]"
evidence/*/sim-*-prereg.md` — empty; (2) exact-seed greps `106751`…
`106766` over `evidence/*/sim-*-prereg.md` — empty; (3) `grep -rln
"10675[1-9]|10676[0-6]" evidence/ --include="*.md"` — empty (no .md
file anywhere in evidence/ names any of the 16 seeds); (4) all prereg
band ranges in the 106xxx region (`grep -h -o
"106[0-9][0-9][0-9][–-][0-9]*" evidence/*/sim-*-prereg.md | sort -u`) —
highest named below this band: 106741 (pilot band), 106731–106738
(poolfirstfail); next named above: 106801; nothing at 10675x or
10676x; (5) goal `hidden_files/` for `10675[1-9]|10676[0-6]` — hits
only in old Oct census JSONs under
`hidden_files/evidence/2026-10-*/` (e.g. census-s52.json,
crumbdefault/crumbguard census files, feastvoice beats, panel cases),
all verified data values inside census JSONs, not seed reservations;
(6) goal `hidden_files/convergence-tracker.md` + `lever-claims/*.json`
for `10675|10676` — no hits (the only live claim is
`fleshout-loop-b-20261121T1530Z.json`, this run's). **Band
106751–106766 is unused. No other prereg names a conflicting use.**

## Substrate (frozen)

- Policy: competent verbatim, sha256 `1884c8852d38` (12-char prefix;
  full `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`).
- Env flags on BOTH legs: `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1
  FIGHTALLY2=1 ALLYSLOT3=1 LAUNCHSURVIVE=1`. Legs differ ONLY by
  `PROFILEGATE4` (off leg: unset; on leg: `1`).
- **ALLYSLOT3 is INERT on this base** (verified 2026-11-21 by repo-wide
  grep: the only `ALLYSLOT3` hits are in the held arm's driver
  `scripts/allyslot3-driver-b.js`; no reader exists in `src/js/` or
  `src/js/party-wiring.js` — the slot lives on the HELD
  sim-pinquaddoor-b branch, never merged). The flag is carried for
  substrate parity with poolfirstfail-b / launcheng-b (whose corpora
  also ran with it inert) and changes nothing; the third-ally slot is
  inactive on both legs. The other five flags were verified present as
  live readers: SENSEEXPED (`src/js/party-wiring.js`), PARTYSIZE4
  (`win-plan.js:314`), VETREENGAGE (`win-plan.js:278`), FIGHTALLY2
  (`fieldFights.js:1325`), LAUNCHSURVIVE (driver-side, recorder
  tracker).
- Anchor: base commit `df4867134` (full
  `df4867134afaf556232c4a7c377a4595b644a55c`); EXPECTED.anchor12 =
  `df4867134afa` (**12 characters** — the poolfirstfail re-anchor
  lesson, applied: the original arm's 9-char `EXPECTED.anchor12`
  could never match a 12-char slice. This arm freezes a true 12-char
  anchor; the analyzer's prefix check and the proof's F5 fixture both
  use it).

## Anchor rule (poolfirstfail's lesson, applied)

The driver stamps `anchorCommit` as `git rev-parse HEAD` at run time.
The judged legs run BEFORE any commit is made on this branch, so HEAD
is still the frozen base `df4867134` and the stamp matches. If anything
is committed before the judged legs (including the instrument), the
anchor moves and the legs must be re-run after a dated prereg
CORRECTION — never by amending EXPECTED.anchor12 after the fact. The
analyzer asserts every corpus file's anchor starts with
`df4867134afa` (part of B5), and the proof test asserts the anchor too.

## Fixture seed (LIVE on the current base — probed BEFORE freezing)

The pilot's gate-act fixture seed 106736 is on the pilot band — do not
reuse it as the live check. Probed 2026-11-21 ~16:10 UTC on base
`df4867134` with the confirm driver OFF leg, 150d, full substrate
(script `/tmp/probe-pg4confirm-fixture.js`, in-process, no writes):

| Seed | Pool dawns | Empty | v4 dawns | v4 empty | dawnbidScores | v4seeds | gameDays | End |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 106751 | 49 | 23 | 25 | 20 | 142 | 36 | 151 | survived |
| 106754 | 92 | 89 | 3 | 1 | 181 | 16 | 150 | survived |
| **106757** | **35** | **28** | **29** | **26** | **131** | **36** | **151** | **survived** |
| 106760 | 0 | 0 | 0 | 0 | 108 | 5 | 151 | survived |
| 106764 | 60 | 39 | 28 | 19 | 140 | 17 | 150 | survived |

**Gate-act fixture seed: 106764** (corrected — see CORRECTION below; was
106757). Alternates 106751 (25 v4 OFF, 20 empty; ON 16 v4, 2 empty, mean
2.125) and 106757 (29 v4 OFF, 26 empty; ON 1 v4 dawn only). 106760 scores ZERO pool dawns (no scored dawns at all — useless
as a fixture, recorded so nobody re-probes it). 106754 is wave-3-heavy
(3 v4 dawns). The proof's live gate-act check runs 150d on 106764 and
asserts pool dawns ≥ 1 on the OFF leg (live: 28 v4) and pool fill on
the ON leg (live: 26 v4 dawns, 0 empty, mean 2.808). The staged day-0 gate fixture tries seeds in order
[103413, 103411, 103412, 103414, 103415] (the pilot's list) and takes
the first that stages a holder + companion at Haven.

## B1 baseline derivation (from the pilot corpora, same substrate)

The pilot's OFF leg on band 106741–106748 (8 seeds) is the baseline
this confirm re-tests: needWave>=4 OFF pool 146 dawns, 136 empty
(0.9315), mean eligible 0.075; ON pool 80 dawns, 6 empty (0.075),
mean 2.9. Launched instances OFF 6, ON 8. The confirm's own OFF leg
on the fresh band provides the in-band baseline; the pilot numbers are
the prior the bars were built against, not the judge.

## Primary metric (frozen)

**Launched wave-4+ plan instances (any-commit definition) and the
companion-pool fill on wave-4+ dawns on the ON leg vs the OFF leg, on
identical seeds** — pool fill first (B1, needWave>=4 dawns only),
launches second (B2), cost third (B3), damage fourth as a tracked wall
(B4).

## GO bars (frozen — inherited verbatim from the pilot prereg; a miss is NO-GO, never re-scored)

1. **B1 pool fills (wave-4+ dawns only).** ON leg, pool rows whose
   holder's plan has `needWave >= 4`: empty scored dawns share ≤ 0.47
   AND mean eligible/dawn ≥ 1.5. Justification: the poolfirstfail
   needWave>=4 OFF baseline is 94/99 empty (0.9495) at mean 0.051, and
   the pilot's own OFF leg reproduced it (0.9315 at mean 0.075); the
   bar is half the OFF empty share at ~half the counterfactual mean
   (1.5 vs 3.23 — deliberately looser than the counterfactual because
   ON trajectories diverge: launches change who is at Haven, so the ON
   population is not the OFF population recomputed). Pool rows carry
   `needWave` so the analyzer can filter; dawns with needWave < 4 or
   null are reported separately and never counted toward B1.
2. **B2 launches rise.** Launched instances (funnelBucket `launched-*`,
   any-commit) ON ≥ 5 AND ON > OFF. The pilot's OFF launched 6 and its
   ON 8. The filled pool must convert into more launched parties, not
   just more bids. Secondary (reported, not barred): total wave-4+
   launch events ON vs OFF.
3. **B3 scalemetric cost bar — IDENTICAL to the parent's.** Starvation
   deaths, totals: ON ≤ OFF + 2. Starvation deaths, arm-only (matched
   same-seed same-day): ON ≤ OFF + 2. Median survival: ON ≥ 0.8 × OFF
   median. (The pilot passed exactly at both starvation clauses — 7
   vs bar 7, 3 vs bar 3 — on 8 seeds. The confirm's 16 seeds are the
   test of whether that cost is real. The bar construction is unchanged;
   the bigger band decides.)
4. **B4 damage wall TRACKED, not judged.** Launched-party damage share
   per fought meeting (derivation as in the pilot analyzer), pooled +
   per meeting, vs launchfunnel's 0.085 (single meeting, 77/909) and
   the pilot ON leg's 0.0577 and this band's OFF. Reported; no
   pass/fail — filling the pool buys launches, not kills.
5. **B5 instrument valid.** Proof test
   `scripts/test-profilegate4-confirm-b.js` green (incl. the anchor
   assertion and the live gate-act check on fixture seed 106764); D1
   repeatability + D2 wrap neutrality green (60d, seed 106764, full
   substrate, both PROFILEGATE4 states); D2 full-band: `rec`
   trajectories identical to `on` on all 16 seeds and `rec0`
   identical to `off` on all 16 seeds (0 divergences); D3 drift CLEAN
   (first divergence day ≥ first-lever-day on every seed, where
   first-lever-day = first world-tick v4 seed row on the ON leg — a
   valid conservative bound for the SCOPED gate, which cannot act
   before a wave-4 plan exists); `check.js --quick` attempted after
   the instrument change and its result reported honestly (a killed
   incomplete run is recorded as incomplete, never as green);
   balanced panel §15 built off→on and attached
   (`profilegate4-confirm-b-panel.{json,md}` + before/after
   `.json.gz`). Corpus anchors: every file on every leg stamps
   `df4867134afa`. File counts 16/16/16/16, 0 instrument errors,
   classified share ≥ 0.9, unknown 0.

Verdict is GO iff B1 + B2 + B3 + B5 all pass. B4 is reported either way.

## Instrument (ADAPT the pilot's, do not rebuild)

New files (profilegate4-confirm-b names — the pilot's instrument stays
as the record on master):

- **Driver:** `scripts/profilegate4-confirm-b-driver-20261121.js` — a
  copy of `scripts/profilegate4-driver-20261121.js` with these deltas,
  all recorded here: (a) names `profilegate4-confirm-b` /
  `perseed-profilegate4-confirm-b-<leg>` /
  `profilegate4-confirm-b-s<seed>-profilegate4-confirm-b-<leg>.json`,
  recorder flag `PROFILEGATE4_RECORDER` (unchanged), loadGame mode
  `'profilegate4-' + MODE` (unchanged label); (b) band 106751–106766
  in the header/usage examples; (c) nothing else — the scoped
  poolReplica, the dawn-scoring hook, `v4seeds` / `v4departs` /
  `v4gates` / `v4encounters` wraps, `dawnbidCensus`, the `vetSays`
  capture, the skip recorder — are the pilot instrument verbatim.
- **Analyzer:** `scripts/analyze-profilegate4-confirm-b.js` — a copy
  of `scripts/analyze-profilegate4-b.js` with these deltas: (a) names
  `profilegate4-confirm-b` / `profilegate4-confirm-b-analysis.json`;
  (b) `ANCHOR12 = 'df4867134afa'` (12 chars — the 9-vs-12 fix);
  (c) B5 file counts 8 → 16 in `computeBars`; (d) everything else —
  the needWave>=4 pool-shape B1, B2/B3/B4 shape, anchor + substrate
  report — verbatim.
- **Drift check:** `scripts/profilegate4-confirm-b-drift-check.js` —
  copy of `scripts/profilegate4-drift-check.js`, header only;
  first-lever-day = first world-tick seed row on the ON leg
  (fallback first companion2 depart). Valid for the scoped gate by
  construction (see B5).
- **Panel builder:** `scripts/build-profilegate4-confirm-b-panels-20261121.js` —
  copy of the pilot panel builder, profilegate4-confirm-b names;
  before=`off`, after=`on` (the LEVER contrast); default seeds
  106751–106766. Panel is the instrument, NOT the judge.
- **Proof test:** `scripts/test-profilegate4-confirm-b.js` — copy of
  `scripts/test-profilegate4-b.js` with these deltas: (a) names /
  requires / corpus dirs / fixture seed 106764 (corrected — see
  CORRECTION below) / anchor
  `df4867134afa` (12 chars; F5 fixtures use the real full hash
  `df4867134afaf556232c4a7c377a4595b644a55c`); (b) F4 file-count
  fixtures 8 → 16; (c) the static section is RESHAPED for a
  no-src-change arm: the src/ diff vs the frozen base must be EMPTY
  (the lever is already on master at the base) — the old "diff is
  exactly the two twins" check and the lever-site hunk check are
  replaced, while the lever-presence CONTENT checks (scoped gate line,
  env gate, scope helper, parent flag not reused, depart bypass
  landed, `winPlanSecondCompanion` still profile-open, seeding gate
  and `expeditionCand` NOT widened, PINQUAD blocks untouched) are
  retained verbatim. Fixture staging follows the local_proof_of_effect
  rule: the staged holder + companion carry encounter gear (armed +
  armored), and the gear is recorded beside the encounter average it
  claims to match in the proof header. Proofs must demonstrate the
  OBSERVABLE effect (companions actually picked/launched), not just
  green assertions.

## Legs (four, one band, one driver). ALL legs carry the full substrate
(SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FIGHTALLY2=1 ALLYSLOT3=1
LAUNCHSURVIVE=1); "OFF" means the PROFILEGATE4 flag off, not master
default:

| Leg | PROFILEGATE4 | Recorder | Role |
| --- | --- | --- | --- |
| `off` | unset | ON | **Control.** Old gate on the fresh band. |
| `on` | `1` | ON | **Judged leg.** Scoped gate (wave-4+ only). |
| `rec` | `1` | OFF | D2 full-band neutrality vs `on`. |
| `rec0` | unset | OFF | D2 full-band neutrality vs `off`. |

## Sense-testing (SENSE-TESTING LAW)

Read transcripts. Quote real `vetSays` lines and at least one
launch-adjacent scene the corpus carries (a holder bidding with a
forager companion on a wave-4+ plan, or a homebody picked at dawn who
cannot launch). Judge meaning, coherence, consequences — never just
counts. Note specifically whether a forager companion walking the road
reads as a person choosing to go (not a roster slot filling), and
whether the fiction says anything when a picked homebody stays home.
The evidence carries a "metric review" section.

## Instrument limitations (pre-registered, not hidden)

1. The `members` snapshot is read AFTER the real `vbrainScorePick` call
   returns (pilot hook shape) — a same-tick departure between the
   scorer's `findCompanion` read and the replica's read would show as
   a replica/real disagreement on the `agree` field; any `agree: false`
   row is investigated by hand and named.
2. The OFF leg's pool rows are scored with the OLD gate and the ON leg's
   with the NEW gate — the replica is flag- AND scope-aware by
   construction, so a pool row's `eligible` means "eligible under the
   leg's gate for this holder's plan", and the analyzer's
   would-be-notRanger count (from member profiles) is what makes the
   two legs' pools comparable. Pool rows whose holder plan has
   needWave < 4 are scored with the old gate on BOTH legs (the scope
   is closed there by construction).
3. Damage-share derivation reads the fight log's first strike line;
   if a monster heals before the first strike lands, the derived max HP
   understates the true max and the share overstates — the fallback
   (hp-range midpoint) and the per-meeting table make the derivation
   auditable.
4. Sixteen seeds is a confirm, not a census. A residual B3 edge on 16
   seeds is still a small-sample cost signal, not a proof of harm —
   but the frozen bar judges it either way.
5. The host write flap: at pilot freeze time (2026-11-21 ~12:15 UTC)
   host ref writes failed while plain file writes usually succeeded;
   the 1430Z round reported no EPERM block on any commit. Flap state
   at THIS freeze was not probed; no commit is attempted before the
   judged legs (the anchor rule keeps the corpora valid regardless),
   and the commit outcome is reported at closeout.

## Files

- Prereg: `evidence/2026-11-21/sim-profilegate-confirm-b-prereg.md` (this file)
- Lever: NONE in this arm (already on master, commit `84e57fcc3`)
- Instrument: `scripts/profilegate4-confirm-b-driver-20261121.js`,
  `scripts/analyze-profilegate4-confirm-b.js`,
  `scripts/profilegate4-confirm-b-drift-check.js`,
  `scripts/build-profilegate4-confirm-b-panels-20261121.js`,
  `scripts/test-profilegate4-confirm-b.js`
- Corpora: `evidence/2026-11-21/perseed-profilegate4-confirm-b-off/`,
  `perseed-profilegate4-confirm-b-on/`, `perseed-profilegate4-confirm-b-rec/`,
  `perseed-profilegate4-confirm-b-rec0/` (16 files each)
- Analysis: `evidence/2026-11-21/profilegate4-confirm-b-analysis.json`
- Panel: `evidence/2026-11-21/profilegate4-confirm-b-panel.{json,md}` (+ before/after `.json.gz`)
- Evidence: `evidence/2026-11-21/sim-profilegate-confirm-b.md`
- Disposition if NO-GO: no src/ change to revert (leave the instrument
  + evidence); the default flip stays unmade and the NO-GO is reported
  with the B3 numbers that decided it.

## CORRECTION 2026-11-21 ~16:25 UTC (before any judged leg — instrument check only)

**Fixture seed changed: 106757 → 106764.** The first proof run (70/75)
failed the live gate-act check on the frozen seed 106757: its ON leg
scores only 1 wave-4+ dawn in 150d (meanEligible 1.0), so the
single-seed meanEligible ≥ 1.5 clause is a one-dawn lottery — the gate
did act on that dawn (1 eligible, emptyShare 0), but one dawn cannot
demonstrate a fill. The frozen seed was chosen on its OFF leg alone;
its ON leg diverges so hard that the v4 population nearly vanishes.
106764 was named in this prereg as an alternate and was probed live on
BOTH legs before this correction (script `/tmp/probe-pg4confirm-on.js`,
in-process, no writes): OFF 28 v4 dawns / 19 empty, ON 26 v4 dawns /
0 empty, meanEligible 2.808 — the gate-act contrast is demonstrated on
both legs. 106751 was also probed ON (16 v4, 2 empty, mean 2.125) and
stays an alternate. The frozen BARS B1–B5 are unchanged; only the
instrument check's fixture seed changes. No judged leg had run when
this correction was written.

**Second fix in the same proof run (instrument wiring, not a bar):**
the first proof run also failed the scripts-union check (2 of 5 files)
because the sed rename missed three filenames that contain no
`profilegate4-b` substring (`profilegate4-driver-20261121.js`,
`profilegate4-drift-check.js`, `build-profilegate4-panels-20261121.js`).
The proof test's requires and EXPECTED_SCRIPTS still pointed at the
PILOT driver and the old names — so the gate fixture, D1/D2, and
gate-act ran against the pilot driver module, and the driver's own
`firstCallerFrame` filter missed its own frames. Fixed by renaming
those references to the `-confirm-b` files; the confirm driver is
functionally identical to the pilot driver (names/labels only), but
the proof must prove the CONFIRM instrument. No bar changed.
