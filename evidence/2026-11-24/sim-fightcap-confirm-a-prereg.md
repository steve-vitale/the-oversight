# sim-fightcap-confirm-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-fightcap-confirm-a · **Loop A run:** fleshout-20261124T1815Z
**Axis:** scale-onramp · **Type:** DIAG CONFIRM of the wave-4 fight
(findings #2538/#2544), named #1 next blank from
`evidence/2026-11-24/sim-scale-onramp-round-1715.md` and
`evidence/2026-11-24/sim-fightcap-recheck-a.md`.
**Frozen:** 2026-11-24 ~18:33 UTC, before any judged sim.
**Branch:** `sim-fightcap-confirm-a` (worktree
`~/workspace/worktrees/sim-fightcap-confirm-a`).
**Base:** master `c78100ff4` (sim-winnability-round-1430 adoption
closeout; includes the 1715Z round's fightcap-recheck-a +
bowopen-recheck-a merges).

## Question (to settle, not re-derive)

The recheck (`evidence/2026-11-24/sim-fightcap-recheck-a.md`,
8-seed pilot band 110101–110108, 150d, competent verbatim) found,
on a thin pool: arm leg (SENSEEXPED=1) pair-inclusive n=9 (one
short of the frozen floor of 10), kill share 0/9, loss share 9/9
= 1.000 (outside frozen tolerance [0.72, 0.92]), vFlee
damage/round 45.3 (inside [36, 86]). Cost bar FAIL: community
loss arm 6/8 vs ctl 2/8, no mechanism found — the four
best-scaling ctl villages all village-lost in the arm leg.
Verdict was DIAG-NO-GO on the thin pool. This confirm must settle
three things at once: the pool floor, the loss-share move, and
the community-loss excess.

## Substrate — pinned in code, carried from the recheck

Same current-master substrate as the recheck (both legs carry
exactly these flags unless noted; the legs differ ONLY by
SENSEEXPED):

| Flag | State | This run |
|---|---|---|
| SENSEEXPED | Code ON master (`97e78670d` sim-senseexped-b, finding #2583); env-gated in `src/js/party-wiring.js:103` (`=== '1'`) | **ctl unset, arm =1** — the leg difference |
| VETREENGAGE | Env-gated `src/js/villager-brain.js:266,1430` | =1 both legs |
| PARTYSIZE4 | Env-gated `src/js/villager-brain.js:282,1446` | =1 both legs |
| FLEEREPAIR2 | Env-gated `src/js/win-plan.js:304-309` | =1 both legs |
| FIGHTALLY2 | Env-gated `src/js/fieldFights.js:1395` | =1 both legs |
| ALLYSLOT3 | Code LANDED on master, env-gated | **unset BOTH legs** — matches the Nov 18 substrate; separate lever, already judged NO-GO (fightcap-b), must not confound this confirm |
| LAUNCHPARTY | **DEAD** — 0 hits in `src/js/` (verified 2026-11-24) | nowhere |
| PINQUAD | Live in code, NOT env-gated (`pinnedQuadAllies` in `party-wiring.js:142`, `fieldFights.js`, `villager-agency.js`) | part of current-master substrate, recorded not controlled |

## Instrument (port, minimal)

- Driver: `scripts/fightcap-driver-confirm-a.js` — a minimal port
  of `scripts/fightcap-driver-recheck-a.js`: new prefix/run/policy
  (`fightcap-confirm-a`), MODE guard unchanged (keys on
  SENSEEXPED; ALLYSLOT3=1 refused on BOTH legs; SENSEEXPED code
  presence required on both legs); outDir
  `evidence/2026-11-24/<OUTDIR>`, file prefix
  `fightcap-confirm-a`, `arm: 'fightcap-confirm-a'`; own-frame
  skip filename updated. Recorder unchanged
  (v4encounters/v4gates/v4departs/v4seeds, SEEDLAND hard-on,
  wave ≥ 4). LAUNCHSURVIVE unset (no tracker), as in the recheck.
- Analyzer: `scripts/analyze-fightcap-a.js` UNCHANGED
  (`--selftest` 20/20, verified 2026-11-24 by the recheck).
- Zero-damage classifier: `scripts/analyze-zerodmg-recheck-a.js`
  reused as-is (it reads only the analysis JSON; no corpus paths).
- Panel: `scripts/build-fightcap-panels-a.js` with `--prefix /
  --run / --policy / --origin` args (already present from the
  recheck port) + `node scripts/balance-panel.js compare`.
  Behavior-preservation proof: with defaults, the Nov 18 panels
  still reproduce byte-identical (re-verified by this run's proof
  test §E).
- Proof test: `scripts/test-fightcap-confirm-a.js` — port of
  `scripts/test-fightcap-recheck-a.js`: (a) driver MODE-guard
  checks (ctl/arm SENSEEXPED mapping, ALLYSLOT3 refusal,
  substrate-flag requirements); (b) analyzer regression: the Nov
  18 frozen corpora reproduce (arm pair-inclusive n=22, wins 4,
  kills 2; ctl n=4, wins 0); (c) driver smoke: one 30d ctl seed
  + one 1d arm seed, exit 0, 0 instrument errors, flags
  self-describe (anchor recorded, NOT pinned to a commit); (d)
  zero-dmg classifier §D (Nov 18 arm pair 20 strike / 2
  other-zero-damage / 0 unclassified); (e) panel builder with
  defaults reproduces the Nov 18 panels byte-identical
  (decompressed JSON equality on both legs, same contract digest).

## Primary metric (BINDING, §14)

**Kill share on pair-inclusive engaged launched meetings (arm leg)**,
per the fightcap-a analyzer: v4encounters row with origin
`expedition`, wave ≥ 4, joined to its v4gates row (same day+vid+mid,
first match) with a non-empty planParty, |planParty| ≥ 1, launched
party PRESENT (piecewise presence rule), ENGAGED (rounds > 0).
Kill share = vKill / n. Win share (vKill + mFlee) / n and the trio+
population (|planParty| ≥ 2) are reported beside it, never
substituted. The damage/round ladder (vKill / vFlee / vDie) and the
gate × outcome crosstab are reported with it.

**"Still holds" tolerance (frozen, carried from the recheck):**
the Nov 18-20 picture is unchanged iff arm kill share ∈ [0, 0.16]
(Nov 18: 0.059, ±0.10) AND loss share within its widened band
(below) AND the vFlee damage/round sits in [36, 86] (Nov 18:
~61, ±25). Outside any of these, the picture MOVED.

**Loss-share tolerance — ADOPTED (one of the two options in the
recheck's metric review §14 item 2): the tolerance is WIDENED to
±0.15.** Arm loss share must sit in [0.674, 0.974] (Nov 18:
0.824 ± 0.15). The original [0.72, 0.92] bar is reported
alongside for comparability, and the pooled pair-n loss share
(arm + ctl combined) is reported as context — neither is the
judge; the widened ±0.15 band on the arm leg is. Rationale: at
pilot scale the ±0.10 band was one meeting wide (8/9 inside,
9/9 outside); at n≈16–20 the ±0.15 band is ~2–3 meetings wide
and no longer flips on a single meeting.

**Cost bars (binding guardrails, identical to the recheck):**
community loss (endReason village-lost / village-dead / pop-zero)
arm share ≤ ctl share + 0.125; starvation arm ≤ ctl + 2 (totals
AND villager-only); median survival arm ≥ 0.8 × ctl median.
Instrument errors 0 on all per-seed files.

**Verdict ladder (frozen):**
- **DIAG-GO:** pair-inclusive n ≥ 10 (arm leg) AND full
  classification (every engaged meeting classified — see below)
  AND the decomposition is complete (kill share + damage ladder +
  gate crosstab computed, 0 instrument errors) → the confirm
  answers the question; the verdict states whether the picture
  still holds (tolerance above) or moved.
- **DIAG-NO-GO:** pair-inclusive n < 10, or any engaged meeting
  unclassified, or instrument errors > 0 → the question stays
  open; report why (thin pool / metric-broken / instrument).
- Cost bars are reported with the verdict; a cost-bar fail is
  reported as a same-run investigation item, not a silent pass.

**Analyzer-label discrepancy — RESOLVED HERE, explicitly:**
`scripts/analyze-fightcap-a.js` prints DIAG-GO/THIN-POOL when
the pool is thin (its `judge()` returns DIAG-GO whenever the
pool floor fails, meaning "diagnostic only, thin pool"). That
label does **not** satisfy this prereg; judge by the numbers,
never by the label. DIAG-GO requires arm-leg pair-inclusive
n ≥ 10 per the ladder above, whatever the analyzer prints.
(Analyzer-label fix is filed as a separate finding; this prereg
does not re-score to match the label.)

## Zero-damage classification (the dmgshape lesson, frozen)

Every engaged pair-inclusive meeting with mDealt == 0 carries an
explicit subclass, computed from the corpus rows + encounter logs,
reported in the evidence table — never silently pooled:
- `contradict-counterplay`: log lines name contradicting the
  narration / working the trick (the Eulogy's authored counter).
- `died-before-strike`: outcome vDie, rounds ≤ 2, no strike lines
  in the log (holder fired an ability or nothing, then died).
- `other-zero-damage`: any remaining 0-damage engaged meeting,
  named individually.
A meeting whose subclass cannot be determined from the corpus is
UNCLASSIFIED and fails the DIAG-GO classification bar.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as Nov 18-20 and the
  recheck, for comparability). Dead villages stop simulating
  (+10d tail max).
- **Seeds (fresh 16-seed band): 110301, 110302, 110303, 110304,
  110305, 110306, 110307, 110308, 110309, 110310, 110311, 110312,
  110313, 110314, 110315, 110316.** Freshness check (skill
  local_seed_band_freshness): `grep -w` each seed over
  `evidence/ --include="*.md"` — 0 hits for all 16; `find
  evidence -name "*11030*" -o -name "*11031*"` — only 5-digit
  seeds 11030/11031 (nighttravel corpora), not this band; no
  `"seed":11030` in `evidence/2026-11-24/*.json`. Recently used
  bands avoided: 104401–104608, 106181–106188, 107301–107648,
  109201–109432, 110101–110108, 110201–110208.
- **Policies:** competent verbatim. **Legs:** ctl = SENSEEXPED
  unset; arm = SENSEEXPED=1; shared substrate VETREENGAGE=1 +
  PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1, ALLYSLOT3 unset.
  The driver asserts the flag matches the MODE label and each
  corpus file records `senseexpedFlag` + `allyslot3Flag` +
  `senseexpedPresent` + brainSha + anchorCommit.
- **Wall numbers (reported every run):** national / table / wins,
  wave-4 and wave-5 unlocks, median survival, death-cause shares,
  per leg. Table: not instrumented by this driver — reported as
  null, never faked.
- **§15 panel:** `scripts/build-fightcap-panels-a.js` +
  `node scripts/balance-panel.js compare`; the compare `.md` is
  attached to the evidence file. The panel is the instrument, the
  frozen bars above are the judge.

## Sense testing

Read 2 won + 2 lost fight transcripts in full (won = vKill
preferred; if the band has no vKill, read 2 mFlee + 2 lost and say
so plainly). Judge meaning, coherence, relevance, consequences —
never just counts. Note whether the fightcap-a §11 recorder gaps
still bite (mHpStart null on vKill; encounter-log 20-line cap;
per-fighter attribution gaps).

## What this confirm does NOT judge

- No game-code lever is landed. If the decomposition names a
  concrete next arm, the evidence says which; the next arm builds
  it.
- The 4th seat (ALLYSLOT3 off on both legs) — out of scope.
- The rounds=0 "vKill" rows (mHpStart null, mDealt ~12–27) are
  excluded by the engaged filter (rounds > 0), as in fightcap-a.
- No `check.js` gate is run (no src/ change; driver + analyzer +
  proof test only). The proof test + analyzer selftest are the
  gate for this arm.

## Canon note

`docs/CANON.md` (manifest) and `docs/MONSTER-WAVES.md` were read
for this arm. MONSTER-WAVES.md: wave-4 bands are damage 35–95, HP
850–1500, pierce 0.2–0.5 — "a 4–6 round fight for a godhood build
(~220 dmg/round)". The decomposition's damage yardstick comes from
that canon band, not from invention. No canon doc covers the sim
recorder or the villager launch party — said here rather than
inventing canon. The launch mechanics are cited from code
(`win-plan.js`, `villager-agency.js`, `party-wiring.js`, `game.js`,
`fieldFights.js`), not from canon.
