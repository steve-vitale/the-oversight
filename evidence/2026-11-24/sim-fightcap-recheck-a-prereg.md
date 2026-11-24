# sim-fightcap-recheck-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-fightcap-recheck-a · **Loop A run:** fleshout-20261124T1515Z
**Axis:** scale-onramp · **Type:** DIAG RECHECK of the wave-4 fight
(findings #2538/#2544).
**Frozen:** 2026-11-24 ~16:55 UTC, before any judged sim.
**Branch:** `sim-fightcap-recheck-a` (worktree
`~/workspace/worktrees/sim-fightcap-recheck-a`).
**Base:** master `8616c6b2f615468e714ed1147f7ea33b8e9679f7`
(journey-scale r283 closeout addendum; includes Loop B's w5lateface-b
evidence landing `9810670a0`).

**Question:** do launched parties still lose ~82% of engaged wave-4
meetings and kill ~6% on current master? The numbers to recheck
(read, not re-derived):
- fightcap-a, `evidence/2026-11-18/sim-fightcap-a.md`: combined arm
  pair-inclusive n=34, wins 6, **kill share 0.059**; loss share
  0.824 (28/34); damage/round ladder vKill ~111 / vFlee ~61 /
  vDie ~40 vs ~1200 HP monsters; parties flee at ~5 rounds; gate
  `avoid` 0 among 28 arm losses.
- fightcap-b, `evidence/2026-11-19/sim-fightcap-b.md`: ALLYSLOT3
  3rd-ally slot NO-GO, 0 kills in 18 joined quad meetings.
- dmgshape-b, `evidence/2026-11-20/sim-dmgshape-b.md`: NO-GO
  METRIC-BROKEN — classification 3/9; zero-damage fights from the
  contradict counter-trick and holders dying before striking cannot
  be priced by that decomposition.

## Substrate — pinned in code, verified before this prereg

Current-master substrate (both legs carry exactly these flags unless
noted; the legs differ ONLY by SENSEEXPED):

| Flag | State on current master | This run |
|---|---|---|
| SENSEEXPED | Code ON master (`97e78670d` sim-senseexped-b, finding #2583); env-gated in `src/js/party-wiring.js:103` (`=== '1'`) | **ctl unset, arm =1** — the leg difference |
| VETREENGAGE | Env-gated `src/js/villager-brain.js:266,1430` | =1 both legs |
| PARTYSIZE4 | Env-gated `src/js/villager-brain.js:282,1446` | =1 both legs |
| FLEEREPAIR2 | Env-gated `src/js/win-plan.js:304-309` | =1 both legs |
| FIGHTALLY2 | Env-gated `src/js/fieldFights.js:1395` | =1 both legs |
| ALLYSLOT3 | Code LANDED on master (`fieldFights.js` ally3Vid, `party-wiring.js:195`, `game.js:21462`), env-gated | **unset BOTH legs** — matches the Nov 18 substrate; the slot is a separate lever, already judged NO-GO (fightcap-b), and must not confound this recheck |
| LAUNCHPARTY | **DEAD** — 0 hits in `src/js/` (verified 2026-11-24) | nowhere; the Nov 18 HELD sense fix is superseded by SENSEEXPED on master |
| PINQUAD | Live in code, NOT env-gated (`pinnedQuadAllies` in `party-wiring.js:142`, `fieldFights.js`, `villager-agency.js`) — a sense change since Nov 18-20 | part of current-master substrate, recorded not controlled |

This baseline is the CURRENT-master substrate, NOT the Nov 18 HELD
sense-fix substrate. The Nov 18 arm leg (HELD sense fix +
LAUNCHPARTY=1) has no current-master equivalent except SENSEEXPED=1;
the ctl leg (old sense) is SENSEEXPED unset on the same code.

## Instrument (port, minimal)

- Driver: `scripts/fightcap-driver-recheck-a.js` — a minimal port of
  `scripts/fightcap-driver-b.js` (the current fightcap driver): the
  MODE guard now keys on SENSEEXPED (ctl ⟺ unset, arm ⟺ =1);
  ALLYSLOT3=1 is refused on BOTH legs; SENSEEXPED code presence is
  required on both legs; the ALLYSLOT3 lever-presence gate is
  dropped (recorded as a corpus flag only); outDir
  `evidence/2026-11-24/<OUTDIR>`, file prefix `fightcap-recheck-a`,
  `arm: 'fightcap-recheck-a'`; own-frame skip filename updated.
  Recorder unchanged (v4encounters/v4gates/v4departs/v4seeds,
  SEEDLAND hard-on, wave ≥ 4). LAUNCHSURVIVE unset (no tracker),
  as in fightcap-b.
- Analyzer: `scripts/analyze-fightcap-a.js` UNCHANGED
  (`--selftest` 20/20, verified 2026-11-24). Note on finding #2570:
  the corrected join there is the allyslot3 analyzer's
  fighter-anchored best-match join over overlapping quad launches
  in a 21-day window; this analyzer joins each encounter to its
  gate row (same day+vid+mid, first match) and to planParty — a
  different join, not the #2570 defect. Quad populations are not
  judged here (ALLYSLOT3 off).
- Panel: `scripts/build-fightcap-panels-a.js` with `--before` /
  `--after` / `--out` args (no port; defaults point at the Nov 18
  corpora) + `node scripts/balance-panel.js compare`.
- Proof test: `scripts/test-fightcap-recheck-a.js` — (a) ported
  driver MODE-guard checks (ctl/arm SENSEEXPED mapping, ALLYSLOT3
  refusal, substrate-flag requirements); (b) analyzer regression:
  the Nov 18 frozen corpora reproduce (arm pair-inclusive n=22,
  wins 4, kills 2; ctl n=4, wins 0); (c) driver smoke: one 30d
  ctl seed, exit 0, 0 instrument errors, flags self-describe
  (anchor recorded, NOT pinned to a commit — the fightcap-b §C
  pin broke on rebase; the test asserts a 40-hex anchor).

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

**"Still holds" tolerance (frozen):** the Nov 18-20 picture is
unchanged iff arm kill share ∈ [0, 0.16] (Nov 18: 0.059, ±0.10)
AND loss share ∈ [0.72, 0.92] (Nov 18: 0.824, ±0.10) AND the
vFlee damage/round sits in [36, 86] (Nov 18: ~61, ±25). Outside
any of these, the picture MOVED.

**Cost bars (binding guardrails, same as fightcap-a):**
community loss (endReason village-lost / village-dead / pop-zero)
arm share ≤ ctl share + 0.125; starvation arm ≤ ctl + 2 (totals
AND villager-only); median survival arm ≥ 0.8 × ctl median.
Instrument errors 0 on all per-seed files.

**Verdict ladder (frozen):**
- **DIAG-GO:** pair-inclusive n ≥ 10 AND full classification (every
  engaged meeting classified — see below) AND the decomposition is
  complete (kill share + damage ladder + gate crosstab computed, 0
  instrument errors) → the recheck answers the question; the
  verdict states whether the picture still holds (tolerance above)
  or moved.
- **DIAG-NO-GO:** pair-inclusive n < 10, or any engaged meeting
  unclassified, or instrument errors > 0 → the question stays open;
  report why (thin pool / metric-broken / instrument).
- Cost bars are reported with the verdict; a cost-bar fail is
  reported as a same-run investigation item, not a silent pass.

**Confirm gate:** 12–16 seeds ONLY if the pilot shows the picture
changed materially vs Nov 18-20 (kill share, damage/round ladder,
or gate behavior moved outside the tolerance above — e.g. gate
`avoid` > 0 among losses where Nov 18 had 0). Otherwise
pilot-only DIAG with the recheck verdict. The coordinator decides.

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

- **Horizon:** 150d, death-aware (same as Nov 18-20, for
  comparability). Dead villages stop simulating (+10d tail max).
- **Seeds (fresh 8-seed pilot band): 110101, 110102, 110103, 110104,
  110105, 110106, 110107, 110108.** Freshness check (skill
  local_seed_band_freshness): `grep -rn "11010[1-8]" evidence/
  --include="*.md"` — 0 hits; `find evidence -name "*11010*"` —
  one file, `nighttravel-b-insideevening-s11010.json` (seed 11010,
  not this band); the two JSON content matches for the bare
  digit strings are `1101028433` (epoch) and `110105403393284`
  (an id), not seeds. Recently used bands avoided:
  104401-104608, 106181-106188, 107301-107648, 109201-109432.
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

## What this recheck does NOT judge

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
